# Approved appearance update — 21 October 2026

The full redesign was cancelled. Preserve the existing section compositions,
content, photography, typography, routing, carousel, and editorial motion.

- Canvas: white. Interface accents and primary actions: Burgundy Red #7D1F2D.
- Primary action text is white, including the collection booking action.
- Header/footer logo: the newly supplied `rose gold logo.png`, copied unchanged
  into `assets/brand/rose-gold-logo-original.png` and served from
  `public/assets/brand/paolash-logo.png`.
- Source and served logo SHA-256:
  `7f35bbdcdad826ce8c4ac9e8e13ec74f161128362962e7f67fdab1aa8022f987`.
- The background ribbons are an explicit rose-gold exception requested after
  the palette change. Their tapered shapes follow the supplied reference:
  upper-right sweep, paired left curves, middle-right sweep, lower-right sweep.
- `components/ambient-ribbons.tsx` renders the vector artwork. CSS animates
  only group transforms in closed 32–40 second orbits, with matching first and
  last frames and staggered phases. There is no scroll interception.
  Movement stops for reduced motion and pauses while the document is hidden.
- Production AR exclusions and build guards remain in force.

## Motion and share preview refinement

The subsequent request explicitly adds scroll and transition polish while
preserving the existing layout, text, palette and photography.

- A single requestAnimationFrame loop eases decorative scroll positions with
  time-based damping. It stops after settling and while the tab is hidden.
  Touch, wheel, keyboard and browser scrolling remain native.
- Portraits receive subtle depth movement; award and aftercare movement is
  restrained; local reveals use small staggered delays. Phone movement is
  reduced to 45% of desktop. Live reduced-motion preference changes clear
  decorative transforms and expose all content immediately.
- The share card is `public/paolash-social-burgundy-2026.png`, 1200 × 630.
  It uses the existing transparent seated portrait and the supplied new logo,
  unchanged, with the actual Manrope font, white canvas and burgundy text.
  No generative image processing, face retouching or texture enhancement.
- Reproduce it with `node scripts/generate-social-card.mjs` after a build.
  Open Graph, Twitter and structured data share the versioned URL; every
  exported section route uses it. Existing posts may retain platform caches.
- Run `node scripts/check-motion-preview.mjs` against the static preview on
  port 5174 (or set PREVIEW_URL) for responsive and motion checks.

Validation: lint, TypeScript/static export, production source/export guards,
phone/desktop visual inspection, exact computed white/burgundy control colors,
no added horizontal overflow, and changing ribbon transforms with stable layout.
