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
- Background ribbons were removed at the client's latest explicit request.
  The page canvas is plain white; there is no background animation component.
- Production AR exclusions and build guards remain in force.

## Motion and share preview refinement

The subsequent request explicitly adds scroll and transition polish while
preserving the existing layout, text, palette and photography.

- GSAP/ScrollTrigger now owns section-specific timelines, replacing the
  previous shared scroll handler. Native touch, wheel, keyboard and browser
  scrolling are preserved, with no pinning or artificial scroll length.
- Hero: masked headline, staggered copy/CTA, portrait entrance and depth.
- Collection: heading entrance and scroll-controlled deck opening; existing
  swipe, arrow, keyboard and treatment-detail behavior retained.
- Artist: portrait reveal, left-to-right statement fill, signature entrance.
- Recognition: staggered award/certificate arrival, retaining full photos.
- Aftercare: the original oversized opposing title poster and scroll animation
  restored from Git history, using the client's new full cleanser product photo.
- Academy: copy, educator and credential sequences triggered independently.
- Studio/closing: staggered practical details, converging headline, logo reveal.
- Phone movement uses 65% of desktop travel. Live reduced-motion changes
  revert all GSAP transforms and restore content. Context cleanup removes
  triggers during route changes; layout refreshes after images/fonts/details.
- The share card is `public/paolash-social-burgundy-v3.png`, 1200 × 630.
  It uses the existing transparent seated portrait and the supplied new logo,
  unchanged, with the actual Manrope font, white canvas and burgundy text.
  The latest AI extraction supplies only alpha; original RGB is verified intact.
  No generated face pixels, face retouching or texture enhancement are delivered.
- Reproduce it with `node scripts/generate-social-card.mjs` after a build.
  Open Graph, Twitter and structured data share the versioned URL; every
  exported section route uses it. Existing posts may retain platform caches.
- Run `node scripts/check-motion-preview.mjs` against the static preview on
  port 5174 (or set PREVIEW_URL) for responsive and motion checks.
- Run `node scripts/review-scroll-chapters.mjs` for phone/desktop walkthroughs
  and actual drag/open/return interaction checks. Recordings are ignored under
  `outputs/chapters/scroll-390.webm` and `scroll-1440.webm`.

Validation: lint, TypeScript/static export, production source/export guards,
phone/desktop visual inspection, exact computed white/burgundy control colors,
no horizontal overflow, live reduced-motion changes, and no background ribbons.
