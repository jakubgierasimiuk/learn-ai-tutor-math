import { useEffect } from "react";

type SeoProps = {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
};

export function Seo({ title, description, canonical, jsonLd }: SeoProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    // Canonical
    const canonicalHref =
      canonical || (typeof window !== "undefined" ? window.location.href : undefined);
    if (canonicalHref) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalHref);
    }

    // JSON-LD structured data
    const scriptId = "ld-json";
    const existing = document.getElementById(scriptId);
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      script.text = JSON.stringify(jsonLd);
      if (existing) document.head.removeChild(existing);
      document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, canonical, jsonLd]);

  return null;
}
