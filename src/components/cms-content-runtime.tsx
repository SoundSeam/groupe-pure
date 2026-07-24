"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { applyContentToDocument } from "@/lib/cms/dom";
import type { CmsPagePayload } from "@/lib/cms/types";

export default function CmsContentRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.search.includes("cms-editor=1")) return;

    const controller = new AbortController();

    void fetch(`/api/cms/content?path=${encodeURIComponent(pathname)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: CmsPagePayload | null) => {
        if (payload?.content) {
          applyContentToDocument(document, payload.content);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [pathname]);

  return null;
}
