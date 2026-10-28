"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Pause, Play } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery";
import { Lightbox } from "./lightbox";

export function CoverflowSlider({
  items,
  autoplayMs = 5200,
}: {
  items: GalleryItem[];
  autoplayMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const dragStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + items.length) % items.length),
    [items.length],
  );

  const jump = useCallback(
    (i: number) => setActive(((i % items.length) + items.length) % items.length),
    [items.length],
  );

  // Autoplay + progress bar (resets happen in the event handlers that pause
  // the slider or open the lightbox — no state writes inside effects)
  useEffect(() => {
    if (paused || lightbox !== null) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = (now - start) / autoplayMs;
      if (p >= 1) {
        go(1);
        return;
      }
      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, lightbox, autoplayMs, go]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox !== null) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, lightbox]);

  // Swipe / drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    setPaused(true);
    setProgress(0);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current !== null) {
      const dx = e.clientX - dragStart.current;
      if (Math.abs(dx) > 45) go(dx > 0 ? -1 : 1);
    }
    dragStart.current = null;
    setPaused(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onMouseEnter={() => {
        setPaused(true);
        setProgress(0);
      }}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stage */}
      <div
        className="relative h-[380px] sm:h-[460px] lg:h-[540px] cursor-grab active:cursor-grabbing"
        style={{ perspective: "1700px" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragStart.current = null; setPaused(false); }}
      >
        {/* ambient glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62%] h-[58%] rounded-full bg-gold/14 blur-[110px] pointer-events-none" />

        {items.map((g, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);
          const visible = abs <= 3;
          const isActive = offset === 0;

          return (
            <motion.div
              key={g.src + i}
              className="absolute left-1/2 top-1/2 w-[68%] sm:w-[52%] lg:w-[44%] max-w-[620px]"
              style={{ transformStyle: "preserve-3d", zIndex: 20 - abs }}
              initial={false}
              animate={{
                x: `calc(-50% + ${offset * 46}%)`,
                y: `calc(-50% + ${abs * 2.5}%)`,
                rotateY: offset * -40,
                rotateZ: offset * 1.4,
                scale: 1 - abs * 0.14,
                opacity: visible ? 1 - abs * 0.28 : 0,
                filter: isActive ? "blur(0px)" : `blur(${Math.min(abs * 0.7, 2)}px)`,
                pointerEvents: visible ? "auto" : "none",
              }}
              transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.9 }}
              onClick={() => {
                if (isActive) {
                  setLightbox(i);
                  setProgress(0);
                } else {
                  jump(i);
                }
              }}
            >
              <div
                className={`group relative aspect-[4/3] rounded-[1.1rem] overflow-hidden border transition-all duration-500 ${
                  isActive
                    ? "border-gold/70 shadow-[0_45px_90px_-40px_rgba(0,0,0,0.85),0_0_0_1px_rgba(201,165,76,0.35)]"
                    : "border-ivory/15 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.8)]"
                }`}
              >
                <Image
                  src={g.src}
                  alt={g.title}
                  fill
                  sizes="(max-width: 640px) 68vw, (max-width: 1024px) 52vw, 44vw"
                  className={`object-cover transition-transform duration-[1400ms] ${
                    isActive ? "scale-[1.02] group-hover:scale-110" : "grayscale-[35%] scale-105"
                  }`}
                  draggable={false}
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isActive
                      ? "bg-gradient-to-t from-emerald-deep/88 via-emerald-deep/10 to-transparent opacity-100"
                      : "bg-emerald-deep/55"
                  }`}
                />

                {/* caption for the active card */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-x-0 bottom-0 p-5 sm:p-7"
                    >
                      <span className="inline-block text-[0.58rem] uppercase tracking-[0.3em] text-gold bg-emerald-deep/60 border border-gold/30 rounded-full px-3 py-1 backdrop-blur-sm">
                        {g.tag}
                      </span>
                      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl sm:text-3xl text-ivory leading-tight">
                        {g.title}
                      </h3>
                      <p className="mt-1.5 text-[0.8rem] sm:text-sm text-ivory/70 max-w-md line-clamp-2">
                        {g.caption}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* expand affordance */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox(i);
                      setProgress(0);
                    }}
                    aria-label="Expand image"
                    className="absolute top-4 right-4 p-2 rounded-full bg-emerald-deep/55 border border-gold/40 text-gold-light opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-gold hover:text-emerald-deep"
                  >
                    <Expand size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="relative mt-8 sm:mt-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="p-3 rounded-full border border-gold/35 text-emerald-900 hover:bg-gold hover:text-emerald-deep transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => {
              const next = !paused;
              setPaused(next);
              if (next) setProgress(0);
            }}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="p-3 rounded-full border border-gold/35 text-emerald-900 hover:bg-gold hover:text-emerald-deep transition"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>

          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="p-3 rounded-full border border-gold/35 text-emerald-900 hover:bg-gold hover:text-emerald-deep transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* thumbnails */}
        <div className="w-full max-w-4xl overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2.5 justify-start sm:justify-center min-w-max px-2">
            {items.map((g, i) => (
              <button
                key={g.src + i}
                onClick={() => jump(i)}
                aria-label={`View ${g.title}`}
                className={`relative w-14 h-10 rounded-md overflow-hidden border transition-all duration-300 shrink-0 ${
                  i === active
                    ? "border-gold scale-110 shadow-[0_8px_18px_-8px_rgba(201,165,76,0.8)]"
                    : "border-ivory/20 opacity-55 hover:opacity-90 grayscale"
                }`}
              >
                <Image src={g.src} alt="" fill sizes="56px" className="object-cover" />
                {i === active && (
                  <motion.span
                    key={`bar-${active}`}
                    className="absolute bottom-0 left-0 h-[2px] bg-gold"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">
          {String(active + 1).padStart(2, "0")} — {String(items.length).padStart(2, "0")} · Drag, swipe or use arrow keys
        </p>
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
