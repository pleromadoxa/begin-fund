"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Counter, EASE, useMouseTilt } from "../motion";

const HERO_IMAGES = [
  { src: "/images/SUN91044.jpg", pos: "top-[2%] left-[4%] w-[52%] rotate-[-5deg]", delay: 0.35 },
  { src: "/images/SUN90287.jpg", pos: "top-[26%] right-[0%] w-[56%] rotate-[4deg]", delay: 0.5 },
  { src: "/images/SUN90226.jpg", pos: "bottom-[4%] left-[16%] w-[50%] rotate-[2.5deg]", delay: 0.65 },
];

export function Hero() {
  const { ref: tiltRef, rotateX, rotateY } = useMouseTilt();

  return (
    <section className="relative min-h-[100svh] dark-mesh grain overflow-hidden pt-[76px]">
      {/* decorative orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-emerald-500/12 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-[130px]"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-8 items-center min-h-[calc(100svh-76px)] py-14">
        {/* Copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/8 px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.24em] text-gold-light backdrop-blur-sm"
          >
            <Sparkles size={13} className="text-gold" />
            Loveworld Trade &amp; Investment Forum · Ghana
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.2, ease: EASE }}
            className="mt-7 font-[family-name:var(--font-display)] text-ivory text-[2.7rem] leading-[1.04] sm:text-6xl lg:text-[4.4rem] font-semibold"
          >
            A{" "}
            <span className="gold-text italic font-light">$1,000,000</span>{" "}
            mandate for kingdom
            <br className="hidden sm:block" /> entrepreneurs.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.34, ease: EASE }}
            className="mt-6 max-w-xl text-[0.98rem] sm:text-lg leading-relaxed text-ivory/72"
          >
            B.E.G.I.N is the Business Expansion and Growth Initiative — interest-free business
            funding for eligible brethren across Ghana, beginning with the Christ Embassy Accra
            Ghana Zone. Establish it. Operate it. Grow it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.46, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/signup"
              className="btn-gold rounded-full px-7 py-3.5 text-sm font-bold tracking-wide inline-flex items-center gap-2 group"
            >
              Begin Your Application
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/gallery"
              className="rounded-full px-7 py-3.5 text-sm font-semibold text-ivory border border-ivory/25 hover:border-gold hover:text-gold-light transition-all duration-300"
            >
              See the Forum
            </Link>
          </motion.div>

          {/* term chips */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-gold/20 border border-gold/20 rounded-xl overflow-hidden max-w-2xl"
          >
            {[
              { k: "Interest", v: "0%" },
              { k: "Term", v: "≤ 6 mo" },
              { k: "Repay", v: "Principal" },
              { k: "Via", v: "Ecobank" },
            ].map((t) => (
              <div key={t.k} className="bg-emerald-deep/70 backdrop-blur-sm px-4 py-3.5 text-center">
                <dt className="text-[0.58rem] uppercase tracking-[0.22em] text-gold-light/70">
                  {t.k}
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-ivory text-lg">
                  {t.v}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Floating image collage */}
        <div
          ref={tiltRef}
          className="relative h-[380px] sm:h-[480px] lg:h-[560px] hidden md:block"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            className="relative w-full h-full"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            {HERO_IMAGES.map((img, i) => (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, scale: 0.86, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: img.delay, ease: EASE }}
                className={`absolute ${img.pos}`}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-gold/35 shadow-[0_50px_100px_-45px_rgba(0,0,0,0.95)]"
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 6 + i * 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src={img.src}
                    alt="Loveworld Trade and Investment Forum Ghana"
                    fill
                    sizes="600px"
                    className="object-cover"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/55 via-transparent to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-ivory/10 rounded-2xl" />
                </motion.div>
              </motion.div>
            ))}

            {/* floating stat chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
              className="absolute bottom-[6%] right-[2%] rounded-2xl card-luxe-dark px-5 py-4 backdrop-blur-md"
              style={{ transform: "translateZ(70px)" }}
            >
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold-light/80">
                Fund capital
              </p>
              <p className="font-[family-name:var(--font-display)] text-3xl text-ivory mt-1">
                $<Counter to={1} decimals={0} />M
              </p>
              <p className="text-[0.62rem] text-ivory/50 mt-0.5">Announced at LTIF Ghana</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[0.58rem] uppercase tracking-[0.3em] text-ivory/40">Scroll</span>
        <span className="relative block h-10 w-px bg-ivory/20 overflow-hidden">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-gold"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
