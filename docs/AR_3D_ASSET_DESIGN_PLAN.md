PaoLash — Plan A: realistic 3D eyelash asset design

Status: proposed design brief, 12 October 2026. This document specifies future work; it does not represent completed models or verified performance. Companion brief: [premium camera UI/UX](/Users/adhivishnu/Documents/polash/paolash-premium/docs/AR_PREMIUM_CAMERA_UX_PLAN.md).

The objective is to make each finish recognisable as PaoLash's actual work, with convincing individual fibres, believable depth, stable eyelid attachment, and natural blinking on supported phones. Visual approval must happen in the live browser experience as well as in the modelling application. “Extremely realistic” is an acceptance standard to demonstrate, not a guarantee across every camera, face, and lighting condition.

1. **Establish the reference standard before modelling.**

   Use the existing PaoLash photographs as the starting reference. The inspected Wispy hybrid image shows distinct long accents and open spaces between groups; the Russian volume image shows a much denser, fuller silhouette. Obtain the artist's confirmation of the intended representative finish before assigning numerical geometry parameters.

   Prepare a reference board for each launch finish: front view, both three-quarter views, side profile, eyes open, half closed, and fully closed. Add a short blink/head-turn video in soft daylight. Obtain permission for any newly commissioned model photography and record approved uses. Existing website publication does not automatically establish rights for every new asset use.

   Ask the artist to record actual curl choices, length distribution, fan construction, density, root placement, and customisation range. These are treatment specifications, not measurements inferred from the visitor's camera. Mark any missing reference explicitly; do not invent product precision.

   Each board includes examples of an acceptable silhouette and visible defects to reject. Review at ordinary face-view scale and at a magnified eye crop. The normal phone view is the primary standard.

2. **Give each finish its own geometry and character.**

   | Finish | Geometry/art direction | Reject when |
   |---|---|---|
   | Wispy hybrid | Deliberately placed long accents among softer, shorter fans; layered depth; controlled negative space | All strands form one uniform comb, spikes are periodically repeated, or the result becomes a solid fringe |
   | Russian volume | Numerous fine tapered fibres grouped into artist-approved fans; fuller silhouette with visible separation at the tips | Thick bristles, opaque slabs, oversized fans, or density achieved only by darkening a texture |
   | Eyeliner effect | Artist-approved outward length/direction mapping; compact root definition produced by the lashes themselves | A painted eyeliner wing substitutes for the lash shape, or the longest outer strands droop unrealistically |
   | Lash lift | Separate research into the visitor's existing lash appearance and how lift could be represented honestly | An extension asset is simply renamed “Lash lift” |

   These are salon extensions. Model individual extensions and fans. The attachment guide is invisible; do not add a continuous visible strip-lash band. Let clustered roots create their natural density.

   For the initial live release, produce the three extension finishes. Keep Lash lift available as real-work reference photography until its separate visual method passes review. If four live effects are a launch requirement, price and schedule that research separately.

3. **Author a reusable high-detail master in Blender.**

   Build a neutral eyelid proxy for authoring, with controls for width, curvature, hooding, and eye opening. It is a fitting aid and must not replace the visitor's visible eye or skin in the camera image.

   Author fibres as groomable curves. Each fibre has a fine root, a smooth curl, and a tapered tip. Control length, fan spread, direction, and curl by position along the eyelid. Use restrained, deterministic variation approved by the artist; preserve each style's intentional pattern.

   Keep left and right eyes separately named and oriented. A shared authoring system can generate both, followed by individual checks for inner/outer direction. Record anatomical left/right independently from the mirrored selfie display.

   Keep the source groom editable. Blender provides hair-curve authoring nodes; the web delivery assets will be derived from that master. [Blender hair nodes](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/hair/index.html)

