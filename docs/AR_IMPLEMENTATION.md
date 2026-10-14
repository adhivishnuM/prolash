# Lash Mirror implementation and release status

Branch: `feat/premium-lash-try-on`. Route: `/try-on/`. Supported `?style=` links are `wispy-hybrid`, `russian-volume`, `eyeliner-effect`, `natural-classic`, `doll-eye`, and `wet-look`. The existing collection and Lash Finder keep their original treatment links. New digital looks are inspiration, not additional bookable services. Lash lift remains a photographic treatment reference.

## Implemented experience

- Responsive burgundy, ivory and champagne interface, actual-groom SVG thumbnails, style details with optional real-work reference photographs, and keyboard-accessible help. Six cards form a desktop grid and a compact mobile swipe rail.
- Explicit camera start, denied/busy/missing-camera recovery, startup cancellation, face-position guidance and automatic camera shutdown on hidden tabs, navigation, capture, errors and unmount.
- Six locally generated, independently fitted left/right eyelash grooms with face pose, blink deformation and depth occlusion.
- A stronger default lash silhouette and an accessible Soft–Bold definition slider; definition persists across style changes and camera restarts.
- Original/with-lashes comparison, same-frame still capture, local image download and explicit return to live camera.
- Fresha booking handoff using the existing salon booking URL.

## Rendering changes after the first visual review

The original tube renderer produced a dotted upper-lid outline. Individual tubes fell below one pixel in width, and their nearly forward-facing roots became especially short in a downward head pose. Lit polygon rings also produced bright, artificial highlights.

The revised grooms start with a lifted root and curve to fine tips. Wispy spikes, broad volume fans, and swept outer corners have separate length and spread distributions. Root spacing and length variation break up the uniform comb effect. Runtime rendering follows the same deformed 3D centrelines with camera-facing fibre ribbons, smooth alpha edges and conservative minimum-width coverage. Thin tips retain low opacity rather than becoming blunt wires. The backing buffer caps around 2.1 million pixels, independent of inference resolution.

The v1.2 groom increases fibre-body thickness and density, adds a short underlayer, and keeps the taper fine. The definition slider changes optical density, not product lengths or eye geometry. Controls have larger mobile hit areas, and the live camera no longer carries a decorative guidance bubble.

The v1.3 collection uses explicit length maps, curl, fan spread, grouping and direction for each look. Natural is shorter and sparse; Wispy alternates airy fans with tall accents; Volume uses dense broad fans; Eyeliner builds from a short inner corner to a swept outer wing; Doll peaks strongly at the centre; Wet gathers fibres into narrow pointed clusters. Selector SVGs are generated from the same fitted geometry at one fixed eye scale, and asset checks prevent model/thumbnail drift. All six can be switched in an active session without requesting another tracking asset or camera stream. Browser tests compare every pair of actual rendered silhouettes on a fixed, locally detected fixture face, so tracking jitter cannot hide duplicate grooms.

The visible camera background is synchronized to the exact frame used for tracking. This removes the asynchronous raw-video/old-landmark mismatch that made lashes drift during movement. A separate inference canvas can step down from a 640-pixel longest edge to 512 or 384 pixels without lowering saved-image resolution. Sustained slow frames also reduce the renderer to a one-megapixel budget. Only one inference remains in flight.

Camera playback has a 12-second first-frame timeout. A six-second frozen-stream watchdog releases the camera and offers a restart; an OS mute interruption pauses cleanly. Face validation accounts for the actual `object-fit: cover` crop so out-of-view eyes do not enable capture. Analytics collection is suspended on mirror entry, including client navigation from the homepage, and delayed analytics initialization checks the current route before proceeding.

`eye-pose.ts` derives closure from three-dimensional lid opening; raw blendshape values alone cannot fold an open eye's lashes downward. `face-occluder.ts` uses 852 MediaPipe face triangles, with eye openings preserved, to mask fibres behind the face. It writes depth only and adds no visible face layer.

Portable GLBs remain actual tube meshes for 3D review. Runtime and exports share `lash-geometry.ts`; export files are not fetched during a camera session. Their live appearance intentionally uses the higher-quality strand rasterization described above. Neither exports nor procedural source are an artist-approved Blender master.

