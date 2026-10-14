import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaoLashExperience, { type SectionRoute } from "@/components/paolash-experience";

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
      title: `${page.title} | PaoLash Dublin`,
      description: page.description,
      url: `/${section}/`,
      images: [{ url: "/paolash-social-clean.png", width: 1200, height: 630, alt: "PaoLash Lounge & Academy in Dublin 2" }],
    },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in sections)) notFound();
  return <PaoLashExperience initialSection={section as SectionRoute} />;
}
