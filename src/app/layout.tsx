import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  weight: "variable",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "B.E.G.I.N — Business Expansion & Growth Initiative | $1M Interest-Free Fund",
  description:
    "The official platform for the Business Expansion and Growth Initiative (B.E.G.I.N) — a one million dollar, 0% interest business fund launched at the Loveworld Trade & Investment Forum, Ghana. Powered by the Ministry of Commerce, Loveworld Kingdom.",
  keywords: [
    "B.E.G.I.N",
    "LTIF",
    "Loveworld Trade and Investment Forum",
    "Christ Embassy Accra",
    "interest-free loan Ghana",
    "business fund Ghana",
    "Ministry of Commerce Loveworld",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
