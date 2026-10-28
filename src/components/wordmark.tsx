import Link from "next/link";

export function Wordmark({
  size = "lg",
  href = "/",
  dark = false,
}: {
  size?: "sm" | "lg";
  href?: string;
  dark?: boolean;
}) {
  const letters = ["B", "E", "G", "I", "N"];
  const textCls = dark ? "text-ivory" : "text-emerald-900";

  const content = (
    <span className="inline-flex flex-col leading-none select-none">
      <span
        className={`font-[family-name:var(--font-display)] font-semibold tracking-[0.16em] ${
          size === "lg" ? "text-3xl sm:text-4xl" : "text-xl"
        } ${textCls} flex items-baseline`}
      >
        {letters.map((l, i) => (
          <span key={i} className="flex items-baseline">
            <span className="transition-transform duration-300 hover:-translate-y-0.5 inline-block">
              {l}
            </span>
            {i < letters.length - 1 && (
              <span className="text-gold mx-[0.12em] rounded-full inline-block">·</span>
            )}
          </span>
        ))}
      </span>
      <span
        className={`mt-1 text-[0.5rem] sm:text-[0.58rem] uppercase tracking-[0.34em] font-medium ${
          dark ? "text-gold-light/90" : "text-emerald-800/80"
        }`}
      >
        Powered by the Ministry of Commerce
      </span>
    </span>
  );

  return href ? (
    <Link href={href} className="group" aria-label="B.E.G.I.N home">
      {content}
    </Link>
  ) : (
    content
  );
}
