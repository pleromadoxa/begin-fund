"use client";

import { AlertTriangle } from "lucide-react";
import { CHURCH_YEARS, DECLARATIONS, FOUNDATION_SCHOOL, INDUSTRIES, REPAYMENT_MODES, REPAYMENT_PERIODS, TIER_INFO } from "@/lib/constants";
import { Field } from "@/components/auth-shell";
import type { Tier } from "@/lib/types";

export interface ApplyForm {
  fullName: string;
  email: string;
  phone: string;
  church: string;
  pastorName: string;
  pcf: string;
  fellowshipLeader: string;
  churchYears: string;
  foundationSchool: string;
  foundationYear: string;
  residentialAddress: string;
  attendedLtif: string;
  businessName: string;
  businessAddress: string;
  registered: string;
  industry: string;
  industryOther: string;
  tier: string;
  loanPurpose: string;
  amountRequested: string;
  guarantorName: string;
  guarantorPhone: string;
  repaymentPeriod: string;
  repaymentMode: string;
  repaymentOther: string;
  documentsAck: string[];
  declarations: boolean[];
}

export type FormSetter = <K extends keyof ApplyForm>(key: K, value: ApplyForm[K]) => void;

export const emptyForm = (user: {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
}): ApplyForm => ({
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  church: "",
  pastorName: "",
  pcf: "",
  fellowshipLeader: "",
  churchYears: "",
  foundationSchool: "",
  foundationYear: "",
  residentialAddress: "",
  attendedLtif: "",
  businessName: user.businessName,
  businessAddress: "",
  registered: "",
  industry: "",
  industryOther: "",
  tier: "",
  loanPurpose: "",
  amountRequested: "",
  guarantorName: "",
  guarantorPhone: "",
  repaymentPeriod: "",
  repaymentMode: "",
  repaymentOther: "",
  documentsAck: [],
  declarations: Array(DECLARATIONS.length).fill(false),
});

/* ------------------------------------------------------------- helpers */

