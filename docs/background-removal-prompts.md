# Background removal prompt set

## Current production extraction — 22 October 2026

Built-in image editing tool, background-extraction mode, three parallel tasks.
The new AI selections preserve soft transparency boundaries. The earlier
threshold/erosion pipeline below is historical and is no longer used by the site.

The AI output RGB is discarded. `scripts/prepare-portrait-cutouts-v3.mjs` applies
only its alpha to the original JPEG's decoded RGB. Alpha is normalized with a
continuous 8–248 range to suppress near-transparent diffusion noise and restore
opaque interiors. There is no binary threshold, erosion, skin/fabric processing,
sharpening, recoloring or upscaling. Source framing was unchanged for all three
tool results; only empty delivery canvas is trimmed.

Current assets:

- `public/assets/portraits/paola-seated-cutout-v3.webp` — 881 × 1489.
- `public/assets/portraits/paola-standing-cutout-v3.webp` — 578 × 1500.
- `public/assets/portraits/paola-educator-cutout-v3.webp` — 430 × 1203.
- Full-canvas PNGs and smooth masks are retained under `assets/portraits/` with
  `-v3` filenames. These saved masks reproduce the export without another AI run.
- `assets/portraits/cutout-v3-provenance.json` records source SHA-256 values,
  crop coordinates and zero RGB difference for every visible delivery pixel:
  seated 739,046; standing 435,496; educator 248,055.

### Current prompt set

Shared constraints used for each built-in edit:

```text
Use case: background-extraction. Image 1 is the exact EDIT TARGET and identity
reference, not inspiration. Remove ONLY the gray studio wall and floor to actual
alpha transparency. Preserve the original full canvas, exact subject position,
scale, camera framing, pose, face identity/geometry/expression, skin texture,
makeup, hair and flyaways, earrings, body, suit, shirt, fingers, shoes and props.
No redrawing, enhancement, beautification, skin smoothing, sharpening,
relighting, color grading, changed proportions, texture or invented details.
Keep natural antialiased boundaries and thin objects; open negative spaces.
Avoid matte outlines, white halos, jagged edges, missing earrings, clipped hair,
checkerboard and background haze. This image supplies ONLY alpha; the final
image retains original RGB so the client's face and texture remain unchanged.
```

Per-image instructions:

- Seated: lock 1024 × 1536 canvas; retain the whole woman AND the complete cream
  chair, upholstery, gold legs, shoes and raised metal tweezers; remove floor
  visible between chair legs. Primary agent handled this edit.
- Standing: lock 1024 × 1536 canvas; preserve the full burgundy suit, both shoes,
  jewelry, hair and face; clear the bent-arm opening. Standing extraction agent.
- Educator: lock 1254 × 1254 canvas; preserve the full walking pose, both shoes,
  hair, jewelry and especially the thin tweezers beside the fingers. Educator
  extraction agent; alignment analysis found zero translation against source.

## Historical extraction — 17 October 2026

Only the output transparency channels were retained, in `assets/portraits/paola-{seated,standing,educator}-refined-mask.png`. All colour data in the final cutouts comes from the original JPEGs. The masks are thresholded and antialiased; the standing suit's mask is additionally contracted by two source pixels to remove the pale backdrop fringe. No subject texture processing occurs. Empty transparent canvas is trimmed from web delivery files. The full-canvas source PNGs remain available for the social composition.

Final files are `public/assets/portraits/paola-{seated,standing,educator}-cutout.webp`. Run `node scripts/prepare-brand-portraits.mjs` to encode and verify original RGB preservation after the transparent crop.

## seated

```text
Use case: background-extraction.
Input image 1: ORIGINAL PHOTOGRAPH AND EXACT EDIT TARGET, not a style or identity reference.
Primary request: Remove ONLY the grey studio wall and floor to genuine transparency. Retain the entire seated woman, the complete cream chair including every thin leg, both shoes, earrings, hair flyaways, and the metal tweezers.
CRITICAL COORDINATE LOCK: keep the original 1024 by 1536 canvas, subject coordinates, pose, proportions, scale and framing EXACTLY. Do not recenter, zoom, resize, crop or move anything.
PRESERVATION: preserve the original photographic texture, skin pores, fabric weave, wrinkles, colours, lighting, facial features, expression, makeup, hands and hair exactly. This is a precise background selection operation, not image regeneration or enhancement.
EDGE MATTE: carefully follow the actual silhouette at native resolution. Remove all grey/white studio backdrop spill and pale fringes around the hair, shoulders, fingers, shoes and garment edges. Preserve real fine hair and thin objects. Transparent holes between limbs, chair legs and tweezers must be open. Natural antialiasing only at the boundary, fully opaque interior. No white rim, glow, outline, feathered haze, added shadow, smoothing, sharpening, beauty retouching, relighting or reconstructed detail.
Output: clean transparent PNG, source photograph with ONLY background removal; no text, decorations or new objects.
```

## standing

```text
Use case: background-extraction.
Input image 1: ORIGINAL PHOTOGRAPH AND EXACT EDIT TARGET, not a style or identity reference.
Primary request: Remove ONLY the grey studio wall and floor to genuine transparency. Retain the entire standing woman, both shoes, earrings, bracelets, hair flyaways and every part of the burgundy suit.
CRITICAL COORDINATE LOCK: keep the original 1024 by 1536 canvas, subject coordinates, pose, proportions, scale and framing EXACTLY. Do not recenter, zoom, resize, crop or move anything.
PRESERVATION: preserve the original photographic texture, skin pores, fabric weave, wrinkles, colours, lighting, facial features, expression, makeup, hands and hair exactly. This is a precise background selection operation, not image regeneration or enhancement.
EDGE MATTE: carefully follow the actual silhouette at native resolution. Remove all grey/white studio backdrop spill and pale fringes around the hair, shoulders, fingers, shoes and garment edges. Preserve real fine hair and thin objects. Transparent holes between limbs, chair legs and tweezers must be open. Natural antialiasing only at the boundary, fully opaque interior. No white rim, glow, outline, feathered haze, added shadow, smoothing, sharpening, beauty retouching, relighting or reconstructed detail.
Output: clean transparent PNG, source photograph with ONLY background removal; no text, decorations or new objects.
```

## educator

```text
Use case: background-extraction.
Input image 1: ORIGINAL PHOTOGRAPH AND EXACT EDIT TARGET, not a style or identity reference.
Primary request: Remove ONLY the grey studio wall and floor to genuine transparency. Retain the entire walking woman, both shoes, hair flyaways, earrings and especially the thin metal tweezers held at her side.
CRITICAL COORDINATE LOCK: keep the original 1254 by 1254 canvas, subject coordinates, pose, proportions, scale and framing EXACTLY. Do not recenter, zoom, resize, crop or move anything.
PRESERVATION: preserve the original photographic texture, skin pores, fabric weave, wrinkles, colours, lighting, facial features, expression, makeup, hands and hair exactly. This is a precise background selection operation, not image regeneration or enhancement.
EDGE MATTE: carefully follow the actual silhouette at native resolution. Remove all grey/white studio backdrop spill and pale fringes around the hair, shoulders, fingers, shoes and garment edges. Preserve real fine hair and thin objects. Transparent holes between limbs, chair legs and tweezers must be open. Natural antialiasing only at the boundary, fully opaque interior. No white rim, glow, outline, feathered haze, added shadow, smoothing, sharpening, beauty retouching, relighting or reconstructed detail.
Output: clean transparent PNG, source photograph with ONLY background removal; no text, decorations or new objects.
```

