# Collection rewrite checks — 11 October 2026

- Replaced the old lookbook markup, carousel state and CSS; no legacy gallery remains.
- New scoped component: `components/lash-finder.tsx` and its CSS Module.
- Production build and TypeScript checks pass; `git diff --check` passes.
- Browser checked at 320 × 740, 390 × 844, 768 × 1024 and 1440 × 900.
- All four choices open the matching real treatment image and heading.
- Keyboard Enter activates every choice; result heading receives focus, and returning restores focus to the chosen control.
- Direct coordinate tap preserves scroll position on phone. No horizontal document overflow in checked layouts.
- Reduced-motion styles show completed drawings and remove result/reveal transforms (code-reviewed; OS preference was not changed during testing).
- Browser error/warning log empty during local interaction checks.
- Source comparison confirms hero, artist, recognition, aftercare, academy and studio notes are unchanged.
- Social preview is 1731 × 909 PNG, 2.5 MB. Open Graph, Twitter and structured-data image references use its versioned filename.

Social preview: generated campaign artwork inspired by the supplied visual reference;
the site's original photography has not been replaced or altered.
