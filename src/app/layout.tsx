import type { Metadata, Viewport } from "next";
import { clsx } from "clsx";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/components/providers/AuthProvider';

const InterVariable = localFont({
  variable: "--font-inter",
  src: [
    { path: "./InterVariable.woff2", style: "normal" },
    { path: "./InterVariable-Italic.woff2", style: "italic" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://admin.spoken.com' : 'http://localhost:3000'),
  title: {
    default: "Spoken Admin Portal - AI-Powered French Learning Management",
    template: "%s | Spoken Admin"
  },
  description: "Comprehensive admin dashboard for managing your AI-powered French learning mobile app content, analytics, user engagement, and course creation. Streamline your French language education platform.",
  keywords: [
    "French learning",
    "language education", 
    "AI teaching",
    "course management",
    "educational technology",
    "admin portal",
    "learning analytics",
    "content management",
    "French language",
    "education platform"
  ],
  authors: [{ name: "Spoken Team", url: "https://spoken.com" }],
  creator: "Spoken",
  publisher: "Spoken",
  applicationName: "Spoken Admin Portal",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://admin.spoken.com",
    siteName: "Spoken Admin Portal",
    title: "Spoken Admin Portal - AI-Powered French Learning Management",
    description: "Comprehensive admin dashboard for managing your AI-powered French learning mobile app content, analytics, and user engagement.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spoken Admin Portal Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@spoken_app",
    creator: "@spoken_app",
    title: "Spoken Admin Portal - AI-Powered French Learning Management",
    description: "Comprehensive admin dashboard for managing your AI-powered French learning mobile app content, analytics, and user engagement.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://admin.spoken.com",
  },
  category: "education",
  classification: "Educational Technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={clsx(
        GeistMono.variable,
        InterVariable.variable,
        "scroll-pt-16 font-sans antialiased",
      )}
    >
      <body className="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
