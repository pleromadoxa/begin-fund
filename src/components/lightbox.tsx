"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/gallery";

export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const open = index !== null;

  const prev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const next = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, prev, next]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] bg-emerald-deep/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 p-2.5 rounded-full border border-gold/40 text-gold-light hover:bg-gold hover:text-emerald-deep transition"
          >
            <X size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 z-10 p-3 rounded-full border border-gold/30 text-ivory/80 hover:bg-gold hover:text-emerald-deep transition"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 z-10 p-3 rounded-full border border-gold/30 text-ivory/80 hover:bg-gold hover:text-emerald-deep transition"
          >
            <ChevronRight size={22} />
          </button>

          <motion.figure
            key={item.src}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-gold/30 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
              <Image
                src={item.src}
                alt={item.title}
                width={1600}
                height={1067}
                className="w-full max-h-[74vh] object-contain bg-black/40"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-deep/95 to-transparent" />
            </div>
            <figcaption className="mt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[0.62rem] uppercase tracking-[0.28em] text-gold">
                  {item.tag} — {index! + 1} / {items.length}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-ivory mt-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-ivory/60 mt-1 max-w-xl">{item.caption}</p>
              </div>
              <div className="text-xs text-gold-light/70 font-mono tracking-widest">
                LTIF · GHANA
              </div>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
