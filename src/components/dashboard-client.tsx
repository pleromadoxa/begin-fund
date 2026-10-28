"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileCheck2,
  Mail,
  Phone,
  ScrollText,
  ThumbsDown,
  UserRound,
} from "lucide-react";
import type { Application, ApplicationStatus, SafeUser } from "@/lib/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/types";
import { FUND_TERMS, TIER_INFO } from "@/lib/constants";
import { Reveal } from "@/components/motion";

const FLOW: ApplicationStatus[] = ["draft", "submitted", "under_review"];

const STATUS_BLURB: Record<ApplicationStatus, string> = {
  draft: "Your application is saved as a draft. Complete it and submit when you are ready.",
  submitted: "Your application has been received by the B.E.G.I.N committee.",
  under_review: "The committee is prayerfully reviewing your application. An interview may follow.",
  more_info_required:
    "The committee needs a little more information from you before proceeding. See the notes below.",
  approved: "Congratulations! Your application has been approved. Next steps are outlined below.",
  rejected: "Unfortunately your application was not successful at this time.",
};

const STATUS_ICON: Record<ApplicationStatus, React.ComponentType<{ size?: number }>> = {
  draft: CircleDashed,
  submitted: FileCheck2,
  under_review: Clock3,
  more_info_required: AlertTriangle,
  approved: BadgeCheck,
  rejected: ThumbsDown,
};

