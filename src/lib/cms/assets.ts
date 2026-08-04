import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { referencedFieldKeys } from "@/lib/cms/asset-references";
import { getPrisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RETENTION_DAYS = 30;
const CLEANUP_BATCH_SIZE = 100;

export function assetRetentionDeadline(from = new Date()) {
  return new Date(from.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export async function reconcilePageAssets(
  transaction: Prisma.TransactionClient,
  pageId: string,
  draftContent: unknown,
  publishedContent: unknown,
) {
  const assets = await transaction.cmsAsset.findMany({
    select: {
      id: true,
      publicUrl: true,
      pageId: true,
      retainedUntil: true,
    },
  });
  const usages = assets.flatMap((asset) => {
    const draftFields = referencedFieldKeys(draftContent, asset.publicUrl);
    const publishedFields = referencedFieldKeys(publishedContent, asset.publicUrl);
    const fields = new Set([...draftFields, ...publishedFields]);
    return Array.from(fields, (fieldKey) => ({
      assetId: asset.id,
      pageId,
      fieldKey,
      inDraft: draftFields.includes(fieldKey),
      inPublished: publishedFields.includes(fieldKey),
    }));
  });

  await transaction.cmsAssetUsage.deleteMany({ where: { pageId } });
  if (usages.length) {
    await transaction.cmsAssetUsage.createMany({ data: usages });
  }

  const globallyReferenced = await transaction.cmsAssetUsage.findMany({
    distinct: ["assetId"],
    select: { assetId: true },
  });
  const activeIds = globallyReferenced.map((usage) => usage.assetId);
  const activeIdSet = new Set(activeIds);
  const newlyRetainedIds = assets
    .filter(
      (asset) =>
        asset.pageId !== null &&
        !activeIdSet.has(asset.id) &&
        !asset.retainedUntil,
    )
    .map((asset) => asset.id);

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
    where: {
      retainedUntil: { lte: new Date() },
      usages: { none: {} },
    },
    orderBy: { retainedUntil: "asc" },
    take: CLEANUP_BATCH_SIZE,
    select: {
      id: true,
      publicUrl: true,
      storagePath: true,
    },
  });

  if (!expired.length) return 0;

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
  const preserved = expired.filter((asset) =>
    referencedContent.includes(asset.publicUrl),
  );

  if (preserved.length) {
    await prisma.cmsAsset.updateMany({
      where: { id: { in: preserved.map((asset) => asset.id) } },
      data: { lastReferencedAt: new Date(), retainedUntil: null },
    });
  }

  if (!removable.length) return 0;

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

  return removable.length;
}
