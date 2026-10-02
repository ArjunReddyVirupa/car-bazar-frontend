"use client";
import Image from "next/image";
import { useState } from "react";
import type { CarImage } from "@/src/types";
export function CarGallery({
  images,
  name,
}: {
  images: CarImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active]?.publicUrl;
  return (
    <div className="grid gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100">
        {current ? (
          <Image
            src={current}
            alt={`${name} photo ${active + 1}`}
            fill
            sizes="(max-width:1024px) 100vw, 65vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-300">
            No photos yet
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {images.map((im, i) => (
            <button
              key={im.id}
              onClick={() => setActive(i)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${
                active === i ? "border-orange-500" : "border-transparent"
              }`}
            >
              <Image
                src={im.publicUrl}
                alt="Thumbnail"
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
