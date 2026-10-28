import Link from "next/link";
import { Wordmark } from "./wordmark";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative dark-mesh text-ivory grain overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px gold-rule" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Wordmark dark />
            <p className="mt-6 text-sm text-ivory/65 max-w-xs leading-relaxed">
              The Business Expansion and Growth Initiative — a one million dollar,
              interest-free fund for entrepreneurs in the Loveworld Kingdom, Ghana.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-gold-light/80">
              <ShieldCheck size={15} />
              Launched at the Loveworld Trade &amp; Investment Forum
            </div>
          </div>

          <div>
            <h4 className="text-[0.7rem] uppercase tracking-[0.22em] text-gold mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li><Link href="/#about" className="hover:text-gold-light transition">The Fund</Link></li>
              <li><Link href="/#tiers" className="hover:text-gold-light transition">Application Tiers</Link></li>
              <li><Link href="/#process" className="hover:text-gold-light transition">How It Works</Link></li>
              <li><Link href="/gallery" className="hover:text-gold-light transition">LTIF Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[0.7rem] uppercase tracking-[0.22em] text-gold mb-4">Applicants</h4>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li><Link href="/signup" className="hover:text-gold-light transition">Create an account</Link></li>
              <li><Link href="/signin" className="hover:text-gold-light transition">Sign in</Link></li>
              <li><Link href="/apply" className="hover:text-gold-light transition">Apply for funding</Link></li>
              <li><Link href="/dashboard" className="hover:text-gold-light transition">Track your application</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[0.7rem] uppercase tracking-[0.22em] text-gold mb-4">Enquiries</h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="mt-0.5 text-gold" />
                <a href="mailto:begin@loveworldcommerce.org" className="hover:text-gold-light transition break-all">
                  begin@loveworldcommerce.org
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 text-gold" />
                <span>Christ Embassy Accra Ghana Zone — Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory/45">
            © {new Date().getFullYear()} Ministry of Commerce, Loveworld Kingdom. All rights reserved.
          </p>
          <p className="text-xs text-ivory/45">
            0% interest · Up to 6 months · Principal only · Disbursed via Ecobank
          </p>
        </div>
      </div>
    </footer>
  );
}
