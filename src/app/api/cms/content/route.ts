import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { getAdminIdentity } from "@/lib/auth";
import { reconcilePageAssets } from "@/lib/cms/assets";
import type { CmsContent, CmsPagePayload } from "@/lib/cms/types";
import { isCmsContent } from "@/lib/cms/types";
import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const sharedRoutes = new Set(["services", "projects", "team"]);

function normalizePagePath(value: unknown) {
  const path = typeof value === "string" ? value : "";
  return /^\/(en|fr)(\/(services|projects|team|contact))?$/.test(
    path,
  )
    ? path
    : null;
}

function sharedPathFor(path: string) {
  const [, locale, route = ""] = path.split("/");
  return sharedRoutes.has(route) ? `/_shared/${locale}/cta` : null;
}

function splitContent(content: CmsContent) {
  const pageContent: CmsContent = {};
  const sharedContent: CmsContent = {};

  Object.entries(content).forEach(([key, value]) => {
    (key.startsWith("shared:") ? sharedContent : pageContent)[key] = value;
  });

  return { pageContent, sharedContent };
}

function emptyPayload(): CmsPagePayload {
  return {
    content: {},
    revision: 0,
    publishedRevision: 0,
    sharedRevision: 0,
    publishedSharedRevision: 0,
    updatedAt: null,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = normalizePagePath(url.searchParams.get("path"));
  const draft = url.searchParams.get("mode") === "draft";

  if (!path) {
    return NextResponse.json({ error: "Invalid page path." }, { status: 400 });
  }

  if (draft && !(await getAdminIdentity())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(emptyPayload());
  }

  const sharedPath = sharedPathFor(path);
  const prisma = getPrisma();
  const [page, sharedPage] = await Promise.all([
    prisma.cmsPage.findUnique({ where: { path } }),
    sharedPath
      ? prisma.cmsPage.findUnique({ where: { path: sharedPath } })
      : null,
  ]);
  const pageContent = draft ? page?.draftContent : page?.publishedContent;
  const sharedContent = draft
    ? sharedPage?.draftContent
    : sharedPage?.publishedContent;

  return NextResponse.json({
    content: {
      ...(isCmsContent(pageContent) ? pageContent : {}),
      ...(isCmsContent(sharedContent) ? sharedContent : {}),
    },
    revision: page?.revision ?? 0,
    publishedRevision: page?.publishedRevision ?? 0,
    sharedRevision: sharedPage?.revision ?? 0,
    publishedSharedRevision: sharedPage?.publishedRevision ?? 0,
    updatedAt:
      [page?.updatedAt, sharedPage?.updatedAt]
        .filter((date): date is Date => Boolean(date))
        .sort((left, right) => right.getTime() - left.getTime())[0]
        ?.toISOString() ?? null,
  } satisfies CmsPagePayload);
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    path?: unknown;
    content?: unknown;
    baseRevision?: unknown;
    baseSharedRevision?: unknown;
  } | null;
  const path = normalizePagePath(body?.path);

  if (
    !path ||
    !isCmsContent(body?.content) ||
    typeof body?.baseRevision !== "number" ||
    typeof body?.baseSharedRevision !== "number"
  ) {
    return NextResponse.json({ error: "Invalid draft." }, { status: 400 });
  }

  const { pageContent, sharedContent } = splitContent(body.content);
  const sharedPath = sharedPathFor(path);
  const locale = path.split("/")[1]!;

  try {
    const result = await getPrisma().$transaction(async (transaction) => {
      const [page, sharedPage] = await Promise.all([
        transaction.cmsPage.findUnique({ where: { path } }),
        sharedPath
          ? transaction.cmsPage.findUnique({ where: { path: sharedPath } })
          : null,
      ]);

      if (
        (page?.revision ?? 0) !== body.baseRevision ||
        (sharedPage?.revision ?? 0) !== body.baseSharedRevision
      ) {
        throw new Error("CMS_REVISION_CONFLICT");
      }

      const nextRevision = (page?.revision ?? 0) + 1;
      const savedPage = await transaction.cmsPage.upsert({
        where: { path },
        update: {
          draftContent: pageContent,
          revision: nextRevision,
          updatedBy: identity.email,
        },
        create: {
          path,
          locale,
          draftContent: pageContent,
          revision: nextRevision,
          updatedBy: identity.email,
        },
      });
      await transaction.cmsRevision.create({
        data: {
          pageId: savedPage.id,
          revision: nextRevision,
          state: "DRAFT",
          content: pageContent,
          authorId: identity.email,
        },
      });
      await reconcilePageAssets(
        transaction,
        savedPage.id,
        savedPage.draftContent,
        savedPage.publishedContent,
      );

      if (!sharedPath) {
        return { page: savedPage, shared: null };
      }

      const nextSharedRevision = (sharedPage?.revision ?? 0) + 1;
      const savedShared = await transaction.cmsPage.upsert({
        where: { path: sharedPath },
        update: {
          draftContent: sharedContent,
          revision: nextSharedRevision,
          updatedBy: identity.email,
        },
        create: {
          path: sharedPath,
          locale,
          draftContent: sharedContent,
          revision: nextSharedRevision,
          updatedBy: identity.email,
        },
      });
      await transaction.cmsRevision.create({
        data: {
          pageId: savedShared.id,
          revision: nextSharedRevision,
          state: "DRAFT",
          content: sharedContent,
          authorId: identity.email,
        },
      });
      await reconcilePageAssets(
        transaction,
        savedShared.id,
        savedShared.draftContent,
        savedShared.publishedContent,
      );

      return { page: savedPage, shared: savedShared };
    });

    return NextResponse.json({
      revision: result.page.revision,
      publishedRevision: result.page.publishedRevision,
      sharedRevision: result.shared?.revision ?? 0,
      publishedSharedRevision: result.shared?.publishedRevision ?? 0,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CMS_REVISION_CONFLICT") {
      return NextResponse.json(
        { error: "This page changed in another session. Reload and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "The draft could not be saved." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    path?: unknown;
    baseRevision?: unknown;
    baseSharedRevision?: unknown;
  } | null;
  const path = normalizePagePath(body?.path);

  if (
    !path ||
    typeof body?.baseRevision !== "number" ||
    typeof body?.baseSharedRevision !== "number"
  ) {
    return NextResponse.json({ error: "Invalid publish request." }, { status: 400 });
  }

  const sharedPath = sharedPathFor(path);

  try {
    const result = await getPrisma().$transaction(async (transaction) => {
      const [page, sharedPage] = await Promise.all([
        transaction.cmsPage.findUnique({ where: { path } }),
        sharedPath
          ? transaction.cmsPage.findUnique({ where: { path: sharedPath } })
          : null,
      ]);

      if (
        !page ||
        page.revision !== body.baseRevision ||
        (sharedPage?.revision ?? 0) !== body.baseSharedRevision
      ) {
        throw new Error("CMS_REVISION_CONFLICT");
      }

      const pageRevision = page.revision + 1;
      const publishedPage = await transaction.cmsPage.update({
        where: { id: page.id },
        data: {
          publishedContent: page.draftContent as Prisma.InputJsonValue,
          revision: pageRevision,
          publishedRevision: pageRevision,
          publishedAt: new Date(),
          updatedBy: identity.email,
        },
      });
      await transaction.cmsRevision.create({
        data: {
          pageId: page.id,
          revision: pageRevision,
          state: "PUBLISHED",
          content: page.draftContent as Prisma.InputJsonValue,
          authorId: identity.email,
        },
      });
      await reconcilePageAssets(
        transaction,
        publishedPage.id,
        publishedPage.draftContent,
        publishedPage.publishedContent,
      );

      if (!sharedPage) {
        return { page: publishedPage, shared: null };
      }

      const sharedRevision = sharedPage.revision + 1;
      const publishedShared = await transaction.cmsPage.update({
        where: { id: sharedPage.id },
        data: {
          publishedContent: sharedPage.draftContent as Prisma.InputJsonValue,
          revision: sharedRevision,
          publishedRevision: sharedRevision,
          publishedAt: new Date(),
          updatedBy: identity.email,
        },
      });
      await transaction.cmsRevision.create({
        data: {
          pageId: sharedPage.id,
          revision: sharedRevision,
          state: "PUBLISHED",
          content: sharedPage.draftContent as Prisma.InputJsonValue,
          authorId: identity.email,
        },
      });
      await reconcilePageAssets(
        transaction,
        publishedShared.id,
        publishedShared.draftContent,
        publishedShared.publishedContent,
      );

      return { page: publishedPage, shared: publishedShared };
    });

    return NextResponse.json({
      revision: result.page.revision,
      publishedRevision: result.page.publishedRevision,
      sharedRevision: result.shared?.revision ?? 0,
      publishedSharedRevision: result.shared?.publishedRevision ?? 0,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CMS_REVISION_CONFLICT") {
      return NextResponse.json(
        { error: "This page changed in another session. Reload and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "The page could not be published." },
      { status: 500 },
    );
  }
}
