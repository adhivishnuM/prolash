# Background removal prompt set

Built-in image editing tool, background-extraction mode, 17 October 2026.

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

