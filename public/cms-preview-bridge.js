(() => {
  if (!window.location.search.includes("cms-editor=1")) return;

  const origin = window.location.origin;
  let initialized = false;

  function mediaValue(element) {
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

    let value = element.currentSrc || element.src;
    try {
      const url = new URL(value, document.baseURI);
      if (url.pathname === "/_next/image") {
        const original = url.searchParams.get("url");
        if (original) value = new URL(original, document.baseURI).href;
      }
    } catch {}

    return { type: "image", value, alt: element.alt };
  }

  function fileName(value) {
    try {
      return decodeURIComponent(
        new URL(value, origin).pathname.split("/").pop() || "",
      );
    } catch {
      return value.split("/").pop() || "";
    }
  }

  function editableMedia() {
    return Array.from(
      (document.querySelector("main") || document.body).querySelectorAll(
        "img, video",
      ),
    ).filter(
      (element) =>
        !element.closest("form, header, footer, [data-cms-ignore]"),
    );
  }

  function prepareMedia() {
    editableMedia().forEach((element, index) => {
      element.dataset.cmsKey =
        element.dataset.cmsMediaKey || `media:auto:${index}`;
      element.dataset.cmsEditable = "media";
    });
  }

  function clearSelection() {
    document
      .querySelectorAll("[data-cms-selected='true']")
      .forEach((element) => delete element.dataset.cmsSelected);
  }

  function sendSelection(element) {
    if (!element) {
      window.parent.postMessage(
        { type: "cms-preview-media-selected", selection: null },
        origin,
      );
      return;
    }

    const media = mediaValue(element);
    window.parent.postMessage(
      {
        type: "cms-preview-media-selected",
        selection: {
          key: element.dataset.cmsKey,
          type: media.type,
          value: media.value,
          alt: media.alt,
          fileName: fileName(media.value),
          width:
            element instanceof HTMLVideoElement
              ? element.videoWidth
              : element.naturalWidth,
          height:
            element instanceof HTMLVideoElement
              ? element.videoHeight
              : element.naturalHeight,
        },
      },
      origin,
    );
  }

  function initialize() {
    if (initialized) return;
    initialized = true;

    const style = document.createElement("style");
    style.dataset.cmsMediaBridgeStyle = "true";
    style.textContent = `
      [data-cms-editable="media"] {
        cursor: pointer !important;
      }
      [data-cms-editable="media"]:hover,
      [data-cms-selected="true"] {
        outline: 2px solid #6f8dff !important;
        outline-offset: -2px;
      }
    `;
    document.head.append(style);
    prepareMedia();

    document.addEventListener(
      "pointerdown",
      (event) => {
        const target = event.target;
        const directMedia =
          target instanceof Element
            ? target.closest('[data-cms-editable="media"]')
            : null;
        const media =
          directMedia instanceof HTMLImageElement ||
          directMedia instanceof HTMLVideoElement
            ? directMedia
            : document
                .elementsFromPoint(event.clientX, event.clientY)
                .find(
                  (element) =>
                    (element instanceof HTMLImageElement ||
                      element instanceof HTMLVideoElement) &&
                    element.dataset.cmsEditable === "media",
                );

        if (media) {
          event.preventDefault();
          event.stopPropagation();
          clearSelection();
          media.dataset.cmsSelected = "true";
          sendSelection(media);
          return;
        }

        clearSelection();
        sendSelection(null);
      },
      true,
    );

    document.addEventListener("cms-editor-clear-media", () => {
      clearSelection();
      sendSelection(null);
    });
    window.addEventListener("message", (event) => {
      if (
        event.origin === origin &&
        event.source === window.parent &&
        event.data?.type === "cms-preview-ready-check"
      ) {
        prepareMedia();
        window.parent.postMessage(
          { type: "cms-preview-ready", pathname: window.location.pathname },
          origin,
        );
      }
    });
    window.parent.postMessage(
      { type: "cms-preview-ready", pathname: window.location.pathname },
      origin,
    );
  }

  if (document.readyState === "complete") {
    window.setTimeout(initialize, 0);
  } else {
    window.addEventListener(
      "load",
      () => window.setTimeout(initialize, 0),
      { once: true },
    );
  }
})();
