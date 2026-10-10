"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { CarImage } from "@/src/types";
export function CarGallery({
  images,
  name,
}: {
  images: CarImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const current = images[active]?.publicUrl;

  const showPrevious = useCallback(() => {
    setActive((index) => (index === 0 ? images.length - 1 : index - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActive((index) => (index === images.length - 1 ? 0 : index + 1));
  }, [images.length]);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // Keyboard navigation while the full-screen viewer is open.
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFullscreen();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, closeFullscreen, showPrevious, showNext]);

  // Support swiping between images on touch screens.
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStart === null) return;

    const difference = touchStart - event.changedTouches[0].clientX;

    if (Math.abs(difference) > 50) {
      if (difference > 0) showNext();
      else showPrevious();
    }

    setTouchStart(null);
  };

  return (
    <>
      <div className="grid gap-3">
        {/* Main image */}
        <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100">
          {current ? (
            <>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="absolute inset-0 z-10 cursor-zoom-in"
                aria-label={`View ${name} photo ${active + 1} fullscreen`}
              >
                <span className="sr-only">Open full-screen gallery</span>
              </button>

              <Image
                src={current}
                alt={`${name} photo ${active + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                priority
              />

              <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Maximize2 size={16} />
                View all photos
              </div>

              {images.length > 1 && (
                <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-semibold text-white">
                  {active + 1} / {images.length}
                </div>
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center text-slate-300">
              No photos yet
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => {
                  setActive(index);
                  setIsFullscreen(true);
                }}
                aria-label={`View photo ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  active === index
                    ? "border-orange-500"
                    : "border-transparent hover:border-orange-300"
                }`}
              >
                <Image
                  src={image.publicUrl}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen gallery */}
      {isFullscreen && current && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo gallery`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar */}
          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold sm:text-base">{name}</p>
              <p className="mt-1 text-xs text-white/60">
                Photo {active + 1} of {images.length}
              </p>
            </div>

            <button
              type="button"
              onClick={closeFullscreen}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Close full-screen gallery"
              title="Close (Esc)"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main full-screen image */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-3 sm:px-16">
            <div className="relative h-full w-full">
              <Image
                key={current}
                src={current}
                alt={`${name} photo ${active + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/30 sm:left-5 sm:size-14"
                  aria-label="Previous photo"
                  title="Previous photo (←)"
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/30 sm:right-5 sm:size-14"
                  aria-label="Next photo"
                  title="Next photo (→)"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Bottom thumbnail strip */}
          {images.length > 1 && (
            <div className="hide-scrollbar flex shrink-0 justify-start gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Go to photo ${index + 1}`}
                  aria-current={active === index ? "true" : undefined}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-24 ${
                    active === index
                      ? "border-orange-500 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image.publicUrl}
                    alt={`${name} thumbnail ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
