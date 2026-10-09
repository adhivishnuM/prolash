import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import FirebaseAnalytics from "@/components/firebase-analytics";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], display: "swap", variable: "--font-work-sans" });

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "PaoLash Lounge & Academy",
  url: "https://paolash-studio.adhivishnu-m.chatgpt.site/",
  logo: "https://paolash-studio.adhivishnu-m.chatgpt.site/assets/logo.webp",
  image: "https://paolash-studio.adhivishnu-m.chatgpt.site/og.png",
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
  metadataBase: new URL("https://paolash-studio.adhivishnu-m.chatgpt.site"),
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
    title: "PaoLash — Quiet luxury. Unmissable eyes.",
    description: "Bespoke lash artistry and professional education in Dublin 2.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PaoLash Lounge & Academy — Quiet luxury. Unmissable eyes." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PaoLash — Quiet luxury. Unmissable eyes.",
    description: "Bespoke lash artistry and professional education in Dublin 2.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">
      <body className={`${workSans.variable} antialiased`}>
        <FirebaseAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
