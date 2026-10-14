# PaoLash self-hosted face-tracking assets

The application runs face detection in a dedicated browser worker. No camera
frames or face landmarks are sent to a service. Runtime, WASM and model files
are delivered from the same origin as the website.

## Runtime

MediaPipe Tasks Vision, Google, pinned npm package `@mediapipe/tasks-vision@1.1.0`.
The package declares the Apache License, Version 2.0. A copy is included as
`LICENSE-APACHE-2.0.txt`. The JavaScript and WASM files are copied unmodified.
The source map referenced by the upstream bundle is not distributed.

Source: https://www.npmjs.com/package/@mediapipe/tasks-vision/v/1.1.0

Project: https://github.com/google-ai-edge/mediapipe

## Model

Google MediaPipe Face Landmarker bundle, `face_landmarker/float16/1`, downloaded
from the versioned official Google model bucket. It contains face detection,
face landmarks, face blendshapes, and geometry metadata. Its source and full
SHA-256 are recorded in `manifest.json`; the filename carries a hash prefix.

Documentation: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker

Model card: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf

The runtime package's license declaration is recorded separately from model
provenance. Do not infer additional rights from a documentation-page license.
Check upstream model terms as part of deployment review.

## Reproduction and upgrades

Run `node scripts/prepare-ar-runtime.mjs` after installing dependencies. The
script verifies package version and every expected SHA-256, copies the two
classic-worker WASM variants, and downloads the pinned model only if it is
missing. Subsequent builds use the local model. It fails on a checksum mismatch.
Review new upstream versions and update the expected hashes explicitly before
upgrading; never use a `latest` URL at runtime.

Only one of the SIMD and non-SIMD WASM variants is downloaded by a visitor.