## Privacy, cost and request limits

The browser downloads same-origin scripts, one WASM variant, and the pinned face model after camera permission. Runtime files total about 28.4 MiB on disk because both SIMD and non-SIMD variants are included; a browser downloads only the chosen variant. Long-lived immutable cache headers cover versioned vendor files. Changing styles requires no network request. No video, photo, landmarks or face measurements are uploaded or retained by a server. Downloads are created locally; closing/deleting a still discards its in-memory data URL. The camera route does not initialize the site's analytics module.

There is no new API endpoint or metered inference service to rate-limit. One inference may be in flight at a time, duplicate frames are skipped, tracking runs at an adaptive rate, startup/inference have timeouts, and stale overlays clear. These are device workload controls, **not** a global anti-abuse system. Hosting transfer still costs money; CDN abuse controls, budget alerts and production traffic thresholds must be configured for the actual hosting account before launch. No hosting firewall or budget setting was deployed by this branch.

## Verification

- Production Next.js static export, TypeScript and ESLint.
- Model/runtime hash verification and 11 tracker cancellation, ownership, timeout and worker-failure tests.
- Deterministic grooms; finite geometry; normals/winding; eyelid attachment; mirrored orientation; blink length preservation; GLB export/reload and size budgets.
- Chromium and WebKit browser flow tests with a synthetic camera made from an existing site photograph, exercising the real local MediaPipe worker and WebGL renderer. Camera denial, pending cancellation, original comparison, definition adjustment, style selection, capture, save, restart, hidden-tab shutdown, stalled streams, OS interruptions, navigation cleanup and analytics suspension are included. WebKit uses a prototype-based camera fixture to avoid discarded WebIDL wrappers accidentally calling the real camera.
- Pose/closure tests, downward-pitch strand-rise regressions, continuous strand-coverage checks, and face-topology/depth-buffer cleanup tests.
- Local close-up visual review on supplied and existing photographic references. A screenshot already containing lashes cannot serve as a clean before/after realism benchmark.

`npm run ar:verify` runs the runtime dependency audit, lint, runtime and groom integrity, tracker tests, production build/typechecking, and the browser matrix. The audit blocks high/critical runtime advisories. `.github/workflows/lash-quality.yml` repeats this for pull requests with read-only repository permissions and retains failure evidence for seven days. This branch does not set remote branch-protection rules or claim that the newly added workflow has already run on GitHub. Action usage follows the upstream [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), and [upload-artifact](https://github.com/actions/upload-artifact) documentation.

The 2026-10-13 dependency review patched Next.js/its ESLint config to 16.3.8, sharp to 0.35.5, and affected source-map, URI and browser-mapping transitives. Firebase's unused server-side Firestore dependency pinned an affected gRPC line; an override holds `@grpc/grpc-js` at 1.14.6 without downgrading Firebase. The runtime audit then reported zero known vulnerabilities. This is a point-in-time registry result, not a claim that the entire application is vulnerability-free.

To produce local review boards while `npm start` serves the export:

```bash
node scripts/preview-lash-grooms.mjs --image=public/assets/founder-grey.webp --crop=150,80,450,540
```

The review script never opens a camera. Optional `--image`, `--crop=x,y,width,height`, `--origin`, and `--output` arguments stay local. Its default output is ignored `test-results/lash-grooms`; Playwright clears `test-results` when starting another run. Do not commit private reference photographs or their boards.

## Release gates still open

This implementation is a working preview, not a claim of Snapchat-level quality across all faces and devices. Obtain the lash artist's approval against real treatment measurements, then test consenting participants across eye shapes, head motion, blinks, lighting, skin tones, existing mascara and glasses. Physical Safari/iPhone and Chrome/Android tests must measure sustained frame rate, heat, permission recovery and save behavior. The automated browser fixture does not establish those results.

The renderer does not remove existing lashes or makeup, segment hands/hair/glasses, or measure treatment lengths in millimetres. Extreme poses are hidden rather than extrapolated. Public launch should wait for the visual and device acceptance criteria in the two design plans, plus production cache-header and hosting-budget verification.

Related plans: `AR_3D_ASSET_DESIGN_PLAN.md` and `AR_PREMIUM_CAMERA_UX_PLAN.md`.
