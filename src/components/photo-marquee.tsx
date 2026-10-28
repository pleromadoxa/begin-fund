"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { Lightbox } from "./lightbox";

export function PhotoMarquee({ items }: { items: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-2 group/marquee">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-ivory to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-ivory to-transparent" />

      <div className="flex w-max gap-4 animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((g, i) => {
          const realIndex = i % items.length;
          return (
            <button
              key={g.src + i}
              onClick={() => setLightbox(realIndex)}
              className={`relative shrink-0 rounded-xl overflow-hidden border border-gold/20 group/card ${
                g.tall ? "w-52 h-72" : "w-72 h-56"
              }`}
            >
              <Image
                src={g.src}
                alt={g.title}
                fill
                sizes="288px"
                className="object-cover transition-all duration-700 group-hover/card:scale-110 group-hover/card:saturate-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/75 via-transparent to-transparent opacity-80 group-hover/card:opacity-100 transition duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-left translate-y-1 group-hover/card:translate-y-0 transition duration-500">
                <span className="text-[0.55rem] uppercase tracking-[0.25em] text-gold-light">
                  {g.tag}
                </span>
                <p className="text-[0.78rem] font-medium text-ivory leading-snug mt-0.5 line-clamp-2">
                  {g.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Lightbox
        items={items}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </div>
  );
}
