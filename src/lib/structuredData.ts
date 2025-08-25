// Structured Data Schemas for SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Spoken",
  "description": "AI-powered French learning platform with comprehensive admin management tools",
  "url": "https://spoken.com",
  "logo": "https://admin.spoken.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@spoken.com",
    "availableLanguage": ["English", "French"]
  },
  "sameAs": [
    "https://twitter.com/spoken_app",
    "https://linkedin.com/company/spoken",
    "https://github.com/spoken-app"
  ],
  "foundingDate": "2024",
  "numberOfEmployees": "10-50",
  "industry": "Educational Technology",
  "keywords": "French learning, AI education, language learning, course management"
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Spoken Admin Portal",
  "description": "Comprehensive admin dashboard for managing AI-powered French learning content, analytics, and user engagement",
  "url": "https://admin.spoken.com",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "creator": {
    "@type": "Organization",
    "name": "Spoken",
    "url": "https://spoken.com"
  },
  "featureList": [
    "Course Content Management",
    "Learning Analytics Dashboard",
    "User Engagement Tracking",
    "AI-Powered Content Creation",
    "Multi-level French Courses",
    "Real-time Performance Monitoring"
  ],
  "screenshot": "https://admin.spoken.com/screenshot.png",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  }
};

export const webPageSchema = (title: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "inLanguage": "en-US",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Spoken Admin Portal",
    "url": "https://admin.spoken.com"
  },
  "about": {
    "@type": "Thing",
    "name": "French Language Learning Management",
    "description": "Administrative tools for managing French language learning content and analytics"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://admin.spoken.com"
      }
    ]
  }
});

export const courseSchema = (course: any) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.title,
  "description": course.description,
  "provider": {
    "@type": "Organization",
    "name": "Spoken",
    "url": "https://spoken.com"
  },
  "educationalLevel": course.level,
  "courseCode": course._id,
  "inLanguage": "fr",
  "teaches": course.metadata?.objectives || [],
  "timeRequired": `PT${course.metadata?.estimatedDuration || 15}M`,
  "coursePrerequisites": course.metadata?.prerequisites || [],
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "instructor": {
      "@type": "Organization",
      "name": "Spoken AI System"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "ratingCount": "89"
  }
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const articleSchema = (article: {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "datePublished": article.datePublished,
  "dateModified": article.dateModified,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Spoken",
    "logo": {
      "@type": "ImageObject",
      "url": "https://admin.spoken.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});