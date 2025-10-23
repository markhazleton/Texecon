import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEOHead({
  title = "TexEcon - Texas Economic Analysis & Insights",
  description = "Leading Texas economic analysis and commentary. Expert insights on Texas economy trends, data analysis, and economic forecasting from experienced economists and data analysts.",
  keywords = [
    "Texas economy",
    "economic analysis",
    "Texas economic trends",
    "economic forecasting",
    "Texas business",
    "economic data",
    "economic commentary",
    "Texas economics",
  ],
  image = `${import.meta.env.BASE_URL}assets/texecon-og-image.jpg`,
  url = "https://texecon.com",
  type = "website",
  author = "TexEcon Team",
  publishedTime,
  modifiedTime,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    updateMetaTag("description", description);

    // Update meta keywords
    updateMetaTag("keywords", keywords.join(", "));

    // Update Open Graph meta tags
    updateMetaTag("og:title", title, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:image", image, "property");
    updateMetaTag("og:url", url, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", "TexEcon", "property");

    // Update Twitter Card meta tags
    updateMetaTag("twitter:card", "summary_large_image", "name");
    updateMetaTag("twitter:title", title, "name");
    updateMetaTag("twitter:description", description, "name");
    updateMetaTag("twitter:image", image, "name");

    // Update article-specific meta tags if applicable
    if (type === "article") {
      updateMetaTag("article:author", author, "property");
      if (publishedTime) {
        updateMetaTag("article:published_time", publishedTime, "property");
      }
      if (modifiedTime) {
        updateMetaTag("article:modified_time", modifiedTime, "property");
      }
    }

    // Update canonical URL
    updateCanonicalUrl(url);
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime]);

  const updateMetaTag = (
    name: string,
    content: string,
    attribute: "name" | "property" = "name"
  ) => {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  const updateCanonicalUrl = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  };

  return null; // This component doesn't render anything visible
}

// Hook for easy SEO updates in components
export function useSEO(seoProps: SEOHeadProps) {
  useEffect(() => {
    // This will be handled by the SEOHead component when it mounts
  }, []);

  return <SEOHead {...seoProps} />;
}
