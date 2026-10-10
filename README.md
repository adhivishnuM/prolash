# PaoLash premium website

An image-led, animated Next.js website for PaoLash Lounge & Academy in Dublin.

## Highlights

- Next.js App Router implementation
- Responsive editorial layout for phone, tablet and desktop
- Real PaoLash logo and client photography
- Scroll choreography, image reveals, animated service selector and mobile menu
- Accessible reduced-motion mode, keyboard navigation and semantic content
- Direct Fresha booking, WhatsApp, email and social links

## Local development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

The native Next.js build exports to `out/`. Preview with `npm start`.

## Firebase Hosting

```bash
npm run build
firebase deploy --only hosting --project prolash-ec7ba
```

Firebase serves `out/` as configured in `firebase.json`. Retained `dev:sites` and `build:sites` scripts provide optional compatibility tooling, not the primary runtime.

Section-specific motion is documented in `docs/MOTION_PLAN.md`.
