import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";

export const metadata = {
  title: "Sign Up — B.E.G.I.N Preview",
  description: "The live B.E.G.I.N platform registration.",
};

/**
 * Static-preview notice — registration runs on the full SSR deployment.
 */
export default function SignUpPage() {
  return (
    <main className="dark-mesh grain flex min-h-[100svh] items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <UserPlus className="mx-auto h-8 w-8 text-gold" />
        <p className="eyebrow mt-6">B.E.G.I.N — Preview</p>
        <h1 className="font-display mt-3 text-4xl text-ivory">
          Registration lives on the <span className="gold-text italic">full platform</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/60">
          Creating an account and applying for the $1M interest-free fund happens
          on the live SSR deployment of B.E.G.I.N. This preview showcases the
          public face of the fund — the story, the tiers and the LTIF gallery.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex items-center gap-2">
          Back to the home page <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}
