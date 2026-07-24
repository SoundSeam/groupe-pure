import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RETENTION_DAYS = 30;
const CLEANUP_BATCH_SIZE = 100;

export function assetRetentionDeadline(from = new Date()) {
  return new Date(from.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

function referencesUrl(content: unknown, url: string) {
  return JSON.stringify(content).includes(url);
}

export async function reconcilePageAssets(
  transaction: Prisma.TransactionClient,
  pageId: string,
  draftContent: unknown,
  publishedContent: unknown,
) {
  const assets = await transaction.cmsAsset.findMany({
    where: { pageId },
    select: {
      id: true,
      publicUrl: true,
      retainedUntil: true,
    },
  });
  const activeIds: string[] = [];
  const newlyRetainedIds: string[] = [];

  assets.forEach((asset) => {
    if (
      referencesUrl(draftContent, asset.publicUrl) ||
      referencesUrl(publishedContent, asset.publicUrl)
    ) {
      activeIds.push(asset.id);
    } else if (!asset.retainedUntil) {
      newlyRetainedIds.push(asset.id);
    }
  });

  const now = new Date();
  await Promise.all([
    activeIds.length
      ? transaction.cmsAsset.updateMany({
          where: { id: { in: activeIds } },
          data: {
            lastReferencedAt: now,
            retainedUntil: null,
          },
        })
      : null,
    newlyRetainedIds.length
      ? transaction.cmsAsset.updateMany({
          where: { id: { in: newlyRetainedIds } },
          data: { retainedUntil: assetRetentionDeadline(now) },
        })
      : null,
  ]);
}

export async function cleanupExpiredCmsAssets() {
  const prisma = getPrisma();
  const expired = await prisma.cmsAsset.findMany({
    where: { retainedUntil: { lte: new Date() } },
    orderBy: { retainedUntil: "asc" },
    take: CLEANUP_BATCH_SIZE,
    select: {
      id: true,
      publicUrl: true,
      storagePath: true,
    },
  });

  if (!expired.length) return;

  const pages = await prisma.cmsPage.findMany({
    select: {
      draftContent: true,
      publishedContent: true,
    },
  });
  const referencedContent = JSON.stringify(pages);
  const removable = expired.filter(
    (asset) => !referencedContent.includes(asset.publicUrl),
  );

  if (!removable.length) return;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from("site-media")
    .remove(removable.map((asset) => asset.storagePath));

  if (error) {
    throw new Error(`Expired media cleanup failed: ${error.message}`);
  }

  await prisma.cmsAsset.deleteMany({
    where: { id: { in: removable.map((asset) => asset.id) } },
  });
}
