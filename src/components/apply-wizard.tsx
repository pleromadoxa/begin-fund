"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Save } from "lucide-react";
import type { Application, SafeUser } from "@/lib/types";
import { TIER_INFO } from "@/lib/constants";
import { Reveal } from "@/components/motion";
import {
  ApplyForm,
  FormSetter,
  StepApplicant,
  StepBusiness,
  StepDeclaration,
  StepDocuments,
  StepFunding,
  emptyForm,
} from "./apply-steps";

const STEPS = ["Applicant & Church", "Business Profile", "Funding Request", "Documents", "Declaration"];

const READ_ONLY_COPY: Record<string, string> = {
  submitted: "Your application has been received by the committee.",
  under_review: "The committee is prayerfully reviewing your application.",
  more_info_required: "The committee requires a little more information from you.",
  approved: "Your application has been approved — next steps are in your dashboard.",
  rejected: "Your application was not successful at this time.",
};

function formFromApplication(
  user: { fullName: string; email: string; phone: string; businessName: string },
  application: Application | null,
): ApplyForm {
  const base = emptyForm(user);
  if (!application?.data) return base;
  const d = application.data as Partial<ApplyForm>;
  return {
    ...base,
    ...d,
    declarations: Array.isArray(d.declarations) && d.declarations.length
      ? d.declarations
      : base.declarations,
    documentsAck: Array.isArray(d.documentsAck) ? d.documentsAck : [],
  };
}

