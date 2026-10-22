# Mobile performance and navigation — 22 October 2026

Scope follows the final client direction: keep the existing one-page design.
No new gallery/detail pages, added homepage links, section redesign or ribbon.
Existing section URL aliases are retained for compatibility only.

- Navbar and hero links scroll within the current page, to the actual content
  rather than padded section boundaries. Layout offsets deliberately ignore
  reveal/GSAP transforms. Header clearance is measured for phone and desktop.
- Certificates are ordinary images. No asset links, separate-tab actions or
  “View certificate” buttons.
- Original overlapping collection deck and inline treatment details remain.
  Embla replaces the gesture lock/per-pointer React renders; dragging does not
  accidentally open a treatment. Only nearby photos mount, with lazy loading.
- Lossless resized WebP display variants retain the supplied originals. The
  480px logo is about 96 KB instead of 2 MB; the 640px lash variants total
  3,673 KB rather than 5,633 KB for the previous 900px variants.
- Firebase core/analytics load after the critical first render, in idle time.
  GSAP loads on desktop only. Phones use one-shot observer/CSS reveals, native
  scrolling and no continuous scroll timelines. Reduced-motion stays supported.

Checks: `node --experimental-strip-types --test tests/section-scroll.test.mjs`,
`npm run lint`, `npm run build`, `node scripts/check-home-export.mjs`.
The standard build also checks that AR/camera code is absent from production.
