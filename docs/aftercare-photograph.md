# Aftercare photograph

The client supplied `after care .jpeg` on 22 October 2026. The unchanged original
is retained at `assets/aftercare/after-care-original.jpeg` (1254 × 1254).

`scripts/prepare-aftercare-photo.mjs` exports a full, lossless WebP at
`public/assets/aftercare-product.webp` and verifies identical decoded RGB pixels.
No cropping, background removal, sharpening, retouching, or generated pixels are
applied to this supplied product image.

The aftercare poster composition is restored from commit `40725aa`, before the
two-column simplification in `28ecd9b`. Its scroll values are restored from
`1d56bea`: opposing text drift of 110px, product rise of 90px, and rotation from
−8° to 0°, driven over the section's original viewport entrance interval. The
current GSAP timeline provides eased scroll following; reduced motion leaves
the complete poster visible in its settled state. White and burgundy styling
is retained.