export function ApplyWizard({
  user,
  application,
  reviewMode = false,
}: {
  user: Omit<SafeUser, "id" | "createdAt">;
  application: Application | null;
  reviewMode?: boolean;
}) {
  const router = useRouter();
  const submitted = application?.status !== undefined && application.status !== "draft";
  const resubmitting = application?.status === "more_info_required";
  const [form, setForm] = useState<ApplyForm>(() => formFromApplication(user, application));
  // "View application"/"Respond now" land on the declaration & summary step.
  const [step, setStep] = useState(() => (reviewMode ? 4 : 0));
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    reviewMode
      ? resubmitting
        ? "The committee has requested more information — review your answers below, adjust anything needed, then resubmit."
        : "You are reviewing your submitted application."
      : null,
  );

  const set: FormSetter = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const readOnly = submitted && application?.status !== "more_info_required";

  const validate = (s: number): string[] => {
    const e: string[] = [];
    const need = (cond: boolean, msg: string) => !cond && e.push(msg);

    if (s === 0) {
      need(form.fullName.trim().length >= 3, "Full name");
      need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), "Valid email address");
      need(form.phone.trim().length >= 9, "Phone number");
      need(form.church.trim().length >= 2, "Church");
      need(form.pastorName.trim().length >= 2, "Church pastor's name");
      need(form.pcf.trim().length >= 1, "PCF");
      need(form.fellowshipLeader.trim().length >= 2, "Fellowship leader's name");
      need(form.churchYears !== "", "How long you have been in church");
      need(form.foundationSchool !== "", "Foundation School status");
      if (form.foundationSchool === "Yes")
        need(/^\d{4}$/.test(form.foundationYear), "Year of Foundation School completion (YYYY)");
      need(form.residentialAddress.trim().length >= 5, "Residential address with GPS");
      need(form.attendedLtif !== "", "LTIF Ghana attendance");
    }
    if (s === 1) {
      need(form.businessName.trim().length >= 2, "Business name");
      need(form.businessAddress.trim().length >= 5, "Business address with GPS");
      need(form.registered !== "", "Registration status");
      need(form.industry !== "", "Business industry");
      if (form.industry === "Other")
        need(form.industryOther.trim().length >= 2, "Industry (as typed)");
    }
    if (s === 2) {
      need(form.tier !== "", "Application tier");
      need(form.loanPurpose.trim().length >= 15, "Loan purpose (a short paragraph)");
      need(
        Number(form.amountRequested) > 0,
        "Specific amount required",
      );
      if (form.tier) {
        const range: Record<string, [number, number]> = {
          "1": [10000, 50000],
          "2": [50001, 100000],
          "3": [100000, Infinity],
        };
        const [min, max] = range[form.tier];
        const amt = Number(form.amountRequested);
        need(
          amt >= min && amt <= max,
          `Amount must fall within the ${TIER_INFO[Number(form.tier) as 1 | 2 | 3].fundingRange} range`,
        );
      }
      need(form.guarantorName.trim().length >= 3, "Guarantor name");
      need(form.guarantorPhone.trim().length >= 9, "Guarantor phone number");
      need(form.repaymentPeriod !== "", "Proposed repayment period");
      need(form.repaymentMode !== "", "Preferred repayment mode");
      if (form.repaymentMode.startsWith("Other"))
        need(form.repaymentOther.trim().length >= 2, "Preferred repayment mode (as typed)");
    }
    if (s === 3) {
      const total = TIER_INFO[Number(form.tier) as 1 | 2 | 3]?.documents.length ?? 0;
      need(
        form.documentsAck.length === total,
        `Confirm all ${total} document items for your tier`,
      );
    }
    if (s === 4) {
      need(form.declarations.every(Boolean), "All declaration boxes must be checked");
    }
    return e;
  };

  const summary = useMemo(
    () => [
      { label: "Applicant", value: form.fullName },
      { label: "Email", value: form.email },
      { label: "Phone", value: form.phone },
      { label: "Church", value: form.church },
      { label: "Business", value: form.businessName },
      { label: "Industry", value: form.industry === "Other" ? form.industryOther : form.industry },
      { label: "Tier", value: form.tier ? TIER_INFO[Number(form.tier) as 1 | 2 | 3].title : "" },
      {
        label: "Amount requested",
        value: form.amountRequested ? `GHS ${Number(form.amountRequested).toLocaleString("en-US")}` : "",
      },
      { label: "Loan purpose", value: form.loanPurpose },
      { label: "Guarantor", value: `${form.guarantorName} — ${form.guarantorPhone}` },
      { label: "Repayment", value: `${form.repaymentPeriod} · ${form.repaymentMode}` },
    ],
    [form],
  );

  async function saveDraft(thenSubmit = false): Promise<boolean> {
    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: form, submit: thenSubmit }),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        setErrors(data.error ? [data.error] : ["Unable to save. Please try again."]);
        return false;
      }
      if (!thenSubmit) setNotice("Draft saved — you can return at any time.");
      return true;
    } catch {
      setSaving(false);
      setErrors(["Network error while saving. Please try again."]);
      return false;
    }
  }

  async function next() {
    setNotice(null);
    const errs = validate(step);
    setErrors(errs);
    if (errs.length) return;
    if (step === STEPS.length - 1) {
      setSubmitting(true);
      const ok = await saveDraft(true);
      setSubmitting(false);
      if (ok) router.push("/dashboard?submitted=1");
      return;
    }
    await saveDraft(false);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setNotice(null);
    setErrors([]);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const stepProps = { f: form, set, errors };

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      {/* Header */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
              Funding Application
            </span>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-emerald-900">
              {readOnly ? "Your submitted application" : "Apply for interest-free funding"}
            </h1>
            <p className="mt-2.5 text-ink/65 max-w-2xl leading-relaxed">
              {readOnly
                ? READ_ONLY_COPY[application?.status ?? "submitted"] ??
                  "Your application is with the committee."
                : "Five short steps. Everything saves as you go — you can finish later from your dashboard."}
            </p>
          </div>
          {application && (
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">Reference</p>
              <p className="font-mono text-emerald-900">{application.reference}</p>
            </div>
          )}
        </div>
      </Reveal>

      {/* Stepper */}
      <Reveal delay={0.08}>
        <div className="mt-10 rounded-2xl border border-gold/25 bg-white/70 backdrop-blur px-4 sm:px-7 py-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center min-w-max">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={label} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => (readOnly ? setStep(i) : i < step && setStep(i))}
                    className={`flex items-center gap-2.5 rounded-full px-3 py-1.5 transition ${
                      readOnly || i <= step ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.72rem] font-bold transition-all duration-400 ${
                        done
                          ? "bg-emerald-900 text-gold"
                          : active
                            ? "bg-gold text-emerald-deep ring-4 ring-gold/25"
                            : "bg-sand text-muted"
                      }`}
                    >
                      {done ? <Check size={13} /> : i + 1}
                    </span>
                    <span
                      className={`text-[0.72rem] font-semibold tracking-wide whitespace-nowrap ${
                        active ? "text-emerald-900" : done ? "text-ink/70" : "text-muted"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span
                      className="w-8 sm:w-12 h-px mx-1"
                      style={{ background: done ? "#0a3d2e" : "#e9e1cd" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Step body */}
      <div className="mt-8 rounded-3xl border border-gold/25 bg-white/85 backdrop-blur p-6 sm:p-9 shadow-[0_34px_80px_-55px_rgba(10,61,46,0.6)]">
        {/* Keyed remount animates in on each step change (AnimatePresence keyed
            swaps do not reliably run animations under React 19 + framer 14). */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="mb-7">
              <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-emerald-900">
                {STEPS[step]}
              </h2>
              <div className="mt-2 h-px w-24 gold-rule" />
            </div>

            {step === 0 && <StepApplicant {...stepProps} />}
            {step === 1 && <StepBusiness {...stepProps} />}
            {step === 2 && <StepFunding {...stepProps} />}
            {step === 3 && <StepDocuments {...stepProps} />}
            {step === 4 && <StepDeclaration {...stepProps} summary={summary} />}
          </motion.div>

        {notice && (
          <p className="mt-6 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {notice}
          </p>
        )}

        {/* Actions */}
        {!readOnly ? (
          <div className="mt-9 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-gold/12 pt-7">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || saving}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-emerald-900 border border-emerald-900/20 hover:border-gold hover:bg-gold/10 transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => saveDraft(false)}
                disabled={saving || submitting}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-muted hover:text-emerald-900 transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save draft
              </button>

              <button
                type="button"
                onClick={next}
                disabled={saving || submitting}
                className="btn-gold flex-1 sm:flex-none rounded-full px-7 py-3.5 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Submitting…
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    Submit application <Check size={16} />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-9 border-t border-gold/12 pt-7 flex items-center justify-between gap-4">
            <p className="text-sm text-muted flex items-center gap-2">
              <Lock size={14} /> Locked while under review.
            </p>
            <Link href="/dashboard" className="btn-emerald rounded-full px-6 py-3 text-sm font-semibold">
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
