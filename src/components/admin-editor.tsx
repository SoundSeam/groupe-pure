"use client";

import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowSquareOut,
  CaretDown,
  CloudCheck,
  Desktop,
  DeviceMobile,
  DotsSixVertical,
  GlobeHemisphereWest,
  LockKey,
  Plus,
  SignOut,
  SpinnerGap,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  normalizeProjects,
  parseProjects,
  projectCollectionValue,
  PROJECT_CATEGORIES,
  PROJECTS_CONTENT_KEY,
  type CmsProject,
  type ProjectCategory,
} from "@/lib/cms/projects";
import {
  applyMediaValue,
  collectMedia,
  collectTextNodes,
  getMediaValue,
  mediaKey,
  placeholderKey,
  textKey,
} from "@/lib/cms/dom";
import type {
  CmsContent,
  CmsPagePayload,
  CmsValue,
} from "@/lib/cms/types";
import {
  uploadCmsMedia,
  type CmsMediaAsset,
} from "@/lib/cms/media-upload";
import { isCmsContent } from "@/lib/cms/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type HistoryPatch = {
  key: string;
  before?: CmsValue;
  after?: CmsValue;
};

type MediaSelection = {
  key: string;
  type: "image" | "video";
  value: string;
  alt?: string;
  fileName: string;
  width: number;
  height: number;
};

type MediaLibraryTarget =
  | { kind: "page"; fieldKey: string }
  | { kind: "project"; projectId: string };

type Activity =
  | "idle"
  | "saving"
  | "saved"
  | "uploading"
  | "publishing"
  | "published"
  | "error";

type FrameCallbacks = {
  onInput: (key: string, value: CmsValue) => void;
  onEditStart: (key: string) => void;
  onEditEnd: (key: string) => void;
  onMediaSelect: (selection: MediaSelection | null) => void;
  onUndo: () => void;
  onRedo: () => void;
};

const pageOptions = {
  fr: [
    { path: "/fr", label: "Accueil" },
    { path: "/fr/services", label: "Services" },
    { path: "/fr/projects", label: "Projets" },
    { path: "/fr/team", label: "Équipe" },
    { path: "/fr/contact", label: "Contact" },
  ],
  en: [
    { path: "/en", label: "Home" },
    { path: "/en/services", label: "Services" },
    { path: "/en/projects", label: "Projects" },
    { path: "/en/team", label: "Team" },
    { path: "/en/contact", label: "Contact" },
  ],
} as const;

const adminActionLabels = {
  fr: {
    undo: "Annuler",
    redo: "Rétablir",
    publish: "Publier",
    viewSite: "Voir le site",
    signOut: "Déconnexion",
  },
  en: {
    undo: "Undo",
    redo: "Redo",
    publish: "Publish",
    viewSite: "View site",
    signOut: "Sign out",
  },
} as const;

function sameValue(left?: CmsValue, right?: CmsValue) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function innerEditableValue(value: string) {
  return value.trim();
}

function mediaDisplayName(value: string) {
  if (!value || value.startsWith("blob:")) return "";

  try {
    return decodeURIComponent(
      new URL(value, "https://groupepure.local").pathname.split("/").pop() ??
        "",
    );
  } catch {
    return value.split("/").pop() ?? "";
  }
}

