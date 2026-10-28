import Link from "next/link";

/**
 * Static preview 404 — the auth-driven pages (apply, dashboard, committee)
 * live on the SSR deployment; this preview carries the public face.
 */
export default function NotFound() {
  return (
    <main className="dark-mesh grain flex min-h-[100svh] items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="eyebrow">B.E.G.I.N — Preview</p>
        <h1 className="font-display mt-3 text-4xl text-ivory">
          This part needs the <span className="gold-text italic">full platform</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/60">
          The application wizard, dashboard and committee panel run on the live SSR
          deployment. This preview shows the public face of the fund — the story,
          the tiers and the LTIF gallery.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
