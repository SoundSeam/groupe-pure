import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { getAdminIdentity } from "@/lib/auth";
import {
  normalizeFormsDocument,
  type CmsFormsPayload,
} from "@/lib/cms/forms";
import { defaultFormsDocument } from "@/lib/cms/forms.server";
import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const FORMS_PATH = "/_forms";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const draft = url.searchParams.get("mode") === "draft";

  if (draft && !(await getAdminIdentity())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const fallback = await defaultFormsDocument();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      config: fallback,
      revision: 0,
      publishedRevision: 0,
      updatedAt: null,
    } satisfies CmsFormsPayload);
  }

  const page = await getPrisma().cmsPage.findUnique({
    where: { path: FORMS_PATH },
  });
  const stored = draft ? page?.draftContent : page?.publishedContent;

  return NextResponse.json({
    config: normalizeFormsDocument(stored, fallback),
    revision: page?.revision ?? 0,
    publishedRevision: page?.publishedRevision ?? 0,
    updatedAt: page?.updatedAt.toISOString() ?? null,
  } satisfies CmsFormsPayload);
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
    config?: unknown;
    baseRevision?: unknown;
  } | null;

  if (typeof body?.baseRevision !== "number" || !body?.config) {
    return NextResponse.json({ error: "Invalid draft." }, { status: 400 });
  }

  const fallback = await defaultFormsDocument();
  const config = normalizeFormsDocument(body.config, fallback);

  try {
    const saved = await getPrisma().$transaction(async (transaction) => {
      const page = await transaction.cmsPage.findUnique({
        where: { path: FORMS_PATH },
      });

      if ((page?.revision ?? 0) !== body.baseRevision) {
        throw new Error("CMS_REVISION_CONFLICT");
      }

      const nextRevision = (page?.revision ?? 0) + 1;
      const nextPage = await transaction.cmsPage.upsert({
        where: { path: FORMS_PATH },
        update: {
          draftContent: config as Prisma.InputJsonValue,
          revision: nextRevision,
          updatedBy: identity.email,
        },
        create: {
          path: FORMS_PATH,
          locale: "shared",
          draftContent: config as Prisma.InputJsonValue,
          revision: nextRevision,
          updatedBy: identity.email,
        },
      });
      await transaction.cmsRevision.create({
        data: {
          pageId: nextPage.id,
          revision: nextRevision,
          state: "DRAFT",
          content: config as Prisma.InputJsonValue,
          authorId: identity.email,
        },
      });
      return nextPage;
    });

    return NextResponse.json({
      config,
      revision: saved.revision,
      publishedRevision: saved.publishedRevision,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CMS_REVISION_CONFLICT") {
      return NextResponse.json(
        { error: "These forms changed in another session. Reload and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "The form draft could not be saved." },
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
    baseRevision?: unknown;
  } | null;

  if (typeof body?.baseRevision !== "number") {
    return NextResponse.json(
      { error: "Invalid publish request." },
      { status: 400 },
    );
  }

  const fallback = await defaultFormsDocument();

  try {
    const published = await getPrisma().$transaction(async (transaction) => {
      const page = await transaction.cmsPage.findUnique({
        where: { path: FORMS_PATH },
      });

      if ((page?.revision ?? 0) !== body.baseRevision) {
        throw new Error("CMS_REVISION_CONFLICT");
      }

      const content = normalizeFormsDocument(page?.draftContent, fallback);
      const nextRevision = (page?.revision ?? 0) + 1;
      const nextPage = await transaction.cmsPage.upsert({
        where: { path: FORMS_PATH },
        update: {
          draftContent: content as Prisma.InputJsonValue,
          publishedContent: content as Prisma.InputJsonValue,
          revision: nextRevision,
          publishedRevision: nextRevision,
          publishedAt: new Date(),
          updatedBy: identity.email,
        },
        create: {
          path: FORMS_PATH,
          locale: "shared",
          draftContent: content as Prisma.InputJsonValue,
          publishedContent: content as Prisma.InputJsonValue,
          revision: nextRevision,
          publishedRevision: nextRevision,
          publishedAt: new Date(),
          updatedBy: identity.email,
        },
      });
      await transaction.cmsRevision.create({
        data: {
          pageId: nextPage.id,
          revision: nextRevision,
          state: "PUBLISHED",
          content: content as Prisma.InputJsonValue,
          authorId: identity.email,
        },
      });
      return nextPage;
    });

    return NextResponse.json({
      revision: published.revision,
      publishedRevision: published.publishedRevision,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CMS_REVISION_CONFLICT") {
      return NextResponse.json(
        { error: "These forms changed in another session. Reload and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "The forms could not be published." },
      { status: 500 },
    );
  }
}
