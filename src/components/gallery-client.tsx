"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Expand } from "lucide-react";
import { GALLERY, type GalleryItem } from "@/lib/gallery";
import { CoverflowSlider } from "@/components/coverflow-slider";
import { Lightbox } from "@/components/lightbox";
import { Reveal } from "@/components/motion";

const FILTERS = ["All", "Keynote", "Panels", "Networking", "Branding"] as const;
type Filter = (typeof FILTERS)[number];

export function GalleryClient() {
  const [filter, setFilter] = useState<Filter>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? GALLERY : GALLERY.filter((g) => g.tag === filter)),
    [filter],
  );

  // Lightbox operates on the full catalogue; map filtered item back to its index.
  const fullIndex = (item: GalleryItem) => GALLERY.findIndex((g) => g.src === item.src);

  return (
    <div>
      {/* Hero strip */}
      <section className="relative dark-mesh grain pt-[120px] pb-16 overflow-hidden">
        <div className="absolute -top-32 right-0 w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-[130px]" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <Reveal>
            <span className="text-[0.66rem] uppercase tracking-[0.32em] text-gold font-semibold">
              The Archive
            </span>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl sm:text-6xl text-ivory">
              Loveworld Trade &amp;{" "}
              <span className="gold-text italic">Investment Forum</span>
            </h1>
            <p className="mt-5 text-ivory/60 max-w-xl mx-auto leading-relaxed">
              Twenty frames from the Accra session — the esteemed ministers sent by Pastor Chris,
              the panels, the fellowship and the B.E.G.I.N desk where it all began.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Coverflow */}
      <section className="bg-ivory pt-14 pb-20 overflow-hidden">
        <Reveal className="mx-auto max-w-7xl px-5 sm:px-8 mb-10">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted text-center">
            Featured — drag to explore
          </p>
        </Reveal>
        <CoverflowSlider items={GALLERY} autoplayMs={4600} />
      </section>

      {/* Filters + masonry wall */}
      <section className="bg-cream py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-emerald-900">
              The full collection
            </h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
                    filter === f
                      ? "bg-emerald-900 text-gold shadow-[0_10px_22px_-12px_rgba(10,61,46,0.9)]"
                      : "bg-white/70 text-ink/60 border border-gold/20 hover:border-gold/60 hover:text-emerald-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div layout className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {filtered.map((g, i) => (
              <motion.button
                layout
                key={g.src}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setLightbox(fullIndex(g))}
                className="group relative mb-5 block w-full break-inside-avoid rounded-2xl overflow-hidden border border-gold/20 text-left"
              >
                <div className={`relative w-full ${g.tall ? "aspect-[3/4]" : "aspect-[3/2]"}`}>
                  <Image
                    src={g.src}
                    alt={g.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-all duration-[900ms] group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/15 to-transparent opacity-85 group-hover:opacity-100 transition duration-500" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-ivory/10 rounded-2xl" />

                  <span className="absolute top-4 left-4 text-[0.55rem] uppercase tracking-[0.25em] text-emerald-deep bg-gold-light/95 rounded-full px-2.5 py-1 font-bold">
                    {g.tag}
                  </span>
                  <span className="absolute top-4 right-4 p-2 rounded-full bg-emerald-deep/60 border border-gold/40 text-gold-light opacity-0 group-hover:opacity-100 transition duration-300">
                    <Expand size={15} />
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition duration-500">
                    <h3 className="font-[family-name:var(--font-display)] text-xl text-ivory leading-tight">
                      {g.title}
                    </h3>
                    <p className="mt-1 text-[0.78rem] text-ivory/65 line-clamp-2 group-hover:line-clamp-3 transition-all">
                      {g.caption}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <Lightbox
        items={GALLERY}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </div>
  );
}
