import { useEffect } from 'react';

export const SITE_URL = 'https://f1rc.uz';
export const SITE_NAME = 'F1RC.UZ';

export type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  robots?: string;
  locale?: 'uz_UZ' | 'ru_RU' | 'en_US';
  language?: 'uz' | 'ru' | 'en';
  structuredData?: StructuredData;
}

const DEFAULT_TITLE = 'F1RC.UZ — Race Without Limits';
const DEFAULT_DESCRIPTION =
  "F1RC.UZ — real RC racing, FPV driving, jonli poygalar va professional motorsport platformasi.";

function absoluteUrl(value: string): string {
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

function brandedTitle(title?: string): string {
  if (!title) return DEFAULT_TITLE;
  return title.toLocaleUpperCase().includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

/**
 * Keeps SPA navigation metadata in sync and restores the previous head state on
 * cleanup, so it can safely be used by nested route pages.
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image,
  imageAlt,
  type = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  locale = 'uz_UZ',
  language = 'uz',
  structuredData,
}: SEOProps): void {
  const serializedStructuredData = structuredData
    ? JSON.stringify(structuredData).replace(/</g, '\\u003c')
    : undefined;

  useEffect(() => {
    const resolvedTitle = brandedTitle(title);
    const canonicalUrl = absoluteUrl(
      canonicalPath ?? window.location.pathname,
    );
    const imageUrl = image ? absoluteUrl(image) : undefined;
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    const cleanups: Array<() => void> = [];

    document.title = resolvedTitle;
    document.documentElement.lang = language;

    const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
      );
      const created = !element;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      const previousContent = element.getAttribute('content');
      element.setAttribute('content', content);
      cleanups.push(() => {
        if (created) {
          element?.remove();
        } else if (previousContent === null) {
          element?.removeAttribute('content');
        } else {
          element?.setAttribute('content', previousContent);
        }
      });
    };

    const setCanonical = (href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      const created = !element;

      if (!element) {
        element = document.createElement('link');
        element.rel = 'canonical';
        document.head.appendChild(element);
      }

      const previousHref = element.getAttribute('href');
      element.href = href;
      cleanups.push(() => {
        if (created) {
          element?.remove();
        } else if (previousHref === null) {
          element?.removeAttribute('href');
        } else {
          element?.setAttribute('href', previousHref);
        }
      });
    };

    setMeta('name', 'description', description);
    setMeta('name', 'robots', robots);
    setMeta('property', 'og:title', resolvedTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', locale);
    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', resolvedTitle);
    setMeta('name', 'twitter:description', description);

    if (imageUrl) {
      setMeta('property', 'og:image', imageUrl);
      setMeta('name', 'twitter:image', imageUrl);
      if (imageAlt) {
        setMeta('property', 'og:image:alt', imageAlt);
        setMeta('name', 'twitter:image:alt', imageAlt);
      }
    }

    setCanonical(canonicalUrl);

    if (serializedStructuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.f1rcSeo = 'structured-data';
      script.textContent = serializedStructuredData;
      document.head.appendChild(script);
      cleanups.push(() => script.remove());
    }

    return () => {
      cleanups.reverse().forEach((cleanup) => cleanup());
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
    };
  }, [
    canonicalPath,
    description,
    image,
    imageAlt,
    language,
    locale,
    robots,
    serializedStructuredData,
    title,
    type,
  ]);
}

export default function SEO(props: SEOProps) {
  useSEO(props);
  return null;
}