function decorateFrame(
  frame: HTMLIFrameElement,
  content: CmsContent,
  originals: Map<string, CmsValue>,
  callbacks: FrameCallbacks,
) {
  const document = frame.contentDocument;
  if (!document?.body) return;

  document.documentElement.dataset.cmsEditor = "true";
  const outline = document.createElement("div");
  outline.dataset.cmsEditorOutline = "true";
  document.body.append(outline);

  const style = document.createElement("style");
  style.dataset.cmsEditorStyle = "true";
  style.textContent = `
    [data-cms-editable="text"] {
      caret-color: #6f8dff;
      cursor: text;
      min-width: .35em;
      -webkit-user-modify: read-write-plaintext-only;
    }
    [data-cms-editable="text"]:focus {
      background: rgba(111, 141, 255, .11);
      outline: none;
    }
    [data-cms-editor-outline] {
      position: fixed;
      z-index: 2147483645;
      display: none;
      pointer-events: none;
      border: 1px solid #6f8dff;
      border-radius: 2px;
    }
    [data-cms-editable="field"]:hover,
    [data-cms-editable="field"]:focus,
    [data-cms-editable="media"]:hover,
    [data-cms-selected="true"] {
      outline: 2px solid #6f8dff !important;
      outline-offset: -2px;
    }
    [data-cms-editable="media"] {
      cursor: pointer !important;
    }
    html[data-cms-editor="true"] a,
    html[data-cms-editor="true"] button {
      cursor: default;
    }
  `;
  document.head.append(style);

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    anchor.dataset.cmsEditorHref = anchor.getAttribute("href") ?? "";
    anchor.removeAttribute("href");
  });

  let outlinedText: HTMLElement | null = null;
  const positionOutline = (element: HTMLElement | null) => {
    outlinedText = element;
    if (!element) {
      outline.style.display = "none";
      return;
    }
    const rect = element.getBoundingClientRect();
    outline.style.display = "block";
    outline.style.left = `${rect.left}px`;
    outline.style.top = `${rect.top}px`;
    outline.style.width = `${rect.width}px`;
    outline.style.height = `${rect.height}px`;
  };

  collectTextNodes(document).forEach((node) => {
    if (node.parentElement?.tagName === "OPTION") return;

    const key = textKey(node);
    const original = node.nodeValue;
    if (!key || !original) return;

    const visibleValue = innerEditableValue(original);
    originals.set(key, { type: "text", value: visibleValue });

    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";
    const span = document.createElement("span");
    span.dataset.cmsKey = key;
    span.dataset.cmsEditable = "text";
    span.contentEditable = "plaintext-only";
    span.spellcheck = true;
    span.textContent =
      content[key]?.type === "text" ? content[key].value : visibleValue;

    const fragment = document.createDocumentFragment();
    if (leading) fragment.append(document.createTextNode(leading));
    fragment.append(span);
    if (trailing) fragment.append(document.createTextNode(trailing));
    node.replaceWith(fragment);

    span.addEventListener("pointerenter", () => positionOutline(span));
    span.addEventListener("pointerleave", () => {
      if (document.activeElement !== span) positionOutline(null);
    });
    span.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    span.addEventListener("focus", () => {
      positionOutline(span);
      callbacks.onEditStart(key);
    });
    span.addEventListener("input", () => {
      positionOutline(span);
      callbacks.onInput(key, {
        type: "text",
        value: span.innerText.replace(/\n+$/, ""),
      });
    });
    span.addEventListener("blur", () => {
      positionOutline(null);
      callbacks.onEditEnd(key);
    });
    span.addEventListener("paste", (event) => {
      event.preventDefault();
      const text = event.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    });
    span.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        span.blur();
      }
    });
  });

  collectMedia(document).forEach((element) => {
    const key = mediaKey(element);
    const original = getMediaValue(element);
    originals.set(key, original);
    element.dataset.cmsKey = key;
    element.dataset.cmsEditable = "media";

    const override = content[key];
    if (override) applyMediaValue(element, override);
  });

  const clearMediaOutline = () => {
    document
      .querySelectorAll<HTMLElement>("[data-cms-selected='true']")
      .forEach((selected) => delete selected.dataset.cmsSelected);
  };

  const clearMediaSelection = () => {
    clearMediaOutline();
    callbacks.onMediaSelect(null);
  };

  const mediaSelectionFor = (
    element: HTMLImageElement | HTMLVideoElement,
  ): MediaSelection => {
    const value = getMediaValue(element);
    return {
      key: element.dataset.cmsKey!,
      type: element instanceof HTMLVideoElement ? "video" : "image",
      value: value.value,
      alt: value.alt,
      fileName: mediaDisplayName(value.value),
      width:
        element instanceof HTMLVideoElement
          ? element.videoWidth
          : element.naturalWidth,
      height:
        element instanceof HTMLVideoElement
          ? element.videoHeight
          : element.naturalHeight,
    };
  };

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input[placeholder], textarea[placeholder]",
    )
    .forEach((element) => {
      if (element.type === "hidden" || element.type === "file") return;
      if (element.closest("form, header, footer, [data-cms-ignore]")) return;

      const key = placeholderKey(element);
      const original: CmsValue = {
        type: "text",
        value: element.placeholder,
      };
      originals.set(key, original);
      element.dataset.cmsKey = key;
      element.dataset.cmsEditable = "field";
      element.readOnly = true;

      const override = content[key];
      if (override?.type === "text") element.placeholder = override.value;

      element.addEventListener("focus", () => {
        callbacks.onEditStart(key);
        element.readOnly = false;
        element.value = element.placeholder;
        element.select();
      });
      element.addEventListener("input", () => {
        callbacks.onInput(key, { type: "text", value: element.value });
      });
      element.addEventListener("blur", () => {
        const value = element.value;
        element.placeholder = value;
        element.value = "";
        element.readOnly = true;
        callbacks.onEditEnd(key);
      });
      element.addEventListener("keydown", (event) => {
        if (!(event instanceof KeyboardEvent)) return;
        if (event.key === "Enter" && element instanceof HTMLInputElement) {
          event.preventDefault();
          element.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          element.blur();
        }
      });
    });

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const editable = target.closest<HTMLElement>("[data-cms-editable]");
      if (
        editable &&
        editable.dataset.cmsEditable !== "text" &&
        editable.dataset.cmsEditable !== "field"
      ) {
        event.preventDefault();
      }
    },
    true,
  );

  document.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target;
      const directEditable =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-cms-editable]")
          : null;
      const directMedia =
        directEditable?.dataset.cmsEditable === "media" &&
        (directEditable instanceof HTMLImageElement ||
          directEditable instanceof HTMLVideoElement)
          ? directEditable
          : undefined;
      const media =
        directEditable?.dataset.cmsEditable === "text" ||
        directEditable?.dataset.cmsEditable === "field"
          ? undefined
          : (directMedia ??
            (document
              .elementsFromPoint(event.clientX, event.clientY)
              .find(
                (element) =>
                  (element instanceof HTMLImageElement ||
                    element instanceof HTMLVideoElement) &&
                  element.dataset.cmsEditable === "media",
              ) as HTMLImageElement | HTMLVideoElement | undefined));

      if (media) {
        event.preventDefault();
        event.stopPropagation();
        clearMediaOutline();
        media.dataset.cmsSelected = "true";
        callbacks.onMediaSelect(mediaSelectionFor(media));
        return;
      }

      if (target instanceof Element) {
        clearMediaSelection();
      }
    },
    true,
  );

  const updateFloatingUi = () => {
    if (outlinedText) positionOutline(outlinedText);
  };
  document.addEventListener("scroll", updateFloatingUi, true);
  frame.contentWindow?.addEventListener("resize", updateFloatingUi);
  document.addEventListener("cms-editor-media-replaced", (event) => {
    const key =
      event instanceof CustomEvent && typeof event.detail?.key === "string"
        ? event.detail.key
        : "";
    const replacement = key
      ? frameElementByKey(document, key)
      : null;
    if (
      replacement instanceof HTMLImageElement ||
      replacement instanceof HTMLVideoElement
    ) {
      replacement.dataset.cmsSelected = "true";
      callbacks.onMediaSelect(mediaSelectionFor(replacement));
    }
  });
  document.addEventListener("cms-editor-clear-media", clearMediaSelection);

  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") {
      return;
    }

    event.preventDefault();
    if (event.shiftKey) callbacks.onRedo();
    else callbacks.onUndo();
  });
}

function frameElementByKey(document: Document, key: string) {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-cms-key]"),
  ).find((element) => element.dataset.cmsKey === key);
}

type InitialProject = {
  id?: string;
  title: string;
  image: string;
  imageAlt: string;
  mediaType?: "image" | "video";
  category?: ProjectCategory;
  type: string;
  location: string;
  summary: string;
};

const EMPTY_INITIAL_PROJECTS: InitialProject[] = [];

