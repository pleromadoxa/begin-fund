"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarCheck2,
  ClipboardList,
  Handshake,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Counter, Reveal, Stagger, staggerItem } from "../motion";
import { TIER_INFO } from "@/lib/constants";
import type { Tier } from "@/lib/types";

/* ---------------------------------------------------------------- Stats */

export function StatsBand() {
  const stats = [
    { value: 1_000_000, prefix: "$", label: "Fund capital committed" },
    { value: 0, suffix: "%", label: "Interest — principal only" },
    { value: 6, suffix: " mo", label: "Maximum repayment term" },
    { value: 9, suffix: "", label: "Business industries eligible" },
  ];

  return (
    <section className="relative -mt-1 bg-emerald-900">
      <div className="absolute top-0 inset-x-0 h-px gold-rule" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 divide-gold/15 divide-x lg:divide-y-0 divide-y lg:divide-y-0">
          {stats.map((s) => (
            <motion.div key={s.label} variants={staggerItem} className="px-4 sm:px-8 py-10 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-[2.9rem] text-transparent [background:linear-gradient(120deg,#f4dd8c,#c9a54c_60%,#f9ecc0)] [-webkit-background-clip:text] [background-clip:text]">
                <Counter to={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
              </p>
              <p className="mt-2.5 text-[0.66rem] sm:text-[0.7rem] uppercase tracking-[0.2em] text-ivory/55">
                {s.label}
              </p>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- About */

export function About() {
  const terms = [
    { icon: Sparkles, k: "Interest rate", v: "0%", d: "Absolutely interest-free. Ever." },
    { icon: CalendarCheck2, k: "Loan term", v: "Up to 6 months", d: "Flexible, subject to approval." },
    { icon: Banknote, k: "Repayment", v: "Principal only", d: "Per your agreed schedule." },
    { icon: ShieldCheck, k: "Disbursement", v: "Ecobank only", d: "Via a designated Ecobank account." },
  ];

  return (
    <section id="about" className="relative py-24 lg:py-32 bg-ivory overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Reveal>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              The Initiative
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.06] text-emerald-900">
              Capital without the{" "}
              <span className="italic text-gold">burden</span> of interest.
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-ink/72 leading-relaxed">
              At the just-ended Loveworld Trade and Investment Forum, a one million dollar fund was
              announced for the Loveworld Kingdom. B.E.G.I.N is the vehicle that turns that
              announcement into working capital — for eligible church members across Ghana who are
              ready to establish, operate and grow businesses that bless lives.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 space-y-3.5">
              {[
                "Approved applicants sign a separate contract with the bank.",
                "All successful applicants participate in a mandatory business clinic.",
                "Applications are reviewed and interviewed by the committee — submission does not guarantee approval.",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-emerald-900 text-gold flex items-center justify-center">
                    <BadgeCheck size={13} />
                  </span>
                  <p className="text-sm text-ink/75 leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-emerald rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2">
                Create your account <ArrowRight size={15} />
              </Link>
              <Link href="/#tiers" className="rounded-full px-6 py-3 text-sm font-semibold text-emerald-900 border border-emerald-900/20 hover:border-gold hover:bg-gold/10 transition">
                View the tiers
              </Link>
            </div>
          </Reveal>
        </div>

        {/* image + floating terms */}
        <div className="relative">
          <Reveal y={40}>
            <div className="relative aspect-[4/5] rounded-[1.6rem] overflow-hidden border border-gold/30 shadow-[0_60px_120px_-60px_rgba(10,61,46,0.65)]">
              <Image
                src="/images/SUN91161.jpg"
                alt="The B.E.G.I.N desk at LTIF Ghana"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-gold-light">
                  Where it started
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl text-ivory mt-1">
                  The B.E.G.I.N desk, LTIF Ghana
                </p>
              </div>
            </div>
          </Reveal>

          <Stagger className="mt-6 grid grid-cols-2 gap-3">
            {terms.map((t) => (
              <motion.div
                key={t.k}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="card-luxe rounded-xl p-4"
              >
                <t.icon size={16} className="text-gold" />
                <p className="mt-2 text-[0.6rem] uppercase tracking-[0.18em] text-muted">{t.k}</p>
                <p className="font-[family-name:var(--font-display)] text-lg text-emerald-900 mt-0.5">
                  {t.v}
                </p>
                <p className="text-[0.7rem] text-muted mt-1 leading-snug">{t.d}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Tiers */

export function Tiers() {
  const [hovered, setHovered] = useState<Tier | null>(null);

  return (
    <section id="tiers" className="relative py-24 lg:py-32 dark-mesh grain overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              Application Tiers
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-ivory">
              Where does your business <span className="italic gold-text">stand</span>?
            </h2>
            <p className="mt-5 text-ivory/60 text-[0.95rem] leading-relaxed">
              Three tiers, one mandate. Select the tier that honestly reflects your business today
              — each carries its own funding range and document checklist.
            </p>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid md:grid-cols-3 gap-6" gap={0.14}>
          {([1, 2, 3] as Tier[]).map((t) => {
            const info = TIER_INFO[t];
            return (
              <motion.div
                key={t}
                variants={staggerItem}
                onMouseEnter={() => setHovered(t)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={`relative rounded-2xl p-7 flex flex-col card-luxe-dark group ${
                  hovered === t ? "ring-1 ring-gold/60" : ""
                }`}
              >
                <div className="absolute top-0 right-6 font-[family-name:var(--font-display)] text-[5.5rem] leading-none text-gold/10 select-none group-hover:text-gold/20 transition duration-500">
                  {t}
                </div>

                <span className="text-[0.62rem] uppercase tracking-[0.26em] text-gold">
                  {info.title}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-ivory">
                  {info.tagline}
                </h3>
                <p className="mt-3 text-sm text-ivory/60 leading-relaxed flex-1">{info.description}</p>

                <div className="mt-6 space-y-3 border-t border-gold/15 pt-5">
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-light/60">
                      Funding range
                    </p>
                    <p className="text-ivory font-medium mt-0.5">{info.fundingRange}</p>
                  </div>
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-light/60">
                      Eligibility
                    </p>
                    <p className="text-ivory/80 text-sm mt-0.5">{info.turnover}</p>
                  </div>
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-light/60">
                      Documents required
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {info.documents.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-[0.78rem] text-ivory/70">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href="/signup"
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 text-gold-light text-sm font-semibold py-2.5 hover:bg-gold hover:text-emerald-deep transition"
                >
                  Apply as {info.title} <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Process */

const STEPS = [
  {
    icon: UserRoundCheck,
    title: "Create your account",
    d: "Register with your email, Ghana phone number and business name — it takes under a minute.",
  },
  {
    icon: ClipboardList,
    title: "Complete your application",
    d: "A guided five-step form captures your church details, business profile and funding request.",
  },
  {
    icon: Handshake,
    title: "Committee review & interview",
    d: "The committee reviews every submission personally and interviews applicants before deciding.",
  },
  {
    icon: Banknote,
    title: "Contract, clinic & disbursement",
    d: "Sign with the bank, attend the mandatory business clinic, and receive funds via Ecobank.",
  },
];

export function Process() {
  return (
    <section id="process" className="relative py-24 lg:py-32 bg-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              The Journey
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-emerald-900">
              Four steps from form to <span className="italic text-gold">funding</span>.
            </h2>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6" gap={0.12}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              className="relative card-luxe rounded-2xl p-7 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-900 text-gold flex items-center justify-center shadow-[0_14px_28px_-14px_rgba(10,61,46,0.9)] group-hover:scale-105 transition">
                  <s.icon size={20} />
                </div>
                <span className="font-[family-name:var(--font-display)] text-4xl text-gold/25 group-hover:text-gold/50 transition">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl text-emerald-900">
                {s.title}
              </h3>
              <p className="mt-2.5 text-sm text-ink/65 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="mt-12 text-center">
            <Link href="/signup" className="btn-gold rounded-full px-8 py-4 text-sm font-bold inline-flex items-center gap-2">
              Start step one now <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */

const FAQS = [
  {
    q: "Who is eligible to apply?",
    a: "Eligible church members across Ghana — with priority given to brethren in the Christ Embassy Accra Ghana Zone — who operate or are establishing a business and can provide a reputable church leader as guarantor.",
  },
  {
    q: "Is this truly interest-free?",
    a: "Yes. The interest rate is 0%. You repay only the principal, according to the schedule agreed with the bank. There is no processing fee attached to the application.",
  },
  {
    q: "How will funds be disbursed?",
    a: "Only through a designated Ecobank account. A separate contract is signed by all approved applicants and the bank before disbursement.",
  },
  {
    q: "Does submitting guarantee approval?",
    a: "No. Every application is reviewed and interviewed by the committee, and the final decision rests with them after review.",
  },
  {
    q: "What is the business clinic?",
    a: "A mandatory clinic that all successful applicants must attend — equipping you to steward the capital well and grow sustainably.",
  },
  {
    q: "Can a committee member guarantee my loan?",
    a: "No. Committee members are explicitly barred from acting as guarantors, and personal relationships do not influence outcomes.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 lg:py-28 bg-ivory">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-center">
          <Reveal>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              Questions
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-emerald-900">
              Before you <span className="italic text-gold">begin</span>.
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.05}>
                <div
                  className={`rounded-2xl border transition-all duration-400 ${
                    isOpen ? "border-gold/45 bg-white shadow-[0_20px_44px_-32px_rgba(10,61,46,0.5)]" : "border-gold/15 bg-white/55"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                    aria-expanded={isOpen}
                  >
                    <span className="font-[family-name:var(--font-display)] text-lg text-emerald-900">
                      {f.q}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-400 ${
                        isOpen ? "bg-gold text-emerald-deep rotate-180" : "bg-emerald-900/8 text-emerald-900"
                      }`}
                    >
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-sm text-ink/70 leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ CTA */

export function CtaBand() {
  return (
    <section className="relative dark-mesh grain overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px gold-rule" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[46rem] h-[46rem] rounded-full bg-gold/8 blur-[140px] pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-24 lg:py-28 text-center">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.08]">
            The forum has ended.
            <br />
            <span className="gold-text italic">Your business begins.</span>
          </h2>
          <p className="mt-6 text-ivory/60 max-w-xl mx-auto leading-relaxed">
            Create your account, complete your application, and let the committee prayerfully
            consider your request. It takes minutes to start.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-gold rounded-full px-8 py-4 text-sm font-bold inline-flex items-center gap-2 group">
              Create your account <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/signin" className="rounded-full px-8 py-4 text-sm font-semibold text-ivory border border-ivory/25 hover:border-gold hover:text-gold-light transition">
              I already have an account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
