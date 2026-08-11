"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { ImageWatermark } from "./image-watermark";

type CarouselImage = {
  id?: string;
  title: string;
  image: string;
  imageAlt: string;
  mediaType?: "image" | "video";
};

export function ProjectCarousel({
  title,
  images,
  previousLabel,
  nextLabel,
  imageLabel,
}: {
  title: string;
  images: CarouselImage[];
  previousLabel: string;
  nextLabel: string;
  imageLabel: string;
}) {
  const [viewportRef, emblaApi] = useEmblaCarousel({
    active: images.length > 1,
    align: "start",
    breakpoints: {
      "(min-width: 640px)": { active: images.length > 2 },
      "(min-width: 1280px)": { active: images.length > 3 },
    },
    loop: true,
  });
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateNavigation = useCallback(() => {
    if (!emblaApi) return;

    const visibleSlides = window.matchMedia("(min-width: 1280px)").matches
      ? 3
      : window.matchMedia("(min-width: 640px)").matches
        ? 2
        : 1;
    const hasOverflow = images.length > visibleSlides;

    setCanScrollPrevious(hasOverflow && emblaApi.canScrollPrev());
    setCanScrollNext(hasOverflow && emblaApi.canScrollNext());
  }, [emblaApi, images.length]);

  useEffect(() => {
    if (!emblaApi) return;

    const animationFrame = window.requestAnimationFrame(updateNavigation);
    emblaApi.on("select", updateNavigation);
    emblaApi.on("reInit", updateNavigation);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      emblaApi.off("select", updateNavigation);
      emblaApi.off("reInit", updateNavigation);
    };
  }, [emblaApi, updateNavigation]);

  return (
    <article aria-labelledby={`${title.toLowerCase()}-projects`}>
      <div className="mb-6 flex items-center justify-between gap-6 sm:mb-8">
        <h2
          id={`${title.toLowerCase()}-projects`}
          className="text-3xl font-semibold text-white sm:text-5xl"
        >
          {title}
        </h2>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrevious}
            aria-label={`${previousLabel} — ${title}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#171a18] text-white transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4c58f] disabled:cursor-default disabled:opacity-35 disabled:hover:border-white/15 disabled:hover:bg-[#171a18] sm:h-12 sm:w-12"
          >
            <ArrowLeft aria-hidden="true" size={21} weight="regular" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label={`${nextLabel} — ${title}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e4c58f] text-[#101211] transition hover:bg-[#ecd4aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4c58f] disabled:cursor-default disabled:opacity-35 disabled:hover:bg-[#e4c58f] sm:h-12 sm:w-12"
          >
            <ArrowRight aria-hidden="true" size={21} weight="regular" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="overflow-hidden"
        aria-roledescription="carousel"
        aria-label={title}
      >
        <div className="-ml-5 flex w-full [touch-action:pan-y_pinch-zoom]">
          {images.map((image, index) => (
            <article
              key={image.id ?? `${image.image}-${index}`}
              className="min-w-0 flex-[0_0_calc(82%_+_1.25rem)] pl-5 sm:flex-[0_0_calc((100%_+_1.25rem)/2)] xl:flex-[0_0_calc((100%_+_1.25rem)/3)]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${imageLabel} ${index + 1} / ${images.length}`}
            >
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#171a18]">
                <div className="absolute inset-0">
                  {image.mediaType === "video" ? (
                    <video
                      src={image.image}
                      aria-label={image.imageAlt}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : image.image ? (
                    <Image
                      src={image.image}
                      alt={image.imageAlt}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 82vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/45" />
                  {image.image ? <ImageWatermark /> : null}
                </div>
                <h3 className="absolute top-5 left-5 text-sm font-semibold uppercase text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:text-base">
                  {image.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </article>
  );
}
