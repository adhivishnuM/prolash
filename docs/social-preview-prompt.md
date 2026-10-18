# PaoLash photography and social preview

## Current social preview

Asset: `public/paolash-social-studio.png`, 1200 × 630 pixels, opaque PNG.

The composition uses the client's original `assets/portraits/paola-seated.jpeg`
photograph, the real PaoLash logo, and the site's Manrope font. The portrait is
cropped to the upper body for a recognisable face at small sharing sizes. Its
studio background softly blends into maroon at the left edge using CSS.
No image generation, retouching, enhancement, texture changes, background
extraction, or colour grading is used in this social image.

The headline is “The art of being you.” Supporting text is “Lash artistry &
academy” and “Dublin, Ireland”. The composition has been visually reviewed at
1200 × 630, 600 × 315, and 360 × 189.

Recreate from the original assets:

```sh
npm run build
node scripts/generate-social-card.mjs
npm run build
```

The first build supplies the bundled Manrope font. The second exports the newly
rendered image. The renderer uses Playwright to screenshot deterministic local
HTML/CSS, with no external images or fonts.

`lib/social-preview.ts` holds the shared URL, dimensions, MIME type and alt text.
Root and section Open Graph/Twitter metadata reference this new filename.
Structured salon data uses the same image. Older social PNGs are retained for
history but are no longer referenced by the current metadata.

## Website portrait cutouts

Website portraits continue to use transparency masks with colour pixels taken
directly from the client's original JPEGs. See
`docs/background-removal-prompts.md` for the exact extraction prompts and saved
mask paths. `scripts/prepare-brand-portraits.mjs` verifies every visible RGB
pixel of each delivery cutout against its source photograph after trimming empty
canvas. The award photograph keeps its full original background.
