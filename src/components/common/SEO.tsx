import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object | object[];
}

const DOMAIN = 'https://skinofkorea.co.uk';

const DEFAULT_TITLE = 'Skin of Korea | Authentic Korean Skincare & Beauty';
const DEFAULT_DESCRIPTION =
  'Discover 100% authentic Korean skincare products, top K-Beauty brands, daily SPF essentials, and glass-skin routines in the UK.';
const DEFAULT_KEYWORDS =
  'Skin of Korea, Korean skincare, K-Beauty UK, Beauty of Joseon, Anua, COSRX, Haruharu Wonder, SKIN1004, glass skin, Korean sunscreens';
const DEFAULT_OG_IMAGE = `${DOMAIN}/images/skin-of-korea-logo.png`;

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = '',
  noindex = false,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}) => {
  const canonicalUrl = canonicalPath
    ? `${DOMAIN}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : DOMAIN;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Skin of Korea" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
