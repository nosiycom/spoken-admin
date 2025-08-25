import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'app';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object;
}

const defaultSEO = {
  title: 'Spoken Admin Portal - AI-Powered French Learning Management',
  description: 'Comprehensive admin dashboard for managing your AI-powered French learning mobile app content, analytics, user engagement, and course creation.',
  ogImage: '/og-image.png',
  ogType: 'website' as const,
  twitterCard: 'summary_large_image' as const,
};

export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = defaultSEO.ogType,
  twitterCard = defaultSEO.twitterCard,
  noindex = false,
  nofollow = false,
  structuredData,
}: SEOProps) {
  const seoTitle = title ? `${title} | Spoken Admin` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoImage = ogImage || defaultSEO.ogImage;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://admin.spoken.com';
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return (
    <Head>
      {/* Basic SEO */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content="French learning, language education, AI teaching, course management, educational technology, admin portal, learning analytics" />
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`} 
      />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={`${baseUrl}${seoImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Spoken Admin Portal - French Learning Management Dashboard" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Spoken Admin Portal" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={`${baseUrl}${seoImage}`} />
      <meta name="twitter:image:alt" content="Spoken Admin Portal Dashboard" />
      <meta name="twitter:creator" content="@spoken_app" />
      <meta name="twitter:site" content="@spoken_app" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Spoken Team" />
      <meta name="copyright" content="© 2024 Spoken. All rights reserved." />
      <meta name="language" content="English" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      
      {/* App-specific */}
      <meta name="application-name" content="Spoken Admin" />
      <meta name="apple-mobile-web-app-title" content="Spoken Admin" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}