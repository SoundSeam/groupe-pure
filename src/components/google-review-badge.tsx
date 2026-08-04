"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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
const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-data";
const GOOGLE_MAPS_READY_CALLBACK = "__groupePureGoogleMapsReady";

type GoogleReviewBadgeProps = {
  apiKey?: string;
  fallbackLabel: string;
  mapsUrl: string;
  placeId: string;
};

type LiveGoogleRating = {
  mapsUrl: string;
  rating: number;
  reviewCount: number;
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
  const [hasError, setHasError] = useState(false);
  const [liveRating, setLiveRating] = useState<LiveGoogleRating | null>(null);
  const requestedPlaceId = useRef<string | null>(null);

  const loadLiveRating = useCallback(() => {
    const importLibrary = window.google?.maps?.importLibrary;
    if (!importLibrary || requestedPlaceId.current === placeId) {
      return;
    }

    requestedPlaceId.current = placeId;
    setHasError(false);

    void (async () => {
      try {
        const { Place } = await importLibrary("places");
        const place = new Place({ id: placeId });

        await place.fetchFields({
          fields: ["googleMapsURI", "rating", "userRatingCount"],
        });

        if (
          typeof place.rating !== "number" ||
          typeof place.userRatingCount !== "number"
        ) {
          throw new Error("Google did not return complete rating data.");
        }

        setLiveRating({
          mapsUrl: place.googleMapsURI || mapsUrl,
          rating: place.rating,
          reviewCount: place.userRatingCount,
        });
      } catch {
        requestedPlaceId.current = null;
        setHasError(true);
      }
    })();
  }, [mapsUrl, placeId]);

  useEffect(() => {
    if (!apiKey || !canLoadPlaces) {
      return;
    }

    if (window.google?.maps?.importLibrary) {
      loadLiveRating();
      return;
    }

    window[GOOGLE_MAPS_READY_CALLBACK] = loadLiveRating;

    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    const query = new URLSearchParams({
      key: apiKey,
      loading: "async",
      libraries: "places",
      v: "weekly",
      auth_referrer_policy: "origin",
      callback: GOOGLE_MAPS_READY_CALLBACK,
    });

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${query}`;
    script.async = true;
    script.onerror = () => setHasError(true);
    document.head.append(script);
  }, [apiKey, canLoadPlaces, loadLiveRating]);

  const showLiveRating = liveRating && !hasError;
  const roundedRating = showLiveRating ? Math.round(liveRating.rating) : 5;

  return (
    <div className="min-h-14">
      <a
        href={showLiveRating ? liveRating.mapsUrl : mapsUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={
          showLiveRating
            ? `${liveRating.rating.toFixed(1)} · ${liveRating.reviewCount} · ${fallbackLabel}`
            : fallbackLabel
        }
        className="group inline-flex min-h-14 items-center gap-2.5 bg-[#171a18] px-5 py-3 text-left text-white transition hover:bg-[#1d211e]"
      >
        {showLiveRating ? (
          <span className="flex items-baseline gap-1 text-sm leading-none">
            <span className="font-semibold tabular-nums">
              {liveRating.rating.toFixed(1)}
            </span>
            <span className="font-normal tabular-nums text-white/65">
              ({liveRating.reviewCount.toLocaleString()})
            </span>
          </span>
        ) : (
          <span className="text-sm font-medium">{fallbackLabel}</span>
        )}
        <span
          className="flex items-center justify-center gap-1.5"
          aria-hidden="true"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <span
              className={
                index < roundedRating ? "text-[#fcac0a]" : "text-white/20"
              }
              key={index}
            >
              <StarIcon />
            </span>
          ))}
        </span>
        <span
          className="ml-1 flex h-8 w-6 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <Image
            src="/brand/google-maps-icon.webp"
            alt=""
            width={250}
            height={359}
            className="h-[16.8px] w-auto"
          />
        </span>
      </a>
    </div>
  );
}
