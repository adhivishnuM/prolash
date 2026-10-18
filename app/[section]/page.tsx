import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaoLashExperience, { type SectionRoute } from "@/components/paolash-experience";
import { socialPreview } from "@/lib/social-preview";

const sections = {
  collection: { title: "The Collection", description: "Explore PaoLash signature lash finishes, tailored to your eyes." },
  artist: { title: "Paola Gutierrez — Lash Artist", description: "Meet Paola Gutierrez, founder and educator behind PaoLash in Dublin." },
  academy: { title: "PaoLash Academy", description: "Professional lash education and artist training with Paola Gutierrez in Dublin." },
  visit: { title: "Visit PaoLash Dublin", description: "Book bespoke lash artistry at PaoLash Lounge & Academy in Dublin 2." },
} as const;

type RouteSection = keyof typeof sections;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  if (!(section in sections)) return {};
  const page = sections[section as RouteSection];
  return {
    title: `${page.title} | PaoLash Dublin`,
    description: page.description,
    alternates: { canonical: `/${section}/` },
    openGraph: {
      type: "website",
      siteName: "PaoLash Lounge & Academy",
      locale: "en_IE",
      title: `${page.title} | PaoLash Dublin`,
      description: page.description,
      url: `/${section}/`,
      images: [socialPreview],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | PaoLash Dublin`,
      description: page.description,
      images: [{ url: socialPreview.url, alt: socialPreview.alt }],
    },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in sections)) notFound();
  return <PaoLashExperience initialSection={section as SectionRoute} />;
}
