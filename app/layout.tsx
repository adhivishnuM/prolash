import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import FirebaseAnalytics from "@/components/firebase-analytics";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], display: "swap", variable: "--font-work-sans" });
const editorial = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], display: "swap", variable: "--font-editorial" });

export const viewport: Viewport = { themeColor: "#480c1b" };

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "PaoLash Lounge & Academy",
  url: "https://prolash-ec7ba.web.app/",
  logo: "https://prolash-ec7ba.web.app/assets/paolash-logo-transparent.png",
  image: "https://prolash-ec7ba.web.app/og-burgundy.png",
  description: "Bespoke lash artistry, signature sets and professional education in Dublin 2.",
  telephone: "+353838119207",
  email: "support@paolash.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "65 William St S",
    addressLocality: "Dublin 2",
    postalCode: "D02 AW81",
    addressCountry: "IE",
  },
  sameAs: [
    "https://www.instagram.com/paolash_lounge",
    "https://www.tiktok.com/@paolash_0",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://prolash-ec7ba.web.app"),
  title: "PaoLash — Lash Artistry & Academy, Dublin",
  description: "Bespoke lash artistry, signature sets and professional education by PaoLash in Dublin 2.",
  applicationName: "PaoLash Lounge & Academy",
  keywords: ["lash extensions Dublin", "lash artist Dublin", "Russian volume lashes", "lash lift Dublin", "PaoLash Academy"],
  authors: [{ name: "PaoLash Lounge & Academy" }],
  creator: "PaoLash Lounge & Academy",
  publisher: "PaoLash Lounge & Academy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "PaoLash Lounge & Academy",
    locale: "en_IE",
    title: "PaoLash — The art of being you.",
    description: "Bespoke lash artistry and professional education in Dublin 2.",
    images: [{ url: "/og-burgundy.png", width: 1200, height: 630, alt: "PaoLash’s champagne monogram on burgundy — The art of being you." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PaoLash — The art of being you.",
    description: "Bespoke lash artistry and professional education in Dublin 2.",
    images: ["/og-burgundy.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/assets/paolash-logo-transparent.png",
    shortcut: "/assets/paolash-logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">
      <body className={`${workSans.variable} ${editorial.variable} antialiased`}>
        <FirebaseAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
