import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogImage,
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    const origin = window.location.origin;
    const url = canonicalPath ? `${origin}${canonicalPath}` : window.location.href;
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);

    if (ogImage) {
      const fullImg = ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`;
      setMeta('meta[property="og:image"]', 'property', 'og:image', fullImg);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const existingScript = document.getElementById('bp-dynamic-jsonld');
    if (existingScript) {
      existingScript.remove();
    }
    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'bp-dynamic-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, ogImage, jsonLd]);

  return null;
}
