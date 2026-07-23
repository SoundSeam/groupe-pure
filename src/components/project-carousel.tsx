"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";

type CarouselImage = {
  title: string;
  image: string;
  imageAlt: string;
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function goTo(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slides = Array.from(viewport.children) as HTMLElement[];
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const maxStartIndex = Math.max(
      0,
      slides.findIndex((slide) => slide.offsetLeft >= maxScrollLeft),
    );
    const nextIndex =
      (index + maxStartIndex + 1) % (maxStartIndex + 1);
    const slide = viewport.children.item(nextIndex) as HTMLElement | null;

    viewport.scrollTo({
      left: Math.min(slide?.offsetLeft ?? 0, maxScrollLeft),
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  }

  function updateActiveIndex() {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slides = Array.from(viewport.children) as HTMLElement[];
    const nearestIndex = slides.reduce((nearest, slide, index) => {
      const currentDistance = Math.abs(
        slides[nearest].offsetLeft - viewport.scrollLeft,
      );
      const nextDistance = Math.abs(slide.offsetLeft - viewport.scrollLeft);
      return nextDistance < currentDistance ? index : nearest;
    }, 0);

    setActiveIndex(nearestIndex);
  }

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
            onClick={() => goTo(activeIndex - 1)}
            aria-label={`${previousLabel} — ${title}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#171a18] text-white transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4c58f] sm:h-12 sm:w-12"
          >
            <ArrowLeft aria-hidden="true" size={21} weight="regular" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label={`${nextLabel} — ${title}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e4c58f] text-[#101211] transition hover:bg-[#ecd4aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4c58f] sm:h-12 sm:w-12"
          >
            <ArrowRight aria-hidden="true" size={21} weight="regular" />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-5 overflow-x-auto [scrollbar-width:none] sm:auto-cols-[calc((100%_-_1.25rem)/2)] xl:auto-cols-[calc((100%_-_2.5rem)/3)] [&::-webkit-scrollbar]:hidden"
        onScroll={updateActiveIndex}
        aria-roledescription="carousel"
        aria-label={title}
      >
        {images.map((image, index) => (
          <article
            key={`${image.image}-${index}`}
            className="group relative aspect-[4/3] snap-start overflow-hidden rounded-xl bg-[#171a18]"
            role="group"
            aria-roledescription="slide"
            aria-label={`${imageLabel} ${index + 1} / ${images.length}`}
          >
            <div className="absolute inset-0">
              <Image
                src={image.image}
                alt={image.imageAlt}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 82vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/45" />
            </div>
            <h3 className="absolute top-5 left-5 text-sm font-semibold uppercase text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:text-base">
              {image.title}
            </h3>
          </article>
        ))}
      </div>
    </article>
  );
}
