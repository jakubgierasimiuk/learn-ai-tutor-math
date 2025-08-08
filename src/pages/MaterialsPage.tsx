import React, { useEffect } from "react";
import { StudentMaterialsWizard } from "@/components/StudentMaterialsWizard";

const MaterialsPage: React.FC = () => {
  useEffect(() => {
    // SEO basics
    document.title = "Materiały ucznia – analiza i lekcja | AI Tutor"; // <60 chars
    const desc = "Prześlij zdjęcia notatek, a AI rozpozna temat i zaplanuje lekcję."; // <160
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.origin + '/materials');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Materiały ucznia – analiza obrazu</h1>
        <p className="text-muted-foreground mt-2">
          Prześlij zdjęcia notatek, prac domowych lub kartkówek. AI rozpozna temat i zaproponuje plan lekcji.
        </p>
      </header>
      <main>
        <StudentMaterialsWizard />
      </main>
    </div>
  );
};

export default MaterialsPage;
