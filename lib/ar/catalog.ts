import type { LashStyleId } from "./types";

export interface LashStyle {
  id: LashStyleId;
  name: string;
  shortName: string;
  shape: string;
  eyebrow: string;
  description: string;
  detail: string;
  preview: string;
  referenceImage?: string;
  number: string;
  character: readonly [string, string, string];
}

export const LASH_STYLES: readonly LashStyle[] = [
  {
    id: "wispy-hybrid", name: "Wispy hybrid", shortName: "Wispy", shape: "Airy spikes", eyebrow: "A little texture",
    description: "Airy fans. Longer, delicate spikes.",
    detail: "Soft, open fans alternate with longer accents for a deliberately uneven silhouette. A little space between the spikes keeps this look light and textured.",
    preview: "/ar/lashes/wispy-hybrid.preview.svg", referenceImage: "/assets/lash-hybrid.webp", number: "01", character: ["Airy", "Alternating lengths", "Textured"],
  },
  {
    id: "russian-volume", name: "Russian volume", shortName: "Volume", shape: "Full + rounded", eyebrow: "More drama",
    description: "Dense, soft fans. A full, rounded shape.",
    detail: "Closely layered fans build an even, rounded silhouette. More fibres and fewer open spaces give this look its dense, plush finish.",
    preview: "/ar/lashes/russian-volume.preview.svg", referenceImage: "/assets/lash-russian.webp", number: "02", character: ["Dense fans", "Rounded", "Full volume"],
  },
  {
    id: "eyeliner-effect", name: "Eyeliner effect", shortName: "Eyeliner", shape: "Outer sweep", eyebrow: "A lifted line",
    description: "Short inside. Longer at the outer corners.",
    detail: "A gradual increase in length leads into a pronounced outward sweep. The longer outer fibres draw the eye sideways for an elongated, winged finish.",
    preview: "/ar/lashes/eyeliner-effect.preview.svg", referenceImage: "/assets/lash-line.webp", number: "03", character: ["Outer length", "Swept", "Elongated"],
  },
  {
    id: "natural-classic", name: "Natural classic", shortName: "Natural", shape: "Short + fine", eyebrow: "Less, beautifully",
    description: "Shorter, finer lashes. Soft everyday definition.",
    detail: "Sparse individual fibres follow the natural lash line with restrained length and open space. This digital look is a starting point for discussing a subtle finish with your artist.",
    preview: "/ar/lashes/natural-classic.preview.svg", number: "04", character: ["Short", "Fine fibres", "Light density"],
  },
  {
    id: "doll-eye", name: "Doll eye", shortName: "Doll", shape: "Long centre", eyebrow: "Eyes, wide open",
    description: "A dramatic centre. A wide-eyed finish.",
    detail: "The longest fibres sit above the centre of the eye, tapering noticeably towards both corners. This digital look explores a tall, rounded shape to discuss with your artist.",
    preview: "/ar/lashes/doll-eye.preview.svg", number: "05", character: ["Centre length", "Tall curl", "Wide-eyed"],
  },
  {
    id: "wet-look", name: "Wet look", shortName: "Wet", shape: "Defined clusters", eyebrow: "Texture, with an edge",
    description: "Narrow clusters. Deliberate space between.",
    detail: "Closely gathered fibres form narrow, pointed clusters with visible gaps between them. This digital look explores a separated, freshly defined texture to discuss with your artist.",
    preview: "/ar/lashes/wet-look.preview.svg", number: "06", character: ["Narrow clusters", "Separated", "Pointed texture"],
  },
];

export const BOOKING_URL = "https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624";

export function getLashStyle(id: string | null | undefined): LashStyle {
  return LASH_STYLES.find((style) => style.id === id) ?? LASH_STYLES[0];
}
