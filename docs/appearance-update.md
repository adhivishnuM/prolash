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
  only group transforms over 32–40 seconds, with no scroll interception.
  Movement stops for reduced motion and pauses while the document is hidden.
- Production AR exclusions and build guards remain in force.

Validation: lint, TypeScript/static export, production source/export guards,
phone/desktop visual inspection, exact computed white/burgundy control colors,
no added horizontal overflow, and changing ribbon transforms with stable layout.
