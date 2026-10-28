"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Global error boundary. A Cellar timeout or unexpected failure renders this
 * instead of Next's raw error page — branded, recoverable, and safe to show
 * to applicants.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[begin] render error:", error);
  }, [error]);

  return (
    <main className="min-h-[100svh] bg-cream flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
          B.E.G.I.N
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-emerald-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-ink/65 leading-relaxed">
          We hit an unexpected problem while loading this page. Your application and data are safe
          — please try again.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-gold rounded-full px-7 py-3 text-sm font-bold"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full px-7 py-3 text-sm font-semibold text-emerald-900 border border-emerald-900/25 hover:border-gold hover:bg-gold/10 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
