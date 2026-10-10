# PaoLash — section choreography

Native Next.js App Router, React and TypeScript. White space, burgundy and gold from the supplied logo; real photography only. No custom cursor or intercepted scrolling.

| Section | Composition and movement |
| --- | --- |
| Hero | Unframed founder portrait against a large brand masthead. Masked type entrance and opposing scroll depth. |
| Collection | Photo-led lash exhibit with a visual thumbnail index. Each image button has an explicit View look / Now viewing label and selected edge; the main photograph transitions without pinning or extra scroll distance. |
| Artist | Full founder portrait and short statement. Words fill with burgundy as the section passes. |
| Recognition | Complete certificate and trophy rise independently and settle level. Both link to original images. |
| Aftercare | Oversized AFTER / CARE typography, independently moving product photograph and small annotations. |
| Academy | Three complete photographs unfold from an overlapping contact sheet, followed by a large moving ACADEMY wordmark. Direct training enquiry and an uncropped International Top Trainer certificate, with a full-size viewing link. |
| Before visiting | Studio invitation with a perforated Dublin ticket stub. Appointment information opens in a native dialog. |
| Closing | Invitation with opposing text lines and the supplied logo rising into view. |

## Mobile, accessibility and performance

- Collection is a compact responsive section on all screens, with full photos and accessible treatment buttons.
- Photos use object-fit: contain; certificates are never cropped.
- Native scrolling schedules one requestAnimationFrame callback. Layout geometry is measured on resize, image loading and font readiness; only nearby scenes receive animation writes.
- Treatment buttons expose their selected state; the changing description is announced politely. Reduced-motion disables transforms and transitions.
- Navigation includes a skip link, visible focus treatment, mobile focus trap and Escape handling.
- Appointment dialog uses native focus containment and Escape dismissal, with an explicit close control.
- No AI-generated people, fabricated course dates or placeholder booking actions.

## Delivery checks

- TypeScript and native Next.js production export.
- Desktop and narrow-phone composition, overflow, full-image visibility and scroll transitions.
- Mobile menu and appointment dialog interactions.
- Firebase Hosting publishes the native out/ export.
