"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Alert, AuthShell, Field } from "@/components/auth-shell";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to reset your password. Please request a new link.");
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
      setTimeout(() => router.push("/signin"), 2600);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div>
        <Alert kind="error">
          This reset link is incomplete. Please open the link from your email again, or request a
          fresh one.
        </Alert>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/signin" className="text-emerald-800 font-semibold hover:text-gold transition">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 size={44} className="mx-auto text-emerald-800" />
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl text-emerald-900">
          Password updated
        </h2>
        <p className="mt-2.5 text-sm text-ink/65 leading-relaxed">
          Your password has been changed and every other signed-in session has been signed out.
          Taking you to the sign-in page…
        </p>
        <Link
          href="/signin"
          className="btn-emerald mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold"
        >
          Sign in now <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <Alert kind="error">{error}</Alert>}

      <Field label="New password" required hint="At least 8 characters.">
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="password"
            className="field pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
      </Field>

      <Field label="Confirm new password" required>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="password"
            className="field pl-10"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
      </Field>

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.985 }}
        className="btn-emerald mt-6 w-full rounded-full py-4 text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Updating password…
          </>
        ) : (
          <>
            Set my new password <ArrowRight size={16} />
          </>
        )}
      </motion.button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Your reset link is valid for 60 minutes and can be used once. Changing your password signs out every other session."
      footer={
        <>
          Powered by the Ministry of Commerce, Loveworld Kingdom ·{" "}
          <Link href="/" className="hover:text-emerald-800 transition">
            b.e.g.i.n home
          </Link>
        </>
      }
    >
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
