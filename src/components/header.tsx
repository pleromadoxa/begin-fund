"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Wordmark } from "./wordmark";
import type { SafeUser } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "The Fund" },
  { href: "/#tiers", label: "Tiers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#process", label: "How It Works" },
];

export function Header({ forceDark = false }: { forceDark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SafeUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => alive && setUser(d.user))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [pathname]);

  const dark = forceDark || !scrolled;
  const solid = scrolled || open;

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setOpen(false);
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "bg-ivory/92 backdrop-blur-xl border-b border-gold/20 shadow-[0_10px_30px_-24px_rgba(10,61,46,0.6)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center justify-between h-[76px]">
            <Wordmark size="sm" dark={dark && !solid ? true : solid ? false : true} />

            <nav className="hidden lg:flex items-center gap-8">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative text-[0.82rem] font-medium tracking-wide transition-colors ${
                    solid
                      ? "text-ink/75 hover:text-emerald-800"
                      : "text-ivory/85 hover:text-gold-light"
                  }`}
                >
                  {n.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-emerald rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className={`text-sm font-medium flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${
                      solid ? "text-muted hover:text-emerald-800" : "text-ivory/75 hover:text-gold-light"
                    }`}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className={`text-sm font-semibold px-4 py-2.5 rounded-full transition-colors ${
                      solid
                        ? "text-emerald-800 hover:bg-emerald-800/8"
                        : "text-ivory hover:text-gold-light"
                    }`}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-gold rounded-full px-5 py-2.5 text-sm font-bold tracking-wide"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className={`lg:hidden p-2 rounded-full border ${
                solid ? "border-gold/30 text-emerald-900" : "border-ivory/30 text-ivory"
              }`}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden bg-ivory/98 backdrop-blur-xl border-t border-gold/20"
            >
              <div className="px-6 py-6 flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="py-3 text-ink/85 font-medium border-b border-gold/10"
                  >
                    {n.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-3">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="btn-emerald rounded-full px-5 py-3 text-center font-semibold"
                      >
                        Dashboard
                      </Link>
                      <button onClick={signOut} className="text-muted text-sm py-2">
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        onClick={() => setOpen(false)}
                        className="text-center py-3 text-emerald-800 font-semibold"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setOpen(false)}
                        className="btn-gold rounded-full px-5 py-3 text-center font-bold"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