function Choices({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2.5`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-all duration-250 ${
              active
                ? "border-gold bg-gold/12 text-emerald-900 font-semibold shadow-[0_10px_24px_-16px_rgba(201,165,76,0.9)]"
                : "border-ink/12 bg-white/70 text-ink/70 hover:border-gold/50 hover:bg-white"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-5">
      <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
        <AlertTriangle size={15} /> Please complete the following:
      </p>
      <ul className="mt-2 space-y-1 text-[0.8rem] text-red-700 list-disc list-inside">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------- step 1 */

export function StepApplicant({ f, set, errors }: { f: ApplyForm; set: FormSetter; errors: string[] }) {
  return (
    <div>
      <ErrorList errors={errors} />
      <div className="grid sm:grid-cols-2 gap-x-5">
        <Field label="Full name" required>
          <input className="field" value={f.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="Email address" required>
          <input type="email" className="field" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Phone number" required>
          <input className="field" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Church" required>
          <input className="field" value={f.church} onChange={(e) => set("church", e.target.value)} placeholder="Christ Embassy …" />
        </Field>
        <Field label="Church pastor's name" required>
          <input className="field" value={f.pastorName} onChange={(e) => set("pastorName", e.target.value)} />
        </Field>
        <Field label="PCF" required hint="Parish / Cell Fellowship">
          <input className="field" value={f.pcf} onChange={(e) => set("pcf", e.target.value)} />
        </Field>
        <Field label="Fellowship leader's name" required>
          <input className="field" value={f.fellowshipLeader} onChange={(e) => set("fellowshipLeader", e.target.value)} />
        </Field>
        <Field label="Residential address (include GPS)" required>
          <input className="field" value={f.residentialAddress} onChange={(e) => set("residentialAddress", e.target.value)} placeholder="e.g. Plus code GA-123-456" />
        </Field>
      </div>

      <div className="mt-1">
        <Field label="How long have you been in church?" required>
          <Choices options={CHURCH_YEARS} value={f.churchYears} onChange={(v) => set("churchYears", v)} columns={4} />
        </Field>

        <Field label="Have you completed Foundation School?" required>
          <Choices options={FOUNDATION_SCHOOL} value={f.foundationSchool} onChange={(v) => set("foundationSchool", v)} columns={3} />
        </Field>

        {f.foundationSchool === "Yes" && (
          <Field label="If yes, state the year of completion" required>
            <input className="field max-w-[220px]" inputMode="numeric" value={f.foundationYear} onChange={(e) => set("foundationYear", e.target.value)} placeholder="2023" />
          </Field>
        )}

        <Field label="Did you attend the LTIF Ghana?" required>
          <Choices options={["YES", "NO"]} value={f.attendedLtif} onChange={(v) => set("attendedLtif", v)} columns={2} />
        </Field>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- step 2 */

export function StepBusiness({ f, set, errors }: { f: ApplyForm; set: FormSetter; errors: string[] }) {
  return (
    <div>
      <ErrorList errors={errors} />
      <div className="grid sm:grid-cols-2 gap-x-5">
        <Field label="Business name" required>
          <input className="field" value={f.businessName} onChange={(e) => set("businessName", e.target.value)} />
        </Field>
        <Field label="Business address (include GPS)" required>
          <input className="field" value={f.businessAddress} onChange={(e) => set("businessAddress", e.target.value)} placeholder="e.g. Plus code GG-456-789" />
        </Field>
      </div>

      <Field label="Is your business registered?" required>
        <Choices options={["Yes", "No", "Ongoing"]} value={f.registered} onChange={(v) => set("registered", v)} columns={3} />
      </Field>

      <Field label="Business industry" required>
        <Choices options={INDUSTRIES} value={f.industry} onChange={(v) => set("industry", v)} columns={2} />
      </Field>

      {f.industry === "Other" && (
        <Field label="If other, please state the industry" required>
          <input className="field" value={f.industryOther} onChange={(e) => set("industryOther", e.target.value)} />
        </Field>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- step 3 */

export function StepFunding({ f, set, errors }: { f: ApplyForm; set: FormSetter; errors: string[] }) {
  const tiers: Tier[] = [1, 2, 3];

  const onPickTier = (t: Tier) => {
    set("tier", String(t));
    set("amountRequested", "");
  };

  return (
    <div>
      <ErrorList errors={errors} />

      <Field label="Select your application tier" required>
        <div className="grid gap-3">
          {tiers.map((t) => {
            const info = TIER_INFO[t];
            const active = f.tier === String(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => onPickTier(t)}
                className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                  active
                    ? "border-gold bg-gold/10 shadow-[0_18px_40px_-26px_rgba(201,165,76,1)]"
                    : "border-ink/12 bg-white/70 hover:border-gold/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold font-bold">
                      {info.title}
                    </p>
                    <h4 className="font-[family-name:var(--font-display)] text-lg text-emerald-900 mt-0.5">
                      {info.tagline}
                    </h4>
                    <p className="text-sm text-ink/65 mt-1.5 leading-relaxed">{info.description}</p>
                    <p className="text-[0.75rem] text-muted mt-1.5">{info.turnover}</p>
                  </div>
                  <span
                    className={`mt-1 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition ${
                      active ? "border-gold bg-gold" : "border-ink/25"
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-emerald-deep" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      {f.tier && (
        <Field label="Select your funding requirement" required>
          <div className="rounded-xl border border-gold/40 bg-gold/8 px-5 py-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold font-bold">
              {TIER_INFO[Number(f.tier) as Tier].title} range
            </p>
            <p className="font-[family-name:var(--font-display)] text-xl text-emerald-900 mt-1">
              {TIER_INFO[Number(f.tier) as Tier].fundingRange}
            </p>
          </div>
        </Field>
      )}

      <Field label="Loan purpose" required hint="What will the funds be used for?">
        <textarea
          className="field min-h-[110px] resize-y"
          value={f.loanPurpose}
          onChange={(e) => set("loanPurpose", e.target.value)}
          placeholder="e.g. Purchase of industrial baking equipment and raw materials to expand production capacity…"
        />
      </Field>

      <Field
        label="State the specific amount required (GHS)"
        required
        hint={f.tier ? TIER_INFO[Number(f.tier) as Tier].fundingRange : "Select a tier above first."}
      >
        <input
          type="number"
          min={0}
          className="field max-w-[280px]"
          value={f.amountRequested}
          onChange={(e) => set("amountRequested", e.target.value)}
          placeholder="25000.00"
          disabled={!f.tier}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-5">
        <Field label="Name of guarantor (a reputable church leader)" required>
          <input className="field" value={f.guarantorName} onChange={(e) => set("guarantorName", e.target.value)} />
        </Field>
        <Field label="Phone number of guarantor" required>
          <input className="field" value={f.guarantorPhone} onChange={(e) => set("guarantorPhone", e.target.value)} />
        </Field>
      </div>

      <Field label="Proposed repayment period" required>
        <Choices options={REPAYMENT_PERIODS} value={f.repaymentPeriod} onChange={(v) => set("repaymentPeriod", v)} columns={3} />
      </Field>

      <Field label="Preferred repayment mode" required>
        <Choices options={REPAYMENT_MODES} value={f.repaymentMode} onChange={(v) => set("repaymentMode", v)} columns={3} />
      </Field>

      {f.repaymentMode.startsWith("Other") && (
        <Field label="If other, state your preferred repayment mode" required hint="Subject to approval.">
          <input className="field" value={f.repaymentOther} onChange={(e) => set("repaymentOther", e.target.value)} />
        </Field>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- step 4 */

export function StepDocuments({ f, set, errors }: { f: ApplyForm; set: FormSetter; errors: string[] }) {
  const tier = Number(f.tier) as Tier;
  const info = TIER_INFO[tier];

  const toggle = (doc: string) => {
    const has = f.documentsAck.includes(doc);
    set("documentsAck", has ? f.documentsAck.filter((d) => d !== doc) : [...f.documentsAck, doc]);
  };

  return (
    <div>
      <ErrorList errors={errors} />

      <div className="rounded-2xl border border-gold/30 bg-gold/8 p-6 mb-7">
        <h4 className="font-[family-name:var(--font-display)] text-xl text-emerald-900">
          {info.title} — {info.tagline}
        </h4>
        <p className="mt-2 text-sm text-ink/70 leading-relaxed">
          For Tier {tier} businesses only. Provide the following information to the committee by
          email. Tick each item below once you have prepared it.
        </p>
        <a
          href="mailto:begin@loveworldcommerce.org"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline decoration-gold underline-offset-4 hover:text-gold transition"
        >
          begin@loveworldcommerce.org
        </a>
      </div>

      <div className="grid gap-2.5">
        {info.documents.map((doc) => {
          const checked = f.documentsAck.includes(doc);
          return (
            <label
              key={doc}
              className={`flex items-start gap-3.5 rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-250 ${
                checked
                  ? "border-gold bg-gold/10"
                  : "border-ink/12 bg-white/70 hover:border-gold/50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(doc)}
                className="mt-0.5 w-4 h-4 accent-[#0a3d2e] shrink-0"
              />
              <span className="text-sm text-ink/80 leading-relaxed">{doc}</span>
            </label>
          );
        })}
      </div>

      <p className="mt-6 text-[0.75rem] text-muted leading-relaxed">
        Documents are reviewed by the committee under strict confidentiality. Submission of this
        checklist declaration does not guarantee approval.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- step 5 */

export function StepDeclaration({
  f,
  set,
  errors,
  summary,
}: {
  f: ApplyForm;
  set: FormSetter;
  errors: string[];
  summary: { label: string; value: string }[];
}) {
  const allChecked = f.declarations.every(Boolean);

  const toggle = (i: number) => {
    const next = [...f.declarations];
    next[i] = !next[i];
    set("declarations", next);
  };

  return (
    <div>
      <ErrorList errors={errors} />

      <div className="rounded-2xl border border-gold/25 bg-white p-6 mb-7 shadow-[0_22px_50px_-38px_rgba(10,61,46,0.5)]">
        <h4 className="font-[family-name:var(--font-display)] text-xl text-emerald-900">
          Applicant declaration
        </h4>
        <p className="mt-1.5 text-sm text-muted">Check all boxes to proceed.</p>
        <dl className="mt-5 divide-y divide-gold/12">
          {summary.map((s) => (
            <div key={s.label} className="flex items-start justify-between gap-6 py-2.5">
              <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-muted shrink-0">{s.label}</dt>
              <dd className="text-sm text-emerald-900 text-right font-medium">{s.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-2.5">
        {DECLARATIONS.map((d, i) => {
          const checked = f.declarations[i];
          return (
            <label
              key={d}
              className={`flex items-start gap-3.5 rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-250 ${
                checked ? "border-gold bg-gold/10" : "border-ink/12 bg-white/70 hover:border-gold/50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(i)}
                className="mt-0.5 w-4 h-4 accent-[#0a3d2e] shrink-0"
              />
              <span className="text-[0.83rem] text-ink/78 leading-relaxed">{d}</span>
            </label>
          );
        })}
      </div>

      <p className={`mt-5 text-sm font-semibold ${allChecked ? "text-emerald-800" : "text-muted"}`}>
        {f.declarations.filter(Boolean).length} of {DECLARATIONS.length} declarations confirmed.
      </p>
    </div>
  );
}
