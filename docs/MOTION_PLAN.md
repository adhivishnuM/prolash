# PaoLash — section choreography

Native Next.js App Router, React and TypeScript. Deep maroon surfaces, warm paper-coloured type and gold from the supplied logo; real photography only. No custom cursor or intercepted scrolling. White-theme checkpoint: 7d26f7c.

Typography uses Manrope throughout: a modern sans-serif with upright, lighter-weight gold emphasis, not calligraphic or luxury-serif styling.

| Section | Composition and movement |
| --- | --- |
| Hero | Unframed founder portrait against a large brand masthead. Fade-and-rise typography with unclipped glyphs and opposing scroll depth; stronger portrait movement on phones. |
| Collection | Standalone “Find your finish” experience using four original treatment photographs. Per-photo curtain reveals, staggered captions, zoom settling and gentle scroll depth work on desktop and phone. Hover/focus exposes the image action; selection wipes in a full photograph and staggers the treatment details and booking action. Two-column phone chooser, no carousel or scroll pinning. |
| Artist | Full founder portrait and short statement. Words fill with burgundy as the section passes. |
| Recognition | Complete certificate and trophy rise independently and settle level. Both link to original images. |
| Aftercare | Oversized AFTER / CARE typography, independently moving product photograph and small annotations. |
| Academy | Three complete photographs unfold from an overlapping contact sheet, followed by a large moving ACADEMY wordmark. Direct training enquiry and an uncropped International Top Trainer certificate, with a full-size viewing link. |
| Before visiting | Studio invitation with a perforated Dublin ticket stub. Appointment information opens in a native dialog. |
| Closing | Invitation with opposing text lines and the supplied logo rising into view. |

## Mobile, accessibility and performance

- Collection is a compact responsive section on all screens, with full photos and accessible mobile navigation buttons.
- Collection previews use square photographic crops with modest scroll overscan; selected treatment images and certificates use object-fit: contain so the full originals remain visible.
- Native scrolling schedules one requestAnimationFrame callback. Layout geometry is measured on resize, image loading and font readiness; only nearby scenes receive animation writes.
- Finish selection focuses the result heading without scrolling; returning restores focus to the chosen button. A stable stage and disabled scroll anchoring avoid layout jumps. Reduced-motion shows static photographs and removes reveal/movement effects.
- Academy photo spreading is measured on the contact sheet itself, independently of the longer certificate section. Mobile wordmarks use vertical motion and safe side margins.
- Navigation includes a skip link, visible focus treatment, mobile focus trap and Escape handling.
- Appointment dialog uses native focus containment and Escape dismissal, with an explicit close control.
- No AI-generated people, fabricated course dates or placeholder booking actions.

## Delivery checks

- TypeScript and native Next.js production export.
- Desktop and narrow-phone composition, overflow, full-image visibility and scroll transitions.
- Mobile menu and appointment dialog interactions.
- Firebase Hosting publishes the native out/ export.
