import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[100svh] bg-cream flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <span className="text-[0.66rem] uppercase tracking-[0.3em] text-gold font-semibold">
          B.E.G.I.N
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl text-emerald-900">404</h1>
        <p className="mt-3 text-ink/65 leading-relaxed">
          This page could not be found. If you followed a link from an email, make sure it is the
          full link — reset links expire after 60 minutes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/" className="btn-gold rounded-full px-7 py-3 text-sm font-bold">
            Go home
          </Link>
          <Link
            href="/signin"
            className="rounded-full px-7 py-3 text-sm font-semibold text-emerald-900 border border-emerald-900/25 hover:border-gold hover:bg-gold/10 transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
