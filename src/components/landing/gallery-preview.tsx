"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../motion";
import { CoverflowSlider } from "../coverflow-slider";
import { PhotoMarquee } from "../photo-marquee";
import { GALLERY } from "@/lib/gallery";

export function GalleryPreview() {
  const feature = GALLERY.slice(0, 9);
  const strip = GALLERY.slice(9);

  return (
    <section id="gallery" className="relative py-24 lg:py-32 bg-ivory overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <Reveal className="max-w-2xl">
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              Moments from LTIF Ghana
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.06] text-emerald-900">
              The forum where <span className="italic text-gold">$1M</span> was set in motion.
            </h2>
            <p className="mt-5 text-ink/65 leading-relaxed">
              Ministers, panels, fellowship and the B.E.G.I.N desk itself — drag through the moments
              that launched the fund.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-900/25 px-6 py-3 text-sm font-semibold text-emerald-900 hover:border-gold hover:bg-gold/10 transition"
            >
              Open full gallery
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="mt-16">
        <CoverflowSlider items={feature} />
      </div>

      <div className="mt-20">
        <Reveal className="mx-auto max-w-7xl px-5 sm:px-8 mb-8">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted text-center">
            More from the exhibition floor
          </p>
        </Reveal>
        <PhotoMarquee items={strip} />
      </div>
    </section>
  );
}
