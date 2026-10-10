# PaoLash — section choreography

The direction is an image-led fashion editorial on a white base with the supplied logo’s red and gold accents. Each chapter has one distinctive movement, generous space and restrained copy. Preserve the supplied logo, real lash photographs, appointment information, academy contact and full competition documents.

| Section | Composition | Desktop movement | Mobile movement |
| --- | --- | --- | --- |
| Hero | Oversized two-line title, unframed portrait, small lash detail | Masked line entrances; portrait and type separate in depth on scroll | Shorter entrance and shallow depth; no pinning |
| Collection | Large, unboxed photographs with names below | Native vertical scroll drives a sticky horizontal gallery; direct navigation controls | Native scroll-snap gallery, touch swipe and previous/next controls |
| Artist | Portrait beside a short personal statement | Portrait rises; individual words fill with burgundy as the chapter crosses the viewport | Same reading effect with reduced travel |
| Recognition | Large third-place typography and two complete exhibits | Certificate and trophy rise at different rates and settle level | Smaller staggered reveals; complete images remain visible |
| Details | White field, red/gold title, expanding lash photograph, separate aftercare object | Image scales to its full size; title drifts laterally; aftercare rises | Image expansion and independent aftercare reveal |
| Academy | Photographic folio with course selectors | Folio straightens on arrival; selected course changes image and description | Tap targets with crossfade; keyboard arrow-key support |
| Essentials | Quiet numbered accordion rows | Row-by-row entrances and animated opening height | Identical accessible disclosure behavior |
| Closing | Large invitation and oversized supplied brand mark | Two title lines drift apart; logo rises into its final position | Shorter travel and vertical contact layout |

## Interaction and performance

- Native scrolling, native cursor, no scroll interception or continuous decorative loops.
- One requestAnimationFrame callback scheduled by scroll. Cache scene geometry during layout changes; write only visible scenes.
- Animate transforms and opacity; text fill is restricted to the small artist quote. No large blur effects.
- Image dimensions reserve layout space. Photographs and documents use object-fit: contain. Certificate and trophy link to complete originals.
- Sticky gallery requires at least 1000px width and 650px height; smaller windows use a native horizontal gallery.
- Respect prefers-reduced-motion: disable pinning and scroll transforms; show all content immediately and keep every control usable.
- Keyboard access: menu focus trap and Escape, gallery navigation, academy arrow-key tabs, semantic accordion, skip link.
- Validate narrow mobile, tablet and laptop layouts, reduced-motion behavior, navigation, gallery progress, academy switching and full document visibility.