export function DashboardClient({
  user,
  application,
  justSubmitted = false,
}: {
  user: SafeUser;
  application: Application | null;
  justSubmitted?: boolean;
}) {
  const status: ApplicationStatus = application?.status ?? "draft";
  const color = STATUS_COLORS[status];
  const Icon = STATUS_ICON[status];
  const tier = application?.tier ? (application.tier as 1 | 2 | 3) : null;
  const tierInfo = tier ? TIER_INFO[tier] : null;
  const firstName = user.fullName.split(" ")[0];

  const stepIndex = status === "more_info_required" ? 2 : FLOW.indexOf(status);
  const flowLabels = [
    { label: "Draft", icon: CircleDashed },
    { label: "Submitted", icon: FileCheck2 },
    { label: "Under review", icon: Clock3 },
    { label: "Decision", icon: BadgeCheck },
  ];
  const decided = status === "approved" || status === "rejected";
  const currentStep = decided ? 3 : Math.max(stepIndex, 0);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      {/* Post-submission confirmation */}
      {justSubmitted && (
        <Reveal>
          <div className="mb-8 rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-5 sm:p-6 flex items-start gap-4">
            <CheckCircle2 size={22} className="text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg text-emerald-900">
                Application submitted — thank you!
              </h2>
              <p className="mt-1 text-sm text-emerald-900/80 leading-relaxed">
                Your application is now with the Review Committee. You will be contacted on your
                registered phone or email if anything else is needed — and every decision will
                appear right here on your dashboard.
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {/* Greeting */}
      <Reveal>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              Applicant Dashboard
            </span>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-emerald-900 leading-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-3 text-ink/65 flex items-center gap-2">
              <Building2 size={16} className="text-gold" />
              <span className="font-medium text-emerald-900">{user.businessName}</span>
              <span className="text-muted">— your B.E.G.I.N applicant portal</span>
            </p>
          </div>

          {!application || status === "draft" ? (
            <Link href="/apply" className="btn-gold rounded-full px-7 py-3.5 text-sm font-bold inline-flex items-center gap-2 self-start">
              {application ? "Continue application" : "Start application"} <ArrowRight size={16} />
            </Link>
          ) : (
            <Link href="/apply?review=1" className="rounded-full px-7 py-3.5 text-sm font-semibold text-emerald-900 border border-emerald-900/25 hover:border-gold hover:bg-gold/10 transition inline-flex items-center gap-2 self-start">
              <ScrollText size={15} /> View application
            </Link>
          )}
        </div>
      </Reveal>

      <div className="mt-10 grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Status hero card */}
          <Reveal delay={0.06}>
            <motion.div
              layout
              className="relative rounded-3xl overflow-hidden border border-gold/25 bg-white shadow-[0_30px_70px_-45px_rgba(10,61,46,0.55)]"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
              <div className="p-7 sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18`, color }}
                    >
                      <Icon size={24} />
                    </span>
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">
                        Application status
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl mt-1" style={{ color }}>
                        {STATUS_LABELS[status]}
                      </h2>
                      <p className="mt-2 text-sm text-ink/65 max-w-lg leading-relaxed">
                        {STATUS_BLURB[status]}
                      </p>
                    </div>
                  </div>

                  {application && (
                    <div className="text-right">
                      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">Reference</p>
                      <p className="font-mono text-sm text-emerald-900 mt-1">{application.reference}</p>
                      {tier && (
                        <p className="mt-2 inline-block text-[0.62rem] uppercase tracking-[0.18em] font-bold text-emerald-deep bg-gold-light rounded-full px-3 py-1">
                          {TIER_INFO[tier].title}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress stepper */}
                <div className="mt-9 grid grid-cols-4 gap-2">
                  {flowLabels.map((s, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={s.label} className="relative">
                        <div className="flex items-center">
                          <span
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                              done
                                ? "bg-emerald-900 text-gold"
                                : active
                                  ? "text-emerald-deep ring-4"
                                  : "bg-sand text-muted"
                            }`}
                            style={active ? { background: color, color: "#fff", ["--tw-ring-color" as string]: `${color}33` } : undefined}
                          >
                            {done ? <CheckCircle2 size={16} /> : <s.icon size={15} />}
                          </span>
                          {i < flowLabels.length - 1 && (
                            <span
                              className="flex-1 h-[2px] mx-1.5 rounded-full transition-colors duration-500"
                              style={{ background: i < currentStep ? color : "#e9e1cd" }}
                            />
                          )}
                        </div>
                        <p className={`mt-2 text-[0.66rem] uppercase tracking-[0.14em] font-semibold ${active || done ? "text-emerald-900" : "text-muted"}`}>
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requested amount strip */}
              {application?.amountRequested && (
                <div className="border-t border-gold/15 bg-ivory/70 px-7 sm:px-9 py-5 flex flex-wrap items-center gap-x-10 gap-y-3">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">Amount requested</p>
                    <p className="font-[family-name:var(--font-display)] text-xl text-emerald-900 mt-0.5">
                      GHS {application.amountRequested.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">Submitted</p>
                    <p className="text-emerald-900 font-medium mt-0.5">
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "long", year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  {tierInfo && (
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">Repayment window</p>
                      <p className="text-emerald-900 font-medium mt-0.5">Up to 6 months · 0% interest</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </Reveal>

          {/* Committee note / action required */}
          {status === "more_info_required" && (
            <Reveal delay={0.1}>
              <div className="rounded-2xl border-2 border-amber-300/70 bg-amber-50/70 p-6 sm:p-7">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={18} /> Action required from you
                </h3>
                <p className="mt-3 text-sm text-amber-900/80 leading-relaxed">
                  {application?.reviewNote ??
                    "Please send the outstanding documents listed below to the committee email so your review can continue."}
                </p>
                <Link
                  href="/apply?review=1"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-600 text-white px-6 py-3 text-sm font-semibold hover:bg-amber-700 transition"
                >
                  Respond now <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          )}

          {status === "approved" && (
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/60 p-6 sm:p-7">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-900 flex items-center gap-2">
                  <BadgeCheck size={18} /> Your next steps
                </h3>
                <ol className="mt-4 space-y-3">
                  {[
                    "Attend your committee interview (you will be contacted on your registered phone).",
                    "Sign the disbursement contract with the bank.",
                    "Provide your designated Ecobank account details.",
                    "Attend the mandatory business clinic.",
                  ].map((s, i) => (
                    <li key={s} className="flex items-start gap-3 text-sm text-emerald-900/85">
                      <span className="mt-0.5 w-6 h-6 rounded-full bg-emerald-900 text-gold flex items-center justify-center text-[0.7rem] font-bold shrink-0">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          )}

          {/* Documents checklist */}
          {tierInfo && (
            <Reveal delay={0.14}>
              <div className="rounded-2xl border border-gold/25 bg-white p-6 sm:p-7 shadow-[0_24px_54px_-40px_rgba(10,61,46,0.5)]">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-900">
                  {tierInfo.title} document checklist
                </h3>
                <p className="mt-1.5 text-sm text-muted">
                  Email these to the committee — they are required for your tier.
                </p>
                <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
                  {tierInfo.documents.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-ink/72 bg-ivory/70 border border-gold/15 rounded-lg px-3.5 py-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* Timeline */}
          {application && application.timeline.length > 0 && (
            <Reveal delay={0.18}>
              <div className="rounded-2xl border border-gold/25 bg-white p-6 sm:p-7 shadow-[0_24px_54px_-40px_rgba(10,61,46,0.5)]">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-900">
                  Application timeline
                </h3>
                <ol className="mt-6 relative">
                  {[...application.timeline].reverse().map((ev, i, arr) => (
                    <li key={`${ev.status}-${ev.at}`} className="relative pl-8 pb-7 last:pb-0">
                      {i < arr.length - 1 && (
                        <span className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-gold/60 to-gold/10" />
                      )}
                      <span
                        className="absolute left-0 top-1 w-[23px] h-[23px] rounded-full border-2 bg-white flex items-center justify-center"
                        style={{ borderColor: STATUS_COLORS[ev.status] }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[ev.status] }} />
                      </span>
                      <p className="text-sm font-semibold text-emerald-900">{STATUS_LABELS[ev.status]}</p>
                      {ev.note && <p className="text-[0.8rem] text-ink/65 mt-0.5 leading-relaxed">{ev.note}</p>}
                      <p className="text-[0.68rem] text-muted mt-1">
                        {new Date(ev.at).toLocaleString("en-GB", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:sticky lg:top-[110px]">
          {/* Profile card */}
          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-gold/25 bg-emerald-900 text-ivory p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold/12 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3.5">
                  <span className="w-12 h-12 rounded-full bg-gold text-emerald-deep flex items-center justify-center font-[family-name:var(--font-display)] text-xl font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg leading-tight">{user.fullName}</p>
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-gold-light/80 mt-0.5">
                      Registered applicant
                    </p>
                  </div>
                </div>

                <dl className="mt-6 space-y-3.5 border-t border-ivory/12 pt-5">
                  <div className="flex items-start gap-3">
                    <Building2 size={15} className="mt-0.5 text-gold" />
                    <div>
                      <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-ivory/45">Business</dt>
                      <dd className="text-sm text-ivory">{user.businessName}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={15} className="mt-0.5 text-gold" />
                    <div>
                      <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-ivory/45">Email</dt>
                      <dd className="text-sm text-ivory break-all">{user.email}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={15} className="mt-0.5 text-gold" />
                    <div>
                      <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-ivory/45">Phone</dt>
                      <dd className="text-sm text-ivory">{user.phone}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarClock size={15} className="mt-0.5 text-gold" />
                    <div>
                      <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-ivory/45">Member since</dt>
                      <dd className="text-sm text-ivory">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>

          {/* Fund terms reminder */}
          <Reveal delay={0.16}>
            <div className="rounded-2xl border border-gold/25 bg-white p-6 sm:p-7 shadow-[0_24px_54px_-40px_rgba(10,61,46,0.5)]">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-900 flex items-center gap-2">
                <UserRound size={17} className="text-gold" /> Your fund terms
              </h3>
              <dl className="mt-5 divide-y divide-gold/12">
                {FUND_TERMS.map((t) => (
                  <div key={t.label} className="flex items-center justify-between py-3">
                    <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-muted">{t.label}</dt>
                    <dd className="text-sm font-semibold text-emerald-900">{t.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.72rem] text-muted leading-relaxed">
                All successful applicants participate in a mandatory business clinic. Disbursement is
                made only through a designated Ecobank account.
              </p>
            </div>
          </Reveal>

          {/* Help */}
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-gold/25 bg-gold/8 p-6">
              <h4 className="font-[family-name:var(--font-display)] text-lg text-emerald-900">Need help?</h4>
              <p className="mt-1.5 text-sm text-ink/65 leading-relaxed">
                Reach the B.E.G.I.N secretariat for enquiries about your application.
              </p>
              <a
                href="mailto:begin@loveworldcommerce.org"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-900 text-gold px-5 py-2.5 text-sm font-semibold hover:bg-emerald-800 transition"
              >
                <Mail size={14} /> Email the committee
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
