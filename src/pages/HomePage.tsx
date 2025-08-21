import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { ProgressMiniBar } from "@/components/ProgressMiniBar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ReferralPromo } from "@/components/ReferralPromo";


import { LandingPage } from "@/components/LandingPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single();
      
    setProfile(data);
  };

  // Show landing page for non-authenticated users
  if (!loading && !user) {
    const landingJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI Tutor Matematyki – Najlepszy nauczyciel matematyki online",
      description: "Ucz się matematyki z AI Tutorem 24/7. Dopasowane lekcje, quizy i pełna podstawa programowa. Rozpocznij darmowy okres próbny.",
      offers: {
        "@type": "Offer",
        price: "49.99",
        priceCurrency: "PLN",
        description: "Miesięczny dostęp do AI Tutora Matematyki"
      }
    } as const;

    return (
      <>
        <Seo
          title="AI Tutor Matematyki – Najlepszy nauczyciel matematyki online"
          description="Ucz się matematyki z AI Tutorem 24/7. Dopasowane lekcje, quizy i pełna podstawa programowa liceum. Darmowy okres próbny 7 dni."
          jsonLd={landingJsonLd}
        />
        <LandingPage />
      </>
    );
  }

  // Redirect to onboarding if not completed
  if (!loading && user && profile && !profile.onboarding_completed) {
    window.location.href = '/onboarding/welcome';
    return null;
  }

  // Show loading while checking profile
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show enhanced dashboard for authenticated users
  const dashboardJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Tutor Matematyki – Strona główna",
    description: "Rozpocznij naukę z AI Tutorem: lekcje, quizy i rekomendacje dopasowane do Ciebie.",
  } as const;

  return (
    <>
      <Seo
        title="AI Tutor Matematyki – Strona główna"
        description="Ucz się z AI Tutorem: lekcje, quizy, rekomendacje. Czytelnie na desktop i mobile."
        jsonLd={dashboardJsonLd}
      />
      <div className="font-sans text-foreground bg-background overflow-hidden min-h-screen">
        {/* Enhanced Hero Section for Authenticated Users */}
        <section className="relative py-16 px-6 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent opacity-10">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
          </div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-primary/10 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-accent/10 rounded-lg rotate-45 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 left-1/4 w-8 h-8 bg-success/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          
          <div className="relative z-10 max-w-6xl mx-auto">
            <Hero />
          </div>
        </section>


        {/* Enhanced Progress Section */}
        <section className="relative py-8 px-6 bg-gradient-to-r from-background via-primary/5 to-background">
          <div className="max-w-6xl mx-auto">
            <ProgressMiniBar />
          </div>
        </section>

        {/* Features Section with Modern Layout */}
        <section className="relative py-16 px-6">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <Features />
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
