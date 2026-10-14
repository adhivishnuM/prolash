import type { Metadata } from "next";
import LashMirror from "@/components/lash-mirror/lash-mirror";

export const metadata: Metadata = {
  title: "The Lash Mirror — PaoLash",
  description: "Find your finish with PaoLash's live lash style preview. Explore six shapes, from natural classic to wispy, volume, eyeliner, doll eye and wet look.",
  alternates: { canonical: "/try-on/" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "The Lash Mirror — PaoLash",
    description: "Six distinct lash looks. A little time to find yours.",
    url: "/try-on/",
  },
};

export default function TryOnPage() {
  return <LashMirror />;
}
