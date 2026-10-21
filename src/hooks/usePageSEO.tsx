import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  noIndex?: boolean;
  schema?: object | object[];
}

const BASE_URL = 'https://skinofkorea.co.uk';
const DEFAULT_IMAGE = '/images/skin-of-korea-logo.png';

/**
 * usePageSEO – sets <title>, all meta tags, canonical, and injects
 * per-page JSON-LD structured data without any external library.
 */
export function usePageSEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  keywords,
  noIndex = false,
  schema,
}: SEOProps) {
  useEffect(() => {
    // ─── Title ───
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ─── Standard meta ───
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // ─── Canonical ───
    const canonicalHref = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
    setLink('canonical', canonicalHref);

    // ─── Open Graph ───
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalHref, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:image:alt', title, true);
    setMeta('og:site_name', 'Skin of Korea', true);
    setMeta('og:locale', 'en_GB', true);

    // ─── Twitter / X ───
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // ─── Per-page JSON-LD ───
    // Remove any previously injected per-page schema
    document.querySelectorAll('script[data-page-schema]').forEach((el) => el.remove());

    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((s, i) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-page-schema', String(i));
        script.textContent = JSON.stringify(s);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount — restore defaults
    return () => {
      document.title = 'Skin of Korea';
      document.querySelectorAll('script[data-page-schema]').forEach((el) => el.remove());
    };
  }, [title, description, canonical, ogType, ogImage, keywords, noIndex, schema]);
}
