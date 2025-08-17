import { Seo } from "@/components/Seo";
import { ProgressMiniBar } from "@/components/ProgressMiniBar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ReferralPromo } from "@/components/ReferralPromo";
import { QuickStartPanel } from "@/components/QuickStartPanel";
import { LandingPage } from "@/components/LandingPage";
import { useAuth } from "@/hooks/useAuth";

const HomePage = () => {
  const { user, loading } = useAuth();

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

  // Show dashboard for authenticated users
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
      <main id="main-content">
        <section aria-labelledby="home-hero">
          <h2 id="home-hero" className="sr-only">Sekcja hero – AI Tutor Matematyki</h2>
          <Hero />
        </section>
        <section aria-labelledby="mini-progress">
          <h2 id="mini-progress" className="sr-only">Szybkie podsumowanie dnia</h2>
          <ProgressMiniBar />
        </section>
        <section aria-labelledby="home-quickstart" className="container mx-auto px-6 py-8">
          <h2 id="home-quickstart" className="sr-only">Szybki start</h2>
          <QuickStartPanel />
        </section>
        <section aria-labelledby="home-referral" className="container mx-auto px-6 py-8">
          <h2 id="home-referral" className="sr-only">Polecenia i nagrody</h2>
          <ReferralPromo />
        </section>
        <section aria-labelledby="home-features">
          <h2 id="home-features" className="sr-only">Najważniejsze funkcje</h2>
          <Features />
        </section>
      </main>
    </>
  );
};

export default HomePage;
