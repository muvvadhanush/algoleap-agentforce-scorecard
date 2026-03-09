import type { Metadata, Viewport } from "next";
import "./globals.css";

// ═══════════════════════════════════
// SEO: Comprehensive Metadata
// ═══════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://scorecard.algoleap.com";
const SITE_NAME = "Algoleap Agentforce Readiness Scorecard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3C8943",
};

export const metadata: Metadata = {
  // ─── Core Meta ───
  title: {
    default: "Agentforce Readiness Scorecard | Algoleap Salesforce Practice",
    template: "%s | Algoleap",
  },
  description:
    "Is your data ready for Salesforce Agentforce? Take Algoleap's free 3-minute assessment across 7 data readiness dimensions. Get a personalised readiness score, tier interpretation, and prioritised next steps for AI agent deployment.",
  applicationName: SITE_NAME,
  authors: [{ name: "Algoleap", url: "https://www.algoleap.com" }],
  creator: "Algoleap Salesforce Practice",
  publisher: "Algoleap",
  generator: "Next.js",

  // ─── Keywords ───
  keywords: [
    "Agentforce readiness",
    "Salesforce Agentforce",
    "data readiness assessment",
    "AI agent readiness",
    "Salesforce AI",
    "Agentforce scorecard",
    "Salesforce data quality",
    "Algoleap",
    "Salesforce practice",
    "Salesforce consulting",
    "Salesforce implementation",
    "AI readiness framework",
    "data governance",
    "Salesforce automation",
    "Einstein AI",
    "CRM data readiness",
    "Salesforce integration",
    "7-dimension framework",
    "data readiness scorecard",
    "Agentforce deployment",
  ],

  // ─── Canonical & Alternates ───
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // ─── Robots ───
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─── Open Graph ───
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Agentforce Readiness Scorecard — Free AI Readiness Assessment | Algoleap",
    description:
      "Take a free 3-minute self-assessment across 7 data dimensions. Know exactly where your organisation stands before investing in Salesforce AI agents.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Algoleap Agentforce Readiness Scorecard — 7-Dimension Data Readiness Framework",
        type: "image/png",
      },
    ],
  },

  // ─── Twitter / X ───
  twitter: {
    card: "summary_large_image",
    title: "Agentforce Readiness Scorecard | Algoleap",
    description:
      "Free 3-minute AI readiness assessment. Know where your data stands before deploying Salesforce Agentforce.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@algoleap",
    site: "@algoleap",
  },

  // ─── Icons ───
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
  },

  // ─── Verification ───
  // Uncomment and add your verification codes when ready:
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   other: {
  //     "msvalidate.01": "your-bing-verification-code",
  //   },
  // },

  // ─── Category ───
  category: "technology",

  // ─── Other ───
  other: {
    "format-detection": "telephone=no",
  },
};

// ═══════════════════════════════════
// JSON-LD Structured Data
// ═══════════════════════════════════

function JsonLdSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Algoleap",
    url: "https://www.algoleap.com",
    logo: "https://www.algoleap.com/wp-content/uploads/2023/12/algoleap-logo.png",
    description:
      "Algoleap is a Salesforce consulting practice specialising in AI readiness, Agentforce deployment, data governance, and Salesforce implementations.",
    sameAs: [
      "https://www.linkedin.com/company/algoleap",
      "https://twitter.com/algoleap",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free Agentforce data readiness assessment",
    },
    description:
      "A free 3-minute self-assessment tool that evaluates your organisation's data readiness for Salesforce Agentforce across 7 key dimensions.",
    creator: {
      "@type": "Organization",
      name: "Algoleap",
      url: "https://www.algoleap.com",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "50",
      bestRating: "5",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Agentforce Readiness Scorecard?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Agentforce Readiness Scorecard is a free 3-minute self-assessment tool developed by Algoleap. It evaluates your organisation's data readiness for Salesforce Agentforce AI agents across 7 key dimensions including data quality, integration, governance, and more.",
        },
      },
      {
        "@type": "Question",
        name: "How long does the assessment take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The assessment takes approximately 3 minutes to complete. You'll answer 7 questions across different data readiness dimensions and receive instant results with a personalised readiness score, tier interpretation, and recommended next steps.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Agentforce Readiness Scorecard free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the Agentforce Readiness Scorecard is completely free. No credit card is required. You'll receive your results instantly after completing the assessment, and can optionally receive a detailed PDF report via email.",
        },
      },
      {
        "@type": "Question",
        name: "What are the 7 Dimensions of Data Readiness?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Algoleap's 7-Dimension Data Readiness Framework assesses: Data Quality & Completeness, Data Integration & Accessibility, Data Governance & Security, AI/ML Readiness, Change Management, Technical Infrastructure, and Business Alignment. Each dimension is scored from 1-5.",
        },
      },
      {
        "@type": "Question",
        name: "Who developed the Agentforce Readiness Framework?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The 7-Dimension Data Readiness Framework was developed by Algoleap's Salesforce Practice team, drawing from experience across 14+ Salesforce implementations, 50+ AI projects, and 36+ Salesforce certifications.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Algoleap",
        item: "https://www.algoleap.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Salesforce Practice",
        item: "https://www.algoleap.com/salesforce",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Agentforce Readiness Scorecard",
        item: SITE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}

// ═══════════════════════════════════
// Root Layout
// ═══════════════════════════════════

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <JsonLdSchema />
      </head>
      <body>{children}</body>
    </html>
  );
}
