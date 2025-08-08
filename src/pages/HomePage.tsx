import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ReferralPromo } from "@/components/ReferralPromo";
import { QuickStartPanel } from "@/components/QuickStartPanel";
const HomePage = () => {
  return (
    <>
      <Hero />
      <QuickStartPanel />
      <div className="container mx-auto px-6 py-8">
        <ReferralPromo />
      </div>
      <Features />
    </>
  );
};

export default HomePage;