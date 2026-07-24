import { NextResponse } from "next/server";

import { getAdminIdentity } from "@/lib/auth";
import {
  assetRetentionDeadline,
  cleanupExpiredCmsAssets,
} from "@/lib/cms/assets";
import { isDatabaseConfigured, isSupabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const acceptedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function validPagePath(path: string) {
  return /^\/(en|fr)(\/(services|projects|team|contact))?$/.test(path);
}

function validPublicUrl(value: string, storagePath: string) {
  try {
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!projectUrl) return false;

    const url = new URL(value);
    const expectedOrigin = new URL(projectUrl).origin;
    const expectedPath = `/storage/v1/object/public/site-media/${storagePath}`;
    return (
      url.origin === expectedOrigin &&
      decodeURIComponent(url.pathname) === expectedPath
    );
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ assets: [] });
  }

  await cleanupExpiredCmsAssets().catch(() => undefined);

  const assets = await getPrisma().cmsAsset.findMany({
    where: {
      OR: [
        { retainedUntil: null },
        { retainedUntil: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 250,
    select: {
      id: true,
      fileName: true,
      storagePath: true,
      publicUrl: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    assets: assets.map((asset) => ({
      ...asset,
      createdAt: asset.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Media storage is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    pagePath?: unknown;
    fieldKey?: unknown;
    fileName?: unknown;
    storagePath?: unknown;
    publicUrl?: unknown;
    mimeType?: unknown;
    size?: unknown;
  } | null;

  const pagePath = typeof body?.pagePath === "string" ? body.pagePath : "";
  const fieldKey = typeof body?.fieldKey === "string" ? body.fieldKey : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const storagePath =
    typeof body?.storagePath === "string" ? body.storagePath : "";
  const publicUrl = typeof body?.publicUrl === "string" ? body.publicUrl : "";
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";
  const size = typeof body?.size === "number" ? body.size : -1;

  if (
    !validPagePath(pagePath) ||
    !fieldKey ||
    fieldKey.length > 500 ||
    !fileName ||
    fileName.length > 255 ||
    !storagePath ||
    !storagePath.startsWith(`${pagePath.split("/")[1]}/`) ||
    !acceptedTypes.has(mimeType) ||
    size < 0 ||
    size > 50 * 1024 * 1024 ||
    !validPublicUrl(publicUrl, storagePath)
  ) {
    return NextResponse.json({ error: "Invalid media record." }, { status: 400 });
  }

  const locale = pagePath.split("/")[1]!;
  const prisma = getPrisma();
  const page = await prisma.cmsPage.upsert({
    where: { path: pagePath },
    update: {},
    create: { path: pagePath, locale },
  });
  const asset = await prisma.cmsAsset.upsert({
    where: { storagePath },
    update: {
      pageId: page.id,
      fieldKey,
      fileName,
      publicUrl,
      mimeType,
      size,
      uploadedBy: identity.email,
      retainedUntil: assetRetentionDeadline(),
    },
    create: {
      pageId: page.id,
      fieldKey,
      fileName,
      storagePath,
      publicUrl,
      mimeType,
      size,
      uploadedBy: identity.email,
      retainedUntil: assetRetentionDeadline(),
    },
  });

  return NextResponse.json({
    asset: {
      id: asset.id,
      fileName: asset.fileName,
      storagePath: asset.storagePath,
      publicUrl: asset.publicUrl,
      mimeType: asset.mimeType,
      size: asset.size,
      createdAt: asset.createdAt.toISOString(),
    },
  });
}
