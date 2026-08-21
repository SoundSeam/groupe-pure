import { NextResponse } from "next/server";

import { getAdminIdentity } from "@/lib/auth";
import { loadSiteVisibility } from "@/lib/cms/page-visibility.server";
import {
  isManagedPagePath,
  localeForPagePath,
  pageForPath,
} from "@/lib/cms/pages";
import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ visibility: await loadSiteVisibility() });
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
    visible?: unknown;
  } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  const page = pageForPath(path);
  const locale = localeForPagePath(path);

  if (
    !isManagedPagePath(path) ||
    !page ||
    !locale ||
    typeof body?.visible !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Invalid page visibility request." },
      { status: 400 },
    );
  }

  if (!page.hideable && !body.visible) {
    return NextResponse.json(
      { error: "This page cannot be hidden." },
      { status: 400 },
    );
  }

  try {
    await getPrisma().cmsPage.upsert({
      where: { path },
      update: {
        isVisible: body.visible,
        visibilityUpdatedBy: identity.email,
      },
      create: {
        path,
        locale,
        isVisible: body.visible,
        visibilityUpdatedBy: identity.email,
      },
    });

    return NextResponse.json({ visibility: await loadSiteVisibility() });
  } catch (error) {
    console.error("Page visibility update failed.", error);
    return NextResponse.json(
      { error: "The page visibility could not be updated." },
      { status: 500 },
    );
  }
}
