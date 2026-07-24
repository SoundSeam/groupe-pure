import { NextResponse } from "next/server";

import { getAdminIdentity } from "@/lib/auth";

export const runtime = "nodejs";

function allowedMediaUrl(mediaUrl: URL, requestUrl: URL) {
  const supabaseHost = (() => {
    try {
      return process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : null;
    } catch {
      return null;
    }
  })();

  return (
    mediaUrl.origin === requestUrl.origin ||
    (mediaUrl.protocol === "https:" &&
      mediaUrl.hostname === supabaseHost)
  );
}

function downloadName(url: URL, contentType: string | null) {
  const pathnameName = decodeURIComponent(url.pathname.split("/").pop() ?? "");
  if (pathnameName && pathnameName.includes(".")) {
    return pathnameName.replace(/[^a-zA-Z0-9._-]/g, "-");
  }

  const extension = contentType?.startsWith("video/") ? "mp4" : "jpg";
  return `groupe-pure-media.${extension}`;
}

export async function GET(request: Request) {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const value = requestUrl.searchParams.get("url");
  let mediaUrl: URL;

  try {
    mediaUrl = new URL(value ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  if (!allowedMediaUrl(mediaUrl, requestUrl)) {
    return NextResponse.json({ error: "Media host is not allowed." }, { status: 400 });
  }

  const upstream = await fetch(mediaUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "The media could not be downloaded." },
      { status: 502 },
    );
  }

  const contentType = upstream.headers.get("content-type");
  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${downloadName(
        mediaUrl,
        contentType,
      )}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
