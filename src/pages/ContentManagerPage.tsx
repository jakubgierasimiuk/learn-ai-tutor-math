import React, { useEffect } from "react";
import ContentManager from "@/components/ContentManager";

const ContentManagerPage: React.FC = () => {
  useEffect(() => {
    // SEO basics
    document.title = "Content Manager – AI Tutor"; // <60 chars
    const desc = "Import and manage educational content database for AI Tutor."; // <160
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
    link.setAttribute('href', window.location.origin + '/content-manager');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <p className="text-muted-foreground mt-2">
          Import, validate, and manage educational content database
        </p>
      </header>
      <main>
        <ContentManager />
      </main>
    </div>
  );
};

export default ContentManagerPage;