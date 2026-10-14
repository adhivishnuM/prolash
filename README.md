# PaoLash premium website

An image-led, animated Next.js website for PaoLash Lounge & Academy in Dublin.

## Highlights

- Next.js App Router implementation
- Responsive editorial layout for phone, tablet and desktop
- Real PaoLash logo and client photography
- Scroll choreography, image reveals, animated service selector and mobile menu
- Accessible reduced-motion mode, keyboard navigation and semantic content
- Direct Fresha booking, WhatsApp, email and social links
- Local-device lash mirror at `/try-on/`: six distinct 3D grooms, live comparison and local photo capture

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

## Lash mirror

`npm run dev` and `npm run build` verify the pinned, self-hosted tracking runtime. If the model is missing, preparation fetches it from the official MediaPipe model location and checks its SHA-256. Camera permission is requested only after **Open camera**. Tracking runs in a worker on the device; there is no paid inference API or camera upload.

```bash
npm run ar:assets   # Regenerate six GLB reference models and matching SVG previews
npm run ar:check    # Check runtime integrity, grooms and tracker lifecycle
npm run build
npx playwright install chromium webkit
npm run test:ar     # Browser flows and pose/rendering regressions
npm run ar:verify   # Complete local release verification
```

The GitHub workflow in `.github/workflows/lash-quality.yml` runs the release checks on pull requests. See `docs/AR_IMPLEMENTATION.md` for architecture, visual calibration, and release checks. These grooms still require artist approval and physical iPhone/Android validation before a public launch.
