"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Alert, AuthShell, Field } from "@/components/auth-shell";
import { safeNextPath } from "@/lib/safe-next";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to sign in. Please try again.");
        setLoading(false);
        return;
      }
      router.push(safeNextPath(params.get("next")));
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <Alert kind="error">{error}</Alert>}

      <Field label="Email address" required>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            className="field pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
      </Field>

      <Field label="Password" required>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="password"
            className="field pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
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
            <Loader2 size={16} className="animate-spin" /> Signing you in…
          </>
        ) : (
          <>
            Sign in to dashboard <ArrowRight size={16} />
          </>
        )}
      </motion.button>

      <p className="mt-6 text-center text-sm text-muted">
        New to B.E.G.I.N?{" "}
        <Link
          href={`/signup${params.get("next") ? `?next=${params.get("next")}` : ""}`}
          className="text-emerald-800 font-semibold hover:text-gold transition"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to check your application status, respond to requests and manage your profile."
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
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
