import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export const metadata = {
  title: "Sign In — B.E.G.I.N Preview",
  description: "The live B.E.G.I.N platform sign-in.",
};

/**
 * Static-preview notice — authentication runs on the full SSR deployment.
 */
export default function SignInPage() {
  return (
    <main className="dark-mesh grain flex min-h-[100svh] items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <Lock className="mx-auto h-8 w-8 text-gold" />
        <p className="eyebrow mt-6">B.E.G.I.N — Preview</p>
        <h1 className="font-display mt-3 text-4xl text-ivory">
          Sign in lives on the <span className="gold-text italic">full platform</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/60">
          Accounts, applications and dashboards run on the live SSR deployment of
          B.E.G.I.N. This preview showcases the public face of the fund — the
          story, the tiers and the LTIF gallery.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex items-center gap-2">
          Back to the home page <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}