4. **Deliver actual depth efficiently in the browser.**

   Use curved strand meshes for important silhouettes, prominent wisps, outer corners, and visible curl. For dense interior volume, evaluate small curved mesh ribbons or fan cards carrying multiple fine fibres. This combines real three-dimensional structure with economical coverage; it is not a single flat lash picture.

   Retain a fuller geometry version as the visual reference. Compare the mobile versions against it on rotating and blinking faces. If cards become obvious in the supported pose range, replace that part with geometry or reduce the supported angle; do not conceal a structural defect with more opacity.

   Publish GLB/glTF meshes, supported materials, textures, and explicit deformation data. Treat the Blender groom, node setup, and offline hair shader as authoring tools: bake or convert their output into the supported runtime representation. Validate the exported result in the chosen browser renderer. glTF is designed for runtime asset delivery, but a file format alone does not reproduce an arbitrary Blender shader. [Khronos glTF overview](https://www.khronos.org/gltf/)

   Apply export transforms, resolve negative-scale mirroring, preserve topology/vertex ordering for any morph targets, and check normals, bounds, UVs, and texture colour spaces. Exclude the authoring head, cameras, lights, and unused materials from delivery. Pin the exporter, renderer, and any required compression decoders; run an export-and-reload check for every asset revision.

5. **Make motion part of the asset specification.**

   Each lash root has an attachment position along its eye's upper-lid curve, a local orientation, and an artist-defined offset. Fit the eyes independently. Head pose provides overall orientation; the changing eyelid curve controls actual attachment.

   Define open, half-blink, closed, and squint reference shapes. Choose one explicit runtime mechanism in the feasibility stage: an eyelid-driven deformation rig, supported morph targets, or a documented combination. Name and version its inputs. A GLB should not be expected to know how face-tracking landmarks drive it automatically.

   During a blink, roots follow the lid and fibre direction rotates naturally. Preserve fibre length and curl as far as the reference supports. Do not make blinking appear as lashes shrinking, staying suspended over the iris, or vanishing on every normal blink.

   Smooth attachment motion while measuring lag. If tracking becomes unreliable, hide the affected overlay quickly and let the UI provide positioning help. That fallback is separate from normal blink animation.

6. **Specify shading, transparency, and compositing.**

   Use an artist-approved near-black material with restrained highlights and plausible roughness. Avoid uniformly crushed black shapes and glossy plastic reflections. Evaluate more sophisticated directional fibre highlights only if the actual renderer and device budget support them.

   Keep the camera's skin, iris, eyelid, and natural lashes visible. Do not apply a global beauty filter, skin smoothing, eye reshaping, or colour grading to make the lash asset seem better. Match the overlay's sharpness and exposure gently to the camera image; avoid aggressive automated colour changes.

   Use a face/eyelid depth proxy where reliable to handle relevant facial occlusion. It does not solve hair, hands, or glasses crossing the eye. Those conditions need dedicated testing and a conservative degradation rule. A basic additive overlay also cannot remove existing heavy extensions or mascara.

   Compare alpha masking, blending, and supported edge-antialiasing techniques on the actual target browsers. Inspect haloing, sorting errors, disappearing tips, and shimmering during movement. The glTF specification defines MASK and BLEND behaviour; choosing a mode is not sufficient evidence of good fine-hair rendering. [glTF material specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#materials)

7. **Set provisional asset budgets, then measure.**

   All geometry budgets below are for a complete left/right pair. They are initial engineering targets, not verified device capacity.

   | Delivery tier | Initial triangle budget | Use |
   |---|---:|---|
   | High | 30,000–60,000 | Devices with measured graphics headroom and closer inspection |
   | Standard | 10,000–25,000 | Default mobile candidate |
   | Reduced | 4,000–8,000 | Slower devices, retaining recognisable shape and curl |

   Target 2–4 draw calls for the pair, a small shared material set, and 512–1024 px texture atlases where needed. Start with an incremental transfer target of 0.3–1 MB per style and a provisional 1.5 MB ceiling including assets required for that style. Track shared dependencies separately and include them in first-load totals. Tracking model and WASM downloads are additional.

   Measure decoded texture memory, vertex memory, alpha overdraw, decode time, and rendering time as well as file size. Compression must preserve the fine tips. A small file can still render poorly or use excessive GPU memory.

   Move between quality tiers with stable thresholds and hysteresis so the lashes do not visibly change detail every few frames. If the reduced tier loses the finish's defining shape, offer reference photography on that device.

8. **Agree the asset-to-application contract.**

   | Contract field | Required meaning |
   |---|---|
   | `styleId`, `displayName`, `assetVersion` | Stable correspondence with the website collection |
   | `previewKind`, `approvalStatus` | Distinguish extensions, research-only looks, and approved launch assets |
   | Model and texture URLs/hashes | Immutable assets and traceable revisions |
   | Coordinate convention and units | Document glTF export coordinates and the renderer's conversion |
   | Anatomical eye mapping | Explicit left/right and inner/outer orientation |
   | Attachment map | Root positions, local axes, and supported eyelid deformation inputs |
   | Shape/rig mapping | Named blink/squint inputs, ranges, and neutral pose |
   | Fitting bounds | Permitted width/curve adaptation and tested head-pose range |
   | Quality tiers | File sizes, triangle counts, textures, and material requirements |
   | UI assets | Consistent thumbnail, short description, and real-work references |
   | Booking reference | Existing verified service mapping or general booking URL |

   Adapt to relative eye geometry within reviewed bounds. Do not present camera estimates as exact millimetre measurements. Reject or hide missing/unapproved assets cleanly rather than silently substituting another style.

9. **Review a complete proof package for each finish.**

   Deliver the editable Blender source, approved reference board, GLB quality tiers, textures, attachment metadata, licence/provenance notes, versioned manifest, and export settings.

   Include front/side/three-quarter turntables, open-to-closed blink sequences, wireframe views, alpha-edge crops, and captures from real mobile browsers. Render catalogue thumbnails from the same approved geometry with a consistent camera and light setup. Label illustration renders appropriately and keep real-work photographs identifiable.

   The lash artist reviews style fidelity, the 3D artist reviews geometry/material quality, and the frontend/graphics engineer reviews fitting and runtime behaviour. At least one independent reviewer should see each finish on a moving face before launch.

10. **Use explicit visual acceptance gates.**

    | Gate | Proposed requirement |
    |---|---|
    | Style identity | All three finishes are clearly distinguishable and approved against actual PaoLash work |
    | Root attachment | Premium target: p95 root error at or below 2–3% of visible eye width on a held-out annotated test set within the declared operating range; revise the earlier 4% exploratory threshold after the benchmark |
    | Still-face stability | Premium target: residual root jitter at or below 1% of eye width after accounting for real eyelid motion |
    | Blink quality | Normal blinking preserves root attachment and plausible direction; no routinely floating or disappearing lashes |
    | Fibre appearance | Tapered tips, readable curl, believable fan separation, and no visible strip band |
    | Transparency | No persistent light/dark halos, blocky cards, or distracting shimmer at normal viewing scale |
    | Fit coverage | Reviewed across different eye widths, monolids/hooded lids, skin tones, and left/right asymmetry |
    | Motion | Forward view and the moderate-turn envelope established in the prototype pass human review |
    | Runtime | Standard tier sustains the agreed camera-experience performance target on the supported device matrix |
    | Export consistency | Browser appearance matches the approved reference closely enough for artist sign-off |

    Thresholds are starting targets to refine after the first fit experiment. Measure per device/condition as well as overall averages. Use consenting test participants and keep test captures under a defined access and deletion policy.

11. **Sequence the work to prove the hardest part first.**

    | Stage | Deliverable | Initial effort estimate |
    |---|---|---:|
    | References and specification | Three approved direction boards and treatment parameters | 1–2 artist days |
    | Benchmark finish | One groom, exported pair, eyelid attachment, and believable blink on iPhone/Android | 3–5 days across artist and graphics engineer |
    | Remaining finishes | Two distinct models built from the reviewed authoring system | 3–5 artist days |
    | Optimisation and proof package | Quality tiers, metadata, browser review captures, revision fixes | 3–5 combined days |

    Expect roughly 2–4 calendar weeks for the initial asset track when the required people and references are available, overlapping UI design and engine work. These estimates refine the earlier overall plan and are not added mechanically to every other estimate. The benchmark can expose extra work, especially for blinking or natural-lash occlusion. Lash lift is outside this estimate.

12. **Make the first approval concrete.**

    Approve one benchmark finish on a real moving face in the browser before producing the complete set. Use Russian volume to stress dense-fibre rendering, and a small wispy sample to expose fine-tip and silhouette defects. Review daylight, ordinary indoor light, blink, moderate turn, and a closer eye crop on an iPhone and a midrange Android.

    The decision is whether that representative result meets the brand's visual standard within a measured mobile budget. If it does, replicate the pipeline for the remaining looks. If it does not, adjust the groom, fitting, or renderer and compare a commercial SDK on the same references before committing to the full catalogue.
