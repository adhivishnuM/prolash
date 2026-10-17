# PaoLash original photography and current social preview

Current assets use the client's original JPEGs in `assets/portraits/`.
The seated portrait is used for the homepage/social image, the standing portrait
for the artist, the walking portrait for the academy. The award photo keeps its
full background.

The three studio cutouts use transparency masks only. No generated pixels,
retouching, skin smoothing, sharpening, colour grading, or upscaling are applied.
The current refined masks were extracted with the built-in image editing tool;
its generated colour data is discarded. `scripts/prepare-brand-portraits.mjs`
combines only the alpha masks with RGB decoded directly from the original JPEGs,
cleans the transparency boundary and trims empty canvas. Delivery WebPs use
lossless encoding. The script verifies every visible RGB pixel against the
original and fails if any colour differs. See `background-removal-prompts.md`
for the exact current prompt set and asset paths.

Recreate the delivery files from the saved refined masks with:

```sh
node scripts/prepare-brand-portraits.mjs
```

The current social asset is `public/paolash-social-portraits.png`: a deterministic
1200 × 630 HTML/CSS layout using the real logo, Manrope font, flat maroon, and
the original seated photograph with transparency. Run
`node scripts/generate-social-card.mjs` after a build makes the font available,
then rebuild to export the asset. Open Graph and Twitter metadata use this image.
All earlier generated cutouts were replaced.

## Historical artwork, no longer referenced by current metadata

Generated with the built-in image-generation tool, October 2026.
Asset: `public/paolash-social-2026.png`. This is the social-sharing artwork only;
the website retains the original, unaltered founder and treatment photographs.
The previous `scripts/brand-social.mjs` generator is legacy and does not generate this asset.

## Final prompt

Use case: ads-marketing. Create a finished premium PaoLash website social sharing preview, landscape 1200x630 composition (1.905:1). Reference image 1 is STYLE AND COMPOSITION ONLY: its rich painterly paper texture, confident clean modern sans typography, generous quiet left space and beautifully detailed subject on right. Do not copy its house, vegetation, blue palette, business name or text. Reference image 2 is the REAL founder Paola: preserve her recognizable face, hair, beige blazer and hand-at-chin pose. Integrate her portrait on the right 40%, elegant editorial painted-photo treatment with very subtle paper grain, warm directional light, softly integrated edges, no frame. Reference image 3 is brand logo guidance, burgundy and champagne embossed paper—not a leather texture. Keep the composition restrained and cohesive: deep oxblood maroon #420c19 background with subtle tactile paper texture and painterly tonal depth, champagne cream lettering, tiny subdued gold detail. Large left aligned headline exactly "PaoLash" in bold modern geometric sans similar to Manrope, below exactly "Lash artistry & academy" in smaller modern sans, then "Dublin, Ireland" in small text. Optional tiny refined PL monogram at upper left derived from reference logo; do not duplicate full brand word. Text must be impeccably legible, not serif, script or italic. Portrait gracefully fades into maroon along the lower edge; face unobstructed, meaningful negative space, high-end art-directed beauty campaign with the reference's craftsmanship. No UI, no buttons, no borders, no cards, no badge collection, no sparkle, no glitter, no ornamental flowers, no invented certificates, no extra text. Keep all lettering and face safely inside 7% canvas margins. This is the final actual social image, not a device mockup.
