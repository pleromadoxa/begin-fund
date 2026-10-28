"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail, Phone, Store, User } from "lucide-react";
import { Alert, AuthShell, Field } from "@/components/auth-shell";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    password: "",
    agree: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.agree) {
      setError("Please accept the declaration terms to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push(params.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <Alert kind="error">{error}</Alert>}

      <Field label="Full name" required>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="field pl-10" value={form.fullName} onChange={set("fullName")} placeholder="Kwame Mensah" autoComplete="name" required />
        </div>
      </Field>

      <Field label="Email address" required>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="email" className="field pl-10" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required />
        </div>
      </Field>

      <Field label="Phone number (Ghana)" required hint="e.g. 0241234567 or +233241234567">
        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="field pl-10" value={form.phone} onChange={set("phone")} placeholder="0241234567" autoComplete="tel" inputMode="tel" required />
        </div>
      </Field>

      <Field label="Business name" required hint="This appears on your dashboard — you can refine it later.">
        <div className="relative">
          <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="field pl-10" value={form.businessName} onChange={set("businessName")} placeholder="Grace Enterprises" required />
        </div>
      </Field>

      <Field label="Password" required hint="At least 8 characters.">
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="password" className="field pl-10" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="new-password" required />
        </div>
      </Field>

      <label className="flex items-start gap-3 mt-6 cursor-pointer group">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={set("agree")}
          className="mt-1 w-4 h-4 accent-[#0a3d2e] shrink-0"
        />
        <span className="text-[0.76rem] text-ink/70 leading-relaxed group-hover:text-ink transition">
          I confirm I am based in Ghana, and I accept that my information will be handled
          confidentially by the B.E.G.I.N committee.
        </span>
      </label>

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.985 }}
        className="btn-gold mt-7 w-full rounded-full py-4 text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Creating your account…
          </>
        ) : (
          <>
            Create account &amp; continue <ArrowRight size={16} />
          </>
        )}
      </motion.button>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link href={`/signin${params.get("next") ? `?next=${params.get("next")}` : ""}`} className="text-emerald-800 font-semibold hover:text-gold transition">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your applicant account"
      subtitle="Register once — then track your B.E.G.I.N application from your personal dashboard."
      footer={
        <>
          Ministry of Commerce, Loveworld Kingdom · Ghana only ·{" "}
          <Link href="/" className="hover:text-emerald-800 transition">
            b.e.g.i.n home
          </Link>
        </>
      }
    >
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