export default function AdminEditor({
  email,
  initialPath,
  initialProjects = EMPTY_INITIAL_PROJECTS,
  locale,
}: {
  email: string;
  initialPath: string;
  initialProjects?: InitialProject[];
  locale: "en" | "fr";
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<CmsContent>({});
  const revisionRef = useRef(0);
  const sharedRevisionRef = useRef(0);
  const originalsRef = useRef(new Map<string, CmsValue>());
  const editStartRef = useRef(new Map<string, CmsValue | undefined>());
  const projectTitleStartRef = useRef<CmsValue | undefined>(undefined);
  const historyRef = useRef<HistoryPatch[]>([]);
  const historyIndexRef = useRef(0);
  const mediaSelectionRef = useRef<MediaSelection | null>(null);
  const savePromiseRef = useRef<Promise<number | null> | null>(null);

  const [content, setContent] = useState<CmsContent>({});
  const [serverSnapshot, setServerSnapshot] = useState<CmsContent>({});
  const [revision, setRevision] = useState(0);
  const [publishedRevision, setPublishedRevision] = useState(0);
  const [sharedRevision, setSharedRevision] = useState(0);
  const [publishedSharedRevision, setPublishedSharedRevision] = useState(0);
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [activity, setActivity] = useState<Activity>("idle");
  const [message, setMessage] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [selectedMedia, setSelectedMedia] =
    useState<MediaSelection | null>(null);
  const [projects, setProjects] = useState<CmsProject[]>(() =>
    normalizeProjects(initialProjects),
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    () => normalizeProjects(initialProjects)[0]?.id ?? "",
  );
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState("");
  const [mediaLibraryTarget, setMediaLibraryTarget] =
    useState<MediaLibraryTarget | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<CmsMediaAsset[]>([]);
  const [mediaLibraryQuery, setMediaLibraryQuery] = useState("");
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!projectDialogOpen && !mediaLibraryTarget) return;

    const closeDialog = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mediaLibraryTarget) setMediaLibraryTarget(null);
      else setProjectDialogOpen(false);
    };
    window.addEventListener("keydown", closeDialog);
    return () => window.removeEventListener("keydown", closeDialog);
  }, [mediaLibraryTarget, projectDialogOpen]);

  const selectMedia = useCallback((selection: MediaSelection | null) => {
    mediaSelectionRef.current = selection;
    setSelectedMedia(selection);
  }, []);

  const dirty = JSON.stringify(content) !== JSON.stringify(serverSnapshot);

  const syncHistoryState = useCallback(() => {
    setHistoryState({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length,
    });
  }, []);

  const setDraftContent = useCallback((next: CmsContent) => {
    contentRef.current = next;
    setContent(next);
  }, []);

  const previewProjects = useCallback((next: CmsProject[]) => {
    setProjects(next);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "cms-projects-preview", projects: next },
      window.location.origin,
    );
  }, []);

  const applyEditorValue = useCallback(
    (key: string, value?: CmsValue) => {
      const document = iframeRef.current?.contentDocument;
      if (!document) return;

      const element = frameElementByKey(document, key);
      const visibleValue = value ?? originalsRef.current.get(key);
      if (key === PROJECTS_CONTENT_KEY) {
        previewProjects(parseProjects(visibleValue, initialProjects));
        return;
      }
      if (!element || !visibleValue) return;

      if (element.dataset.cmsEditable === "text") {
        element.textContent = visibleValue.value;
      } else if (
        element.dataset.cmsEditable === "field" &&
        (element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement)
      ) {
        element.placeholder = visibleValue.value;
        element.value = "";
      } else if (
        element instanceof HTMLImageElement ||
        element instanceof HTMLVideoElement
      ) {
        const result = applyMediaValue(element, visibleValue);
        if (result !== element && result.dataset.cmsSelected === "true") {
          document.dispatchEvent(
            new CustomEvent("cms-editor-media-replaced", {
              detail: { key },
            }),
          );
        }
        if (mediaSelectionRef.current?.key === key) {
          const mediaValue = getMediaValue(result);
          selectMedia({
            key,
            type: result instanceof HTMLVideoElement ? "video" : "image",
            value: mediaValue.value,
            alt: mediaValue.alt,
            fileName: mediaDisplayName(mediaValue.value),
            width:
              result instanceof HTMLVideoElement
                ? result.videoWidth
                : result.naturalWidth,
            height:
              result instanceof HTMLVideoElement
                ? result.videoHeight
                : result.naturalHeight,
          });
        }
      }
    },
    [initialProjects, previewProjects, selectMedia],
  );

  const pushHistory = useCallback(
    (patch: HistoryPatch) => {
      if (sameValue(patch.before, patch.after)) return;

      historyRef.current = historyRef.current.slice(
        0,
        historyIndexRef.current,
      );
      historyRef.current.push(patch);
      historyIndexRef.current = historyRef.current.length;
      syncHistoryState();
    },
    [syncHistoryState],
  );

  const writeProjects = useCallback(
    (nextProjects: CmsProject[], recordHistory = true) => {
      const before = contentRef.current[PROJECTS_CONTENT_KEY];
      const after = projectCollectionValue(nextProjects);
      setDraftContent({
        ...contentRef.current,
        [PROJECTS_CONTENT_KEY]: after,
      });
      previewProjects(nextProjects);
      if (recordHistory) {
        pushHistory({ key: PROJECTS_CONTENT_KEY, before, after });
      }
      setActivity("idle");
      setMessage("");
    },
    [previewProjects, pushHistory, setDraftContent],
  );

  const applyHistoryPatch = useCallback(
    (key: string, value?: CmsValue) => {
      const next = { ...contentRef.current };
      if (value) next[key] = value;
      else delete next[key];
      setDraftContent(next);
      applyEditorValue(key, value);
      setActivity("idle");
    },
    [applyEditorValue, setDraftContent],
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const patch = historyRef.current[historyIndexRef.current - 1];
    historyIndexRef.current -= 1;
    applyHistoryPatch(patch.key, patch.before);
    syncHistoryState();
  }, [applyHistoryPatch, syncHistoryState]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length) return;
    const patch = historyRef.current[historyIndexRef.current];
    historyIndexRef.current += 1;
    applyHistoryPatch(patch.key, patch.after);
    syncHistoryState();
  }, [applyHistoryPatch, syncHistoryState]);

  useEffect(() => {
    let active = true;
    let frameUpdate = 0;
    const controller = new AbortController();

    void fetch(
      `/api/cms/content?path=${encodeURIComponent(initialPath)}&mode=draft`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            ((await response.json().catch(() => null)) as { error?: string } | null)
              ?.error ?? "The page could not be loaded.",
          );
        }
        return (await response.json()) as CmsPagePayload;
      })
      .then((payload) => {
        if (!active) return;

        let nextContent = payload.content;
        const localKey = `groupe-pure:cms:${initialPath}`;
        const localDraft = window.localStorage.getItem(localKey);

        if (localDraft) {
          try {
            const parsed = JSON.parse(localDraft) as { content?: unknown };
            if (isCmsContent(parsed.content)) nextContent = parsed.content;
          } catch {
            window.localStorage.removeItem(localKey);
          }
        }

        contentRef.current = nextContent;
        revisionRef.current = payload.revision;
        sharedRevisionRef.current = payload.sharedRevision;
        setContent(nextContent);
        setServerSnapshot(payload.content);
        setRevision(payload.revision);
        setPublishedRevision(payload.publishedRevision);
        setSharedRevision(payload.sharedRevision);
        setPublishedSharedRevision(payload.publishedSharedRevision);
        const nextProjects = parseProjects(
          nextContent[PROJECTS_CONTENT_KEY],
          initialProjects,
        );
        setProjects(nextProjects);
        setSelectedProjectId((current) =>
          nextProjects.some((project) => project.id === current)
            ? current
            : (nextProjects[0]?.id ?? ""),
        );
        setLoaded(true);
        setActivity("idle");

        frameUpdate = window.requestAnimationFrame(() => {
          Object.entries(nextContent).forEach(([key, value]) => {
            applyEditorValue(key, value);
          });
        });
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        if (!active) return;
        setMessage(error.message);
        setActivity("error");
      });

    return () => {
      active = false;
      controller.abort();
      if (frameUpdate) window.cancelAnimationFrame(frameUpdate);
    };
  }, [applyEditorValue, initialPath, initialProjects]);

  useEffect(() => {
    if (!loaded) return;

    const localKey = `groupe-pure:cms:${initialPath}`;
    if (!dirty) {
      window.localStorage.removeItem(localKey);
      return;
    }

    window.localStorage.setItem(
      localKey,
      JSON.stringify({
        content,
        revision,
        sharedRevision,
        savedAt: new Date().toISOString(),
      }),
    );
  }, [content, dirty, initialPath, loaded, revision, sharedRevision]);

  const updateFromFrame = useCallback(
    (key: string, value: CmsValue) => {
      setDraftContent({ ...contentRef.current, [key]: value });
      setActivity("idle");
      setMessage("");
    },
    [setDraftContent],
  );

  const handleEditStart = useCallback((key: string) => {
    editStartRef.current.set(key, contentRef.current[key]);
  }, []);

  const handleEditEnd = useCallback(
    (key: string) => {
      const before = editStartRef.current.get(key);
      const after = contentRef.current[key];
      editStartRef.current.delete(key);
      pushHistory({ key, before, after });
    },
    [pushHistory],
  );

  const decorateCurrentFrame = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const frameDocument = frame.contentDocument;
    if (
      !frameDocument?.body ||
      frameDocument.querySelector("[data-cms-editor-style]")
    ) {
      return;
    }

    selectMedia(null);
    originalsRef.current = new Map();
    decorateFrame(frame, contentRef.current, originalsRef.current, {
      onInput: updateFromFrame,
      onEditStart: handleEditStart,
      onEditEnd: handleEditEnd,
      onMediaSelect: selectMedia,
      onUndo: undo,
      onRedo: redo,
    });
    frame.contentWindow?.postMessage(
      { type: "cms-projects-preview", projects },
      window.location.origin,
    );
  }, [
    handleEditEnd,
    handleEditStart,
    projects,
    redo,
    selectMedia,
    undo,
    updateFromFrame,
  ]);

  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      const frame = iframeRef.current;
      if (
        event.origin !== window.location.origin ||
        event.source !== frame?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === "cms-preview-ready") {
        decorateCurrentFrame();
      } else if (event.data?.type === "cms-preview-media-selected") {
        const selection = event.data.selection as MediaSelection | null;
        if (
          selection === null ||
          (typeof selection?.key === "string" &&
            (selection.type === "image" || selection.type === "video") &&
            typeof selection.value === "string")
        ) {
          selectMedia(selection);
        }
      }
    };

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [decorateCurrentFrame, selectMedia]);

  const handleFrameLoad = useCallback(() => {
    selectMedia(null);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "cms-preview-ready-check" },
      window.location.origin,
    );
  }, [selectMedia]);

  const saveDraft = useCallback(() => {
    if (savePromiseRef.current) return savePromiseRef.current;

    const contentToSave = contentRef.current;
    const baseRevision = revisionRef.current;
    const baseSharedRevision = sharedRevisionRef.current;
    const save = (async () => {
      setActivity("saving");
      setMessage("");

      const response = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: initialPath,
          content: contentToSave,
          baseRevision,
          baseSharedRevision,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        revision?: number;
        publishedRevision?: number;
        sharedRevision?: number;
        publishedSharedRevision?: number;
        error?: string;
      } | null;

      if (!response.ok || typeof payload?.revision !== "number") {
        setActivity("error");
        setMessage(payload?.error ?? "The draft could not be saved.");
        return null;
      }

      revisionRef.current = payload.revision;
      sharedRevisionRef.current =
        payload.sharedRevision ?? sharedRevisionRef.current;
      setRevision(payload.revision);
      setPublishedRevision(payload.publishedRevision ?? publishedRevision);
      setSharedRevision(sharedRevisionRef.current);
      setPublishedSharedRevision(
        payload.publishedSharedRevision ?? publishedSharedRevision,
      );
      setServerSnapshot(contentToSave);

      const isCurrent =
        JSON.stringify(contentRef.current) === JSON.stringify(contentToSave);
      if (isCurrent) {
        window.localStorage.removeItem(`groupe-pure:cms:${initialPath}`);
        setActivity("saved");
      } else {
        setActivity("idle");
      }
      return payload.revision;
    })().finally(() => {
      savePromiseRef.current = null;
    });

    savePromiseRef.current = save;
    return save;
  }, [
    initialPath,
    publishedRevision,
    publishedSharedRevision,
  ]);

  useEffect(() => {
    if (
      !loaded ||
      !dirty ||
      activity === "saving" ||
      activity === "uploading" ||
      activity === "publishing" ||
      activity === "error"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveDraft();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [activity, dirty, loaded, saveDraft]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;

      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [redo, undo]);

  async function publish() {
    if (activity === "uploading" || activity === "publishing") return;

    let baseRevision = revisionRef.current;
    if (dirty || savePromiseRef.current) {
      const savedRevision = await saveDraft();
      if (savedRevision === null) return;
      baseRevision = savedRevision;
    }

    setActivity("publishing");
    setMessage("");

    const response = await fetch("/api/cms/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: initialPath,
        baseRevision,
        baseSharedRevision: sharedRevisionRef.current,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      revision?: number;
      publishedRevision?: number;
      sharedRevision?: number;
      publishedSharedRevision?: number;
      error?: string;
    } | null;

    if (
      !response.ok ||
      typeof payload?.revision !== "number" ||
      typeof payload.publishedRevision !== "number"
    ) {
      setActivity("error");
      setMessage(payload?.error ?? "The page could not be published.");
      return;
    }

    revisionRef.current = payload.revision;
    sharedRevisionRef.current = payload.sharedRevision ?? sharedRevisionRef.current;
    setRevision(payload.revision);
    setPublishedRevision(payload.publishedRevision);
    setSharedRevision(sharedRevisionRef.current);
    setPublishedSharedRevision(
      payload.publishedSharedRevision ?? publishedSharedRevision,
    );
    setServerSnapshot(contentRef.current);
    setActivity("published");
  }

  function clearSelectedMedia() {
    const document = iframeRef.current?.contentDocument;
    if (document) {
      document.dispatchEvent(new Event("cms-editor-clear-media"));
    } else {
      selectMedia(null);
    }
  }

  function updateSelectedMediaDimensions(width: number, height: number) {
    setSelectedMedia((current) => {
      if (!current) return current;
      if (current.width === width && current.height === height) return current;
      const next = { ...current, width, height };
      mediaSelectionRef.current = next;
      return next;
    });
  }

  async function openMediaLibrary(target: MediaLibraryTarget) {
    setMediaLibraryTarget(target);
    setMediaLibraryQuery("");
    setMediaLibraryLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cms/assets", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as {
        assets?: CmsMediaAsset[];
        error?: string;
      } | null;
      if (!response.ok || !payload?.assets) {
        throw new Error(payload?.error ?? "The media library could not load.");
      }
      setMediaLibrary(payload.assets);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The media library could not load.",
      );
    } finally {
      setMediaLibraryLoading(false);
    }
  }

  function applyLibraryAsset(
    asset: CmsMediaAsset,
    target = mediaLibraryTarget,
  ) {
    if (!target) return;
    const type = asset.mimeType.startsWith("video/") ? "video" : "image";

    if (target.kind === "project") {
      writeProjects(
        projects.map((project) =>
          project.id === target.projectId
            ? {
                ...project,
                image: asset.publicUrl,
                mediaType: type,
                imageAlt: project.imageAlt || project.title,
              }
            : project,
        ),
      );
    } else {
      const before = contentRef.current[target.fieldKey];
      const next: CmsValue = {
        type,
        value: asset.publicUrl,
        alt:
          type === "image"
            ? (before?.alt ??
              originalsRef.current.get(target.fieldKey)?.alt ??
              "")
            : undefined,
      };
      setDraftContent({
        ...contentRef.current,
        [target.fieldKey]: next,
      });
      applyEditorValue(target.fieldKey, next);
      selectMedia({
        key: target.fieldKey,
        type,
        value: asset.publicUrl,
        alt: next.alt,
        fileName: asset.fileName,
        width: 0,
        height: 0,
      });
      pushHistory({ key: target.fieldKey, before, after: next });
    }

    setMediaLibraryTarget(null);
    setActivity("idle");
    setMessage("");
  }

  async function uploadLibraryFile(file: File) {
    const target = mediaLibraryTarget;
    if (!target) return;

    const fieldKey =
      target.kind === "page"
        ? target.fieldKey
        : `${PROJECTS_CONTENT_KEY}:${target.projectId}`;
    setActivity("uploading");
    setUploadProgress(0);
    setMessage("");

    try {
      const asset = await uploadCmsMedia({
        file,
        fieldKey,
        pagePath: initialPath,
        onProgress: setUploadProgress,
      });
      setMediaLibrary((current) => [
        asset,
        ...current.filter((item) => item.id !== asset.id),
      ]);
      applyLibraryAsset(asset, target);
    } catch (error) {
      setActivity("error");
      setMessage(
        error instanceof Error ? error.message : "The media could not upload.",
      );
    } finally {
      setUploadProgress(0);
    }
  }

  function addProject(category: ProjectCategory) {
    const project: CmsProject = {
      id: crypto.randomUUID(),
      title: locale === "fr" ? "Nouveau projet" : "New project",
      image: "",
      imageAlt: "",
      mediaType: "image",
      category,
      type: "",
      location: "",
      summary: "",
    };
    const next = [...projects, project];
    writeProjects(next);
    setSelectedProjectId(project.id);
    setProjectDialogOpen(true);
  }

  function reorderProject(
    sourceId: string,
    targetId: string,
    placeAfter: boolean,
  ) {
    if (!sourceId || sourceId === targetId) return;
    const source = projects.find((project) => project.id === sourceId);
    const target = projects.find((project) => project.id === targetId);
    if (!source || !target || source.category !== target.category) return;

    const next = projects.filter((project) => project.id !== sourceId);
    const targetIndex = next.findIndex((project) => project.id === targetId);
    next.splice(targetIndex + (placeAfter ? 1 : 0), 0, source);
    writeProjects(next);
  }

  function deleteSelectedProject() {
    const index = projects.findIndex(
      (project) => project.id === selectedProjectId,
    );
    if (index < 0) return;

    const next = projects.filter((project) => project.id !== selectedProjectId);
    writeProjects(next);
    setProjectDialogOpen(false);
    setSelectedProjectId(
      next[Math.min(index, Math.max(0, next.length - 1))]?.id ?? "",
    );
  }

  function updateSelectedProjectTitle(title: string) {
    writeProjects(
      projects.map((project) =>
        project.id === selectedProjectId
          ? { ...project, title, imageAlt: project.imageAlt || title }
          : project,
      ),
      false,
    );
  }

  function updateSelectedProjectCategory(category: ProjectCategory) {
    writeProjects(
      projects.map((project) =>
        project.id === selectedProjectId ? { ...project, category } : project,
      ),
    );
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    window.location.assign("/admin");
  }

  const busy =
    activity === "saving" ||
    activity === "uploading" ||
    activity === "publishing";
  const selectedAccept = "image/*,video/mp4,video/webm,video/quicktime";
  const otherLocale = locale === "fr" ? "en" : "fr";
  const equivalentPath = `/${otherLocale}${initialPath.replace(
    /^\/(en|fr)/,
    "",
  )}`;
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedMediaValue = selectedMedia
    ? ({
        type: selectedMedia.type,
        value: selectedMedia.value,
        alt: selectedMedia.alt,
      } satisfies CmsValue)
    : undefined;
  const selectedMediaName =
    selectedMedia?.fileName ||
    (mediaDisplayName(selectedMedia?.value ?? "") ||
      (locale === "fr" ? "Média" : "Media"));
  const selectedMediaHasOverride = selectedMedia
    ? Boolean(content[selectedMedia.key])
    : false;
  const normalizedLibraryQuery = mediaLibraryQuery.trim().toLowerCase();
  const actionLabels = adminActionLabels[locale];
  const filteredMediaLibrary = normalizedLibraryQuery
    ? mediaLibrary.filter(
        (asset) =>
          asset.fileName.toLowerCase().includes(normalizedLibraryQuery) ||
          asset.mimeType.toLowerCase().includes(normalizedLibraryQuery),
      )
    : mediaLibrary;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#080a09]">
      <header
        className="relative z-50 flex h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-white/10 bg-[#111412] px-2.5 text-white shadow-lg shadow-black/20 sm:overflow-visible sm:px-3"
        data-cms-ignore
      >
        <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-white/72">
          <LockKey className="h-4 w-4 text-[#e4c58f]" weight="fill" />
          <span className="hidden sm:inline">Admin</span>
        </div>

        <div className="relative w-32 shrink-0 sm:w-auto">
          <select
            aria-label="Page"
            value={initialPath}
            onChange={(event) => {
              window.location.assign(`/admin${event.target.value}`);
            }}
            className="h-9 w-full appearance-none rounded-lg border border-white/10 bg-white/[0.045] py-0 pl-2.5 pr-9 text-xs font-medium text-white outline-none sm:min-w-32 sm:max-w-52"
          >
            {pageOptions[locale].map((option) => (
              <option key={option.path} value={option.path}>
                {option.label}
              </option>
            ))}
          </select>
          <CaretDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45"
          />
        </div>
        <button
          type="button"
          data-tooltip={otherLocale.toUpperCase()}
          aria-label={otherLocale.toUpperCase()}
          onClick={() => window.location.assign(`/admin${equivalentPath}`)}
          className="admin-tooltip flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold uppercase text-white/60 transition hover:bg-white/8 hover:text-white"
        >
          {otherLocale}
        </button>

        <div className="mx-auto hidden items-center gap-1 rounded-lg border border-white/10 p-0.5 sm:flex">
          <IconButton
            label="Desktop"
            active={viewport === "desktop"}
            onClick={() => setViewport("desktop")}
          >
            <Desktop />
          </IconButton>
          <IconButton
            label="Mobile"
            active={viewport === "mobile"}
            onClick={() => setViewport("mobile")}
          >
            <DeviceMobile />
          </IconButton>
        </div>

        <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
          <IconButton
            label={actionLabels.undo}
            disabled={!historyState.canUndo}
            onClick={undo}
            showLabel
          >
            <ArrowCounterClockwise />
          </IconButton>
          <IconButton
            label={actionLabels.redo}
            disabled={!historyState.canRedo}
            onClick={redo}
            showLabel
          >
            <ArrowClockwise />
          </IconButton>

          <span
            className="mx-1 hidden h-5 w-px bg-white/10 sm:block"
            aria-hidden="true"
          />

          <span
            title={
              activity === "error"
                ? message
                : activity === "uploading"
                  ? `Uploading media${uploadProgress ? ` · ${uploadProgress}%` : ""}`
                  : activity === "saving"
                    ? "Saving draft automatically"
                : dirty
                    ? "Draft save pending"
                    : `Draft saved · revision ${revision}`
            }
            className={`hidden h-8 w-8 items-center justify-center sm:flex ${
              activity === "error"
                ? "text-red-300"
                : activity === "saving" || activity === "uploading"
                  ? "text-[#e4c58f]"
                : dirty
                  ? "text-white/35"
                  : "text-emerald-300"
            }`}
          >
            {activity === "error" ? (
              <WarningCircle className="h-4 w-4" weight="fill" />
            ) : activity === "saving" || activity === "uploading" ? (
              <SpinnerGap className="h-4 w-4 animate-spin" />
            ) : (
              <CloudCheck className="h-4 w-4" weight={dirty ? "regular" : "fill"} />
            )}
          </span>

          <IconButton
            label={actionLabels.publish}
            disabled={!loaded || busy}
            onClick={() => void publish()}
            accent
            showLabel
          >
            {activity === "publishing" ? (
              <SpinnerGap className="animate-spin" />
            ) : (
              <GlobeHemisphereWest />
            )}
          </IconButton>
          <a
            href={initialPath}
            target="_blank"
            rel="noreferrer"
            aria-label={actionLabels.viewSite}
            className="hidden h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-white/60 transition hover:bg-white/8 hover:text-white sm:flex"
          >
            <ArrowSquareOut className="h-4 w-4" />
            <span>{actionLabels.viewSite}</span>
          </a>
          <IconButton
            label={actionLabels.signOut}
            title={email}
            onClick={() => void signOut()}
            showLabel
          >
            <SignOut />
          </IconButton>
        </div>

        <input
          ref={mediaFileInputRef}
          type="file"
          accept={selectedAccept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadLibraryFile(file);
            event.target.value = "";
          }}
        />
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#080a09]">
        {selectedMedia &&
        selectedMediaValue &&
        (selectedMediaValue.type === "image" ||
          selectedMediaValue.type === "video") ? (
          <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#111412] text-white">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-white/50">
                {locale === "fr" ? "Média" : "Media"}
              </h2>
              <button
                type="button"
                aria-label={locale === "fr" ? "Fermer" : "Close"}
                data-tooltip={locale === "fr" ? "Fermer" : "Close"}
                onClick={clearSelectedMedia}
                className="admin-tooltip grid h-7 w-7 place-items-center rounded-sm text-white/55 transition hover:bg-white/8 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-black/25">
                {selectedMediaValue.type === "video" ? (
                  <video
                    src={selectedMediaValue.value}
                    className="h-full w-full object-cover"
                    controls
                    muted
                    playsInline
                    onLoadedMetadata={(event) =>
                      updateSelectedMediaDimensions(
                        event.currentTarget.videoWidth,
                        event.currentTarget.videoHeight,
                      )
                    }
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedMediaValue.value}
                    alt={selectedMediaValue.alt ?? ""}
                    className="h-full w-full object-cover"
                    onLoad={(event) =>
                      updateSelectedMediaDimensions(
                        event.currentTarget.naturalWidth,
                        event.currentTarget.naturalHeight,
                      )
                    }
                  />
                )}
              </div>

              <p
                className="mt-3 truncate text-sm font-medium text-white/88"
                title={selectedMediaName}
              >
                {selectedMediaName}
              </p>

              <dl className="mt-3 divide-y divide-white/8 border-y border-white/8 text-xs">
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-white/42">
                    {locale === "fr" ? "Type" : "Type"}
                  </dt>
                  <dd className="capitalize text-white/72">
                    {selectedMediaValue.type === "video"
                      ? locale === "fr"
                        ? "Vidéo"
                        : "Video"
                      : locale === "fr"
                        ? "Image"
                        : "Image"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-white/42">
                    {locale === "fr" ? "Dimensions" : "Dimensions"}
                  </dt>
                  <dd className="text-white/72">
                    {selectedMedia.width > 0 && selectedMedia.height > 0
                      ? `${selectedMedia.width} × ${selectedMedia.height}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-white/42">
                    {locale === "fr" ? "État" : "State"}
                  </dt>
                  <dd className="text-white/72">
                    {selectedMediaHasOverride
                      ? locale === "fr"
                        ? "Modifié"
                        : "Changed"
                      : locale === "fr"
                        ? "Original"
                        : "Original"}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void openMediaLibrary({
                    kind: "page",
                    fieldKey: selectedMedia.key,
                  })
                }
                className="mt-4 w-full rounded-sm bg-white px-3 py-2.5 text-sm font-semibold text-[#101211] transition hover:bg-white/90 disabled:opacity-30"
              >
                {locale === "fr" ? "Remplacer" : "Replace"}
              </button>
            </div>
          </aside>
        ) : initialPath.endsWith("/projects") ? (
          <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#111412] text-white">
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="space-y-6">
                {PROJECT_CATEGORIES.map((category) => {
                  const categoryProjects = projects.filter(
                    (project) => project.category === category,
                  );
                  const categoryLabel =
                    category === "architecture"
                      ? "Architecture"
                      : category === "construction"
                        ? "Construction"
                        : "Excavation";

                  return (
                    <section key={category}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-white/50">
                          {categoryLabel}
                        </h2>
                        <button
                          type="button"
                          aria-label={
                            locale === "fr"
                              ? `Ajouter un projet — ${categoryLabel}`
                              : `Add project — ${categoryLabel}`
                          }
                          data-tooltip={
                            locale === "fr"
                              ? "Ajouter un projet"
                              : "Add project"
                          }
                          onClick={() => addProject(category)}
                          className="admin-tooltip grid h-7 w-7 place-items-center rounded-sm border border-white/15 text-white/70 transition hover:bg-white/8 hover:text-white"
                        >
                          <Plus className="h-3.5 w-3.5" weight="bold" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {categoryProjects.map((project) => (
                          <article
                            key={project.id}
                            draggable
                            onDragStart={(event) => {
                              setDraggedProjectId(project.id);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData(
                                "text/plain",
                                project.id,
                              );
                            }}
                            onDragEnd={() => setDraggedProjectId("")}
                            onDragOver={(event) => {
                              if (draggedProjectId) {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = "move";
                              }
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              const rect =
                                event.currentTarget.getBoundingClientRect();
                              reorderProject(
                                event.dataTransfer.getData("text/plain") ||
                                  draggedProjectId,
                                project.id,
                                event.clientY > rect.top + rect.height / 2,
                              );
                              setDraggedProjectId("");
                            }}
                            className={`group/project relative cursor-grab rounded-md border border-white/10 bg-white/[0.025] p-2 active:cursor-grabbing ${
                              draggedProjectId === project.id
                                ? "opacity-40"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <DotsSixVertical
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 text-white/25 transition group-hover/project:text-white/55"
                              />
                              <span className="h-10 w-12 shrink-0 overflow-hidden rounded-sm bg-white/5">
                                {project.image ? (
                                  project.mediaType === "video" ? (
                                    <video
                                      src={project.image}
                                      className="h-full w-full object-cover"
                                      muted
                                    />
                                  ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={project.image}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  )
                                ) : null}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm">
                                {project.title ||
                                  (locale === "fr"
                                    ? "Sans titre"
                                    : "Untitled")}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setProjectDialogOpen(true);
                              }}
                              className="pointer-events-none absolute inset-2 flex translate-y-1 items-center justify-center rounded-sm bg-white px-2 py-1.5 text-xs font-semibold text-[#101211] opacity-0 shadow-lg transition duration-200 hover:bg-white/90 focus:pointer-events-auto focus:translate-y-0 focus:opacity-100 group-hover/project:pointer-events-auto group-hover/project:translate-y-0 group-hover/project:opacity-100 group-focus-within/project:pointer-events-auto group-focus-within/project:translate-y-0 group-focus-within/project:opacity-100"
                            >
                              {locale === "fr" ? "Modifier" : "Edit"}
                            </button>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </aside>
        ) : null}

        {projectDialogOpen && selectedProject ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              locale === "fr" ? "Modifier le projet" : "Edit project"
            }
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 text-white"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) {
                setProjectDialogOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-md rounded-lg border border-white/12 bg-[#111412] p-4 shadow-2xl">
              <button
                type="button"
                aria-label={locale === "fr" ? "Fermer" : "Close"}
                data-tooltip={locale === "fr" ? "Fermer" : "Close"}
                onClick={() => setProjectDialogOpen(false)}
                className="admin-tooltip absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-[#111412]/90 text-white/70 shadow-lg transition hover:bg-[#202421] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 aspect-video overflow-hidden rounded-md bg-white/5">
                {selectedProject.image ? (
                  selectedProject.mediaType === "video" ? (
                    <video
                      src={selectedProject.image}
                      className="h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProject.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="sr-only">
                    {locale === "fr" ? "Titre du projet" : "Project title"}
                  </span>
                  <input
                    value={selectedProject.title}
                    placeholder={
                      locale === "fr" ? "Titre du projet" : "Project title"
                    }
                    onFocus={() => {
                      projectTitleStartRef.current =
                        contentRef.current[PROJECTS_CONTENT_KEY];
                    }}
                    onChange={(event) =>
                      updateSelectedProjectTitle(event.target.value)
                    }
                    onBlur={() => {
                      pushHistory({
                        key: PROJECTS_CONTENT_KEY,
                        before: projectTitleStartRef.current,
                        after: contentRef.current[PROJECTS_CONTENT_KEY],
                      });
                      projectTitleStartRef.current = undefined;
                    }}
                    className="h-10 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm outline-none focus:border-[#6f8dff]"
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">
                    {locale === "fr" ? "Catégorie" : "Category"}
                  </span>
                  <select
                    value={selectedProject.category}
                    onChange={(event) =>
                      updateSelectedProjectCategory(
                        event.target.value as ProjectCategory,
                      )
                    }
                    className="h-10 w-full appearance-none rounded-md border border-white/15 bg-[#111412] py-0 pr-10 pl-3 text-sm outline-none focus:border-[#6f8dff]"
                  >
                    <option value="architecture">Architecture</option>
                    <option value="construction">Construction</option>
                    <option value="excavation">Excavation</option>
                  </select>
                  <CaretDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-white/45"
                  />
                </label>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void openMediaLibrary({
                      kind: "project",
                      projectId: selectedProject.id,
                    })
                  }
                  className="w-full rounded-md border border-white/15 px-3 py-2 text-sm font-medium transition hover:bg-white/8 disabled:opacity-30"
                >
                  {locale === "fr" ? "Remplacer le média" : "Replace media"}
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={deleteSelectedProject}
                    className="rounded-md border border-red-300/20 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-300/10 disabled:opacity-30"
                  >
                    {locale === "fr" ? "Supprimer" : "Delete project"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectDialogOpen(false)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#101211] transition hover:bg-white/90"
                  >
                    {locale === "fr" ? "Terminé" : "Done"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {mediaLibraryTarget ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={locale === "fr" ? "Médiathèque" : "Media library"}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 text-white"
            onMouseDown={(event) => {
              if (
                event.currentTarget === event.target &&
                activity !== "uploading"
              ) {
                setMediaLibraryTarget(null);
              }
            }}
          >
            <div className="flex h-[min(760px,88vh)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-white/12 bg-[#111412] shadow-2xl">
              <div className="flex shrink-0 items-center gap-3 border-b border-white/10 p-3">
                <input
                  value={mediaLibraryQuery}
                  onChange={(event) => setMediaLibraryQuery(event.target.value)}
                  placeholder={locale === "fr" ? "Rechercher" : "Search"}
                  autoFocus
                  className="h-9 min-w-0 flex-1 rounded-sm border border-white/12 bg-white/[0.035] px-3 text-sm outline-none placeholder:text-white/30 focus:border-[#6f8dff]"
                />
                <button
                  type="button"
                  disabled={activity === "uploading"}
                  onClick={() => mediaFileInputRef.current?.click()}
                  className="h-9 rounded-sm bg-white px-4 text-sm font-semibold text-[#101211] transition hover:bg-white/90 disabled:opacity-40"
                >
                  {activity === "uploading"
                    ? `${uploadProgress}%`
                    : locale === "fr"
                      ? "Importer"
                      : "Upload"}
                </button>
                <button
                  type="button"
                  disabled={activity === "uploading"}
                  aria-label={locale === "fr" ? "Fermer" : "Close"}
                  data-tooltip={locale === "fr" ? "Fermer" : "Close"}
                  onClick={() => setMediaLibraryTarget(null)}
                  className="admin-tooltip grid h-9 w-9 place-items-center rounded-sm text-white/55 transition hover:bg-white/8 hover:text-white disabled:opacity-30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {mediaLibraryLoading ? (
                  <div className="grid h-full place-items-center">
                    <SpinnerGap className="h-5 w-5 animate-spin text-white/45" />
                  </div>
                ) : filteredMediaLibrary.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {filteredMediaLibrary.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={activity === "uploading"}
                        onClick={() => applyLibraryAsset(asset)}
                        className="group/library overflow-hidden rounded-sm border border-white/10 bg-white/[0.025] text-left transition hover:border-[#6f8dff] focus-visible:border-[#6f8dff] focus-visible:outline-none disabled:opacity-40"
                      >
                        <span className="block aspect-[4/3] overflow-hidden bg-black/25">
                          {asset.mimeType.startsWith("video/") ? (
                            <video
                              src={asset.publicUrl}
                              className="h-full w-full object-cover transition duration-200 group-hover/library:scale-[1.025]"
                              muted
                              preload="metadata"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.publicUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-200 group-hover/library:scale-[1.025]"
                            />
                          )}
                        </span>
                        <span className="block truncate px-2.5 pt-2 text-xs font-medium text-white/80">
                          {asset.fileName}
                        </span>
                        <span className="block px-2.5 pb-2 pt-0.5 text-[10px] uppercase tracking-wide text-white/35">
                          {asset.mimeType.startsWith("video/")
                            ? locale === "fr"
                              ? "Vidéo"
                              : "Video"
                            : "Image"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid h-full place-items-center text-sm text-white/35">
                    {locale === "fr" ? "Aucun média" : "No media"}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 justify-center overflow-auto">
          <div
            className={`h-full bg-white transition-[width] duration-200 ${
              viewport === "mobile"
                ? "w-[390px] max-w-full border-x border-white/10 shadow-2xl shadow-black/60"
                : "w-full"
            }`}
          >
            <iframe
              ref={iframeRef}
              src={`/admin-preview${initialPath}?cms-editor=1`}
              title="Page editor"
              onLoad={handleFrameLoad}
              className="h-full w-full border-0 bg-[#101211]"
            />
          </div>
        </div>

        {message ? (
          <button
            type="button"
            onClick={() => setMessage("")}
            className="absolute bottom-4 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-white/10 bg-[#171a18] px-4 py-2 text-sm text-white shadow-xl"
          >
            {message}
          </button>
        ) : null}
      </div>
    </main>
  );
}

function IconButton({
  active = false,
  accent = false,
  children,
  disabled = false,
  label,
  onClick,
  showLabel = false,
  title,
}: {
  active?: boolean;
  accent?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  showLabel?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-tooltip={showLabel ? undefined : label}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${showLabel ? "" : "admin-tooltip"} flex h-8 items-center justify-center rounded-md transition [&>svg]:h-4 [&>svg]:w-4 ${
        showLabel ? "gap-1.5 px-2 text-xs font-medium" : "w-8"
      } ${
        accent
          ? "bg-[#e4c58f] text-[#101211] hover:bg-[#eed4a5]"
          : active
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/8 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-25`}
    >
      {children}
      {showLabel ? <span>{label}</span> : null}
    </button>
  );
}
