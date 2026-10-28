"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wordmark } from "./wordmark";

const COLLAGE = [
  { src: "/images/SUN90137.jpg", className: "absolute top-[6%] left-[8%] w-[54%] rotate-[-6deg]", delay: 0.3 },
  { src: "/images/SUN90941.jpg", className: "absolute top-[30%] right-[4%] w-[52%] rotate-[5deg]", delay: 0.45 },
  { src: "/images/SUN90331.jpg", className: "absolute bottom-[8%] left-[16%] w-[56%] rotate-[2deg]", delay: 0.6 },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] grid lg:grid-cols-[1fr_1.05fr]">
      {/* Form side */}
      <div className="relative flex flex-col px-6 sm:px-12 lg:px-16 py-10 bg-ivory">
        <div className="flex items-center justify-between">
          <Wordmark size="sm" />
          <Link href="/" className="text-[0.72rem] uppercase tracking-[0.18em] text-muted hover:text-emerald-800 transition">
            ← Back home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-emerald-900 leading-tight">
              {title}
            </h1>
            <p className="mt-2.5 text-sm text-muted leading-relaxed">{subtitle}</p>
            <div className="mt-6 h-px gold-rule" />
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>

        <div className="text-center text-xs text-muted">{footer}</div>
      </div>

      {/* Image side */}
      <div className="relative hidden lg:block dark-mesh grain overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-emerald-500/14 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-gold/12 blur-[120px]" />

        <div className="relative h-full w-full" style={{ perspective: "1300px" }}>
          {COLLAGE.map((c, i) => (
            <motion.div
              key={c.src}
              initial={{ opacity: 0, scale: 0.86, y: 34 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: c.delay, ease: [0.22, 1, 0.36, 1] }}
              className={c.className}
            >
              <motion.div
                className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-gold/35 shadow-[0_50px_100px_-45px_rgba(0,0,0,0.95)]"
                animate={{ y: [0, -13, 0] }}
                transition={{ duration: 6.5 + i * 1.3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image src={c.src} alt="LTIF Ghana" fill sizes="600px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/50 to-transparent" />
              </motion.div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="absolute bottom-10 left-10 right-10"
          >
            <p className="font-[family-name:var(--font-display)] text-3xl text-ivory leading-snug">
              “The thief comes only to steal and kill and destroy. I came that they may have life —
              <span className="gold-text"> and have it abundantly.</span>”
            </p>
            <p className="mt-3 text-[0.66rem] uppercase tracking-[0.26em] text-gold-light/80">
              John 10:10 · The mandate behind B.E.G.I.N
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* Shared small pieces */

export function Alert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={`rounded-xl px-4 py-3 text-sm leading-snug mb-5 border ${
        kind === "error"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block mb-4">
      <span className="label-mini">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.7rem] text-muted">{hint}</span>}
    </label>
  );
}
