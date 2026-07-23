"use client";

import Script from "next/script";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

import { StarIcon } from "./icons";

const GOOGLE_MAPS_ALLOWED_ORIGINS = new Set([
  "https://groupepure.ca",
  "https://www.groupepure.ca",
  "http://localhost:3000",
]);

const subscribeToOrigin = () => () => {};
const getClientCanLoadPlaces = () =>
  GOOGLE_MAPS_ALLOWED_ORIGINS.has(window.location.origin);
const getServerCanLoadPlaces = () => false;

type GoogleReviewBadgeProps = {
  apiKey?: string;
  fallbackLabel: string;
  mapsUrl: string;
  placeId: string;
};

export default function GoogleReviewBadge({
  apiKey,
  fallbackLabel,
  mapsUrl,
  placeId,
}: GoogleReviewBadgeProps) {
  const canLoadPlaces = useSyncExternalStore(
    subscribeToOrigin,
    getClientCanLoadPlaces,
    getServerCanLoadPlaces,
  );
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const detailsElement = useRef<HTMLElement | null>(null);

  const handlePlaceLoad = useCallback(() => {
    setHasLoaded(true);
  }, []);

  const handlePlaceError = useCallback(() => {
    setHasError(true);
  }, []);

  const setDetailsElement = useCallback(
    (element: HTMLElement | null) => {
      detailsElement.current?.removeEventListener("gmp-load", handlePlaceLoad);
      detailsElement.current?.removeEventListener(
        "gmp-error",
        handlePlaceError,
      );
      detailsElement.current?.removeEventListener(
        "gmp-requesterror",
        handlePlaceError,
      );
      detailsElement.current = element;
      detailsElement.current?.addEventListener("gmp-load", handlePlaceLoad);
      detailsElement.current?.addEventListener("gmp-error", handlePlaceError);
      detailsElement.current?.addEventListener(
        "gmp-requesterror",
        handlePlaceError,
      );
    },
    [handlePlaceError, handlePlaceLoad],
  );

  const showLiveBadge =
    Boolean(apiKey) && canLoadPlaces && hasLoaded && !hasError;

  return (
    <div className="grid min-h-14 w-full max-w-[18rem]">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className={`col-start-1 row-start-1 inline-flex min-h-14 items-center gap-3 rounded-lg bg-[#171a18] px-5 py-3 text-white transition hover:bg-[#1d211e] ${
          showLiveBadge ? "invisible" : "visible"
        }`}
      >
        <span className="flex items-center gap-1 text-[#fcac0a]" aria-hidden="true">
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
        </span>
        <span className="text-sm font-medium">{fallbackLabel}</span>
      </a>

      {apiKey && canLoadPlaces ? (
        <>
          <Script
            id="google-maps-places-ui-kit"
            src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=places&v=weekly&auth_referrer_policy=origin`}
            strategy="afterInteractive"
            onError={() => setHasError(true)}
          />
          <gmp-place-details-compact
            ref={setDetailsElement}
            orientation="horizontal"
            truncation-preferred
            className={`col-start-1 row-start-1 w-full max-w-[18rem] overflow-hidden rounded-lg transition-opacity ${
              showLiveBadge
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            style={{
              border: "none",
              colorScheme: "dark",
              margin: 0,
              padding: 0,
              "--gmp-mat-color-surface": "#171a18",
              "--gmp-mat-color-on-surface": "#ffffff",
              "--gmp-mat-color-on-surface-variant": "#b7b9b7",
              "--gmp-mat-color-primary": "#e4c58f",
            }}
          >
            <gmp-place-details-place-request
              place={placeId}
            ></gmp-place-details-place-request>
            <gmp-place-content-config>
              <gmp-place-rating></gmp-place-rating>
              <gmp-place-attribution
                light-scheme-color="gray"
                dark-scheme-color="white"
              ></gmp-place-attribution>
            </gmp-place-content-config>
          </gmp-place-details-compact>
        </>
      ) : null}
    </div>
  );
}
