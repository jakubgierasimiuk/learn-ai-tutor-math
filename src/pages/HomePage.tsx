import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ReferralPromo } from "@/components/ReferralPromo";

const HomePage = () => {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-6 py-8">
        <ReferralPromo />
      </div>
      <Features />
    </>
  );
};

export default HomePage;