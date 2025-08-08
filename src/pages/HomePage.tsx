import { Seo } from "@/components/Seo";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ReferralPromo } from "@/components/ReferralPromo";
import { QuickStartPanel } from "@/components/QuickStartPanel";

const HomePage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Tutor Matematyki",
    url: typeof window !== "undefined" ? window.location.href : "",
    description:
      "Interaktywny AI Tutor matematyki: lekcje, quizy i rekomendacje dopasowane do Ciebie.",
  } as const;

  return (
    <>
      <Seo
        title="AI Tutor Matematyki – Ucz się szybciej"
        description="Interaktywny AI Tutor matematyki: lekcje, quizy, rekomendacje. Świetna czytelność na desktop i mobile."
        jsonLd={jsonLd}
      />

      <main id="main-content">
        <section aria-labelledby="home-hero">
          <Hero />
        </section>

        <section
          aria-labelledby="home-quickstart"
          className="container mx-auto px-6 py-8"
        >
          <h2 id="home-quickstart" className="sr-only">
            Szybki start
          </h2>
          <QuickStartPanel />
        </section>

        <section
          aria-labelledby="home-referral"
          className="container mx-auto px-6 py-8"
        >
          <h2 id="home-referral" className="sr-only">
            Polecenia i nagrody
          </h2>
          <ReferralPromo />
        </section>

        <section aria-labelledby="home-features">
          <h2 id="home-features" className="sr-only">
            Najważniejsze funkcje
          </h2>
          <Features />
        </section>
      </main>
    </>
  );
};

export default HomePage;
