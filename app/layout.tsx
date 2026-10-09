import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], display: "swap", variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "PaoLash — Lash Artistry & Academy, Dublin",
  description: "Award-recognised lash artistry, bespoke brows and professional education in Dublin.",
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
      <body className={`${workSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
