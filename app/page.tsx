import { Footer } from "@/components/footer";
import { LandingPage } from "@/components/landing-page";
import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F0E] text-[#E6F0ED]">
      <Navigation />
      <LandingPage />
      <Footer />
    </div>
  );
}
