import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GalleryClient } from "@/components/gallery-client";

export const metadata: Metadata = {
  title: "LTIF Ghana Gallery — B.E.G.I.N",
  description:
    "Moments from the Loveworld Trade & Investment Forum, Ghana — the esteemed ministers, panels and fellowship that launched the B.E.G.I.N fund.",
};

export default function GalleryPage() {
  return (
    <main>
      <Header />
      <GalleryClient />
      <Footer />
    </main>
  );
}
