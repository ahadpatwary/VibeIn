import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

// TODO: replace with your real production domain before deploying
const SITE_URL = "https://vibe-in-vibeinbackend.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SoundFear — Speak Freely. Get Better Every Time.",
    template: "%s | SoundFear",
  },
  description:
    "Long-form, interruption-free speaking practice with deep AI analysis. Talk about anything for as long as you want, then get a full report on grammar, fluency, vocabulary, and technical communication.",
  keywords: [
    "English speaking practice",
    "AI speech analysis",
    "fluency improvement app",
    "interview speaking practice",
    "technical communication practice",
    "public speaking AI feedback",
    "speaking coach AI",
  ],
  authors: [{ name: "SoundFear" }],
  creator: "SoundFear",
  publisher: "SoundFear",

  openGraph: {
    title: "SoundFear — Speak Freely. Get Better Every Time.",
    description:
      "Talk about anything for as long as you want. No interruptions, no predefined questions. AI analyzes your entire speech and shows you exactly how to improve.",
    url: SITE_URL,
    siteName: "SoundFear",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "SoundFear — AI Speaking Practice Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SoundFear — Speak Freely. Get Better Every Time.",
    description:
      "Long-form speaking practice with deep AI analysis — grammar, fluency, vocabulary, and technical communication.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  icons: {
    icon: "./logo.jpg",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  category: "education",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SoundFear",
  url: SITE_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "Long-form, interruption-free AI speaking practice platform with deep post-session analysis on grammar, fluency, vocabulary, and technical communication.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}