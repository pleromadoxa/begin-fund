import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/hero";
import {
  About,
  CtaBand,
  Faq,
  Process,
  StatsBand,
  Tiers,
} from "@/components/landing/sections";
import { GalleryPreview } from "@/components/landing/gallery-preview";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <StatsBand />
      <About />
      <GalleryPreview />
      <Tiers />
      <Process />
      <Faq />
      <CtaBand />
      <Footer />
    </main>
  );
}
