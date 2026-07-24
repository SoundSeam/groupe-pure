import type { CmsContent, CmsValue, CmsValueType } from "./types";

const ignoredTags = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "SVG",
  "IFRAME",
  "TEXTAREA",
]);

function isIgnored(element: Element | null) {
  return (
    !element ||
    ignoredTags.has(element.tagName) ||
    Boolean(element.closest("form, header, footer")) ||
    Boolean(element.closest("[data-cms-ignore]"))
  );
}

function pathWithin(element: Element, boundary: Element) {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== boundary) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;

    const tag = current.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === current!.tagName,
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:${index}`);
    current = parent;
  }

  return parts.join("/");
}

export function elementPath(element: Element) {
  return pathWithin(element, element.ownerDocument.body);
}

function keyForElement(
  kind: "text" | "media" | "placeholder",
  element: Element,
  suffix?: string,
) {
  const scope = element.closest<HTMLElement>("[data-cms-scope]");
  const path = pathWithin(
    element,
    scope ?? element.ownerDocument.body,
  );
  const tail = suffix === undefined ? "" : `:${suffix}`;

  return scope?.dataset.cmsScope
    ? `${scope.dataset.cmsScope}:${kind}:${path}${tail}`
    : `${kind}:${path}${tail}`;
}

function directTextIndex(node: Text) {
  return Array.from(node.parentElement?.childNodes ?? [])
    .filter((child) => child.nodeType === Node.TEXT_NODE)
    .indexOf(node);
}

export function textKey(node: Text) {
  const parent = node.parentElement;
  return parent ? keyForElement("text", parent, String(directTextIndex(node))) : null;
}

export function mediaKey(element: HTMLImageElement | HTMLVideoElement) {
  return element.dataset.cmsMediaKey ?? keyForElement("media", element);
}

export function placeholderKey(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  return keyForElement("placeholder", element);
}

export function collectTextNodes(document: Document) {
  const root = document.querySelector("main") ?? document.body;
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node as Text;
        const parent = text.parentElement;

        if (
          isIgnored(parent) ||
          parent?.closest("[contenteditable='true']") ||
          !text.nodeValue?.trim()
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );
  const nodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
}

export function collectMedia(document: Document) {
  const root = document.querySelector("main") ?? document.body;
  return Array.from(
    root.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
      "img, video",
    ),
  ).filter((element) => !isIgnored(element));
}

export function getMediaValue(
  element: HTMLImageElement | HTMLVideoElement,
): CmsValue {
  if (element instanceof HTMLVideoElement) {
    return {
      type: "video",
      value:
        element.currentSrc ||
        element.src ||
        element.querySelector("source")?.src ||
        "",
    };
  }

  let source = element.currentSrc || element.src;
  try {
    const parsed = new URL(source, element.ownerDocument.baseURI);
    if (parsed.pathname === "/_next/image") {
      const original = parsed.searchParams.get("url");
      if (original) {
        source = new URL(original, element.ownerDocument.baseURI).href;
      }
    }
  } catch {
    // Keep the browser-provided source if it is not a standard URL.
  }

  return {
    type: "image",
    value: source,
    alt: element.alt,
  };
}

export function applyMediaValue(
  element: HTMLImageElement | HTMLVideoElement,
  value: CmsValue,
) {
  if (element instanceof HTMLVideoElement && value.type === "video") {
    element.src = value.value;
    element.querySelectorAll("source").forEach((source) => {
      source.src = value.value;
    });
    element.load();
    void element.play().catch(() => undefined);
    return element;
  }

  if (element instanceof HTMLImageElement && value.type === "image") {
    element.removeAttribute("srcset");
    element.removeAttribute("sizes");
    element.src = value.value;
    if (value.alt !== undefined) element.alt = value.alt;
    return element;
  }

  if (element instanceof HTMLImageElement && value.type === "video") {
    const video = element.ownerDocument.createElement("video");
    copyPresentation(element, video);
    video.src = value.value;
    video.poster = getMediaValue(element).value;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    element.replaceWith(video);
    void video.play().catch(() => undefined);
    return video;
  }

  if (element instanceof HTMLVideoElement && value.type === "image") {
    const image = element.ownerDocument.createElement("img");
    copyPresentation(element, image);
    image.src = value.value;
    image.alt = value.alt ?? "";
    element.replaceWith(image);
    return image;
  }

  return element;
}

function copyPresentation(
  source: HTMLImageElement | HTMLVideoElement,
  target: HTMLImageElement | HTMLVideoElement,
) {
  ["class", "style", "width", "height"].forEach((attribute) => {
    const value = source.getAttribute(attribute);
    if (value !== null) target.setAttribute(attribute, value);
  });

  Object.entries(source.dataset).forEach(([key, value]) => {
    if (key.startsWith("cms") && value !== undefined) {
      target.dataset[key] = value;
    }
  });
}

export function applyContentToDocument(document: Document, content: CmsContent) {
  collectTextNodes(document).forEach((node) => {
    const key = textKey(node);
    const value = key ? content[key] : undefined;
    if (value?.type === "text") {
      const original = node.nodeValue ?? "";
      const leading = original.match(/^\s*/)?.[0] ?? "";
      const trailing = original.match(/\s*$/)?.[0] ?? "";
      node.nodeValue = `${leading}${value.value}${trailing}`;
    }
  });

  collectMedia(document).forEach((element) => {
    const key = mediaKey(element);
    const value = content[key];
    if (value) applyMediaValue(element, value);
  });

  (document.querySelector("main") ?? document.body)
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input[placeholder], textarea[placeholder]",
    )
    .forEach((element) => {
      if (isIgnored(element)) return;
      const value = content[placeholderKey(element)];
      if (value?.type === "text") element.placeholder = value.value;
    });
}

export function valueForType(type: CmsValueType, value: string): CmsValue {
  return { type, value };
}
