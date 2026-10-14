PaoLash — Plan B: premium camera UI and complete try-on experience

Status: proposed design brief, 12 October 2026. This document specifies future screens, interactions, and acceptance criteria; no camera UI is implemented by this document. Companion brief: [3D eyelash asset design](/Users/adhivishnu/Documents/polash/paolash-premium/docs/AR_3D_ASSET_DESIGN_PLAN.md).

The experience should feel like a calm PaoLash consultation: a large clear view of the visitor, a small set of beautiful finish choices, and an obvious next action. The camera view and the quality of the lashes provide the visual impact. The surrounding interface uses PaoLash's existing burgundy, champagne, warm ivory, and Manrope typography.

1. **Set a restrained visual direction.**

   Working experience name: “The Lash Mirror”. This is a proposed label to review with the screen design, not a new brand commitment.

   Use generous spacing, precise alignment, short copy, thin dividers, strong readable typography, and a single primary action at each stage. Put essential controls on dependable solid or sufficiently opaque surfaces. Keep the live image free of decorative tints and face-covering panels.

   | Role | Starting token | Usage |
   |---|---|---|
   | Brand surface | `#310912` | Entry screen, details, and controls |
   | Secondary burgundy | `#420C19` | Supporting panels |
   | Camera surround | Proposed `#160F12` | Quiet frame around the real video |
   | Primary text | `#F6EADB` | Titles and actionable labels |
   | Accent | `#D8B779` | Selected style and limited emphasis |
   | Primary button | `#E6CF9C` with `#310912` text | Continue and booking actions |
   | Secondary text | `#CCB9B8` | Helpful supporting copy on tested solid surfaces |

   Existing values come from the current site stylesheet; the camera surround is new. Verify rendered contrast instead of assuming a brand colour combination is accessible.

   Use the existing Manrope family. Plan 28–36 px mobile introduction titles, 20–24 px selected-style titles, 14–16 px controls/body, and at least 12 px for nonessential notes. Avoid squeezing the website's very large editorial headlines into the live camera. Use a 4/8 px spacing system, approximately 20 px phone gutters, and 24–32 px desktop gaps. Control panels may use 16–24 px radii; shape and spacing remain consistent across all states.

2. **Design the complete journey.**

   Collection → introduction → camera permission → preparing/loading → framing help → live preview → optional comparison/details/save → booking or close.

   Add “Try on me” to an existing finish result. Preserve that finish as the opening selection. Provide a general entry point near the collection introduction that starts with a clearly labelled default. Loading AR starts only after entry; the normal website remains light.

   The introduction uses one concise title, one sentence, an approved preview image, and a primary “Open camera” button. Suggested copy: “Find your finish, on you.” Supporting copy: “Try our lash looks with a live camera preview.” Privacy note: “Your camera preview is processed on your device.” Secondary action: “Browse real results.”

   Request browser permission after the deliberate Open camera action. Camera permission is separate from optional analytics or marketing choices. HTTPS and browser permission are required for camera access. [MDN camera documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

3. **Give the mobile camera a clear composition.**

   Use a full-screen experience within the browser viewport, respecting safe areas and browser controls. The top bar contains the small PaoLash label, help, and an always-available close control. The main area shows the face. Reserve the bottom region for a compact control dock so the selector never covers the eyes.

   Proposed composition:

   ```text
   ┌──────────────────────────────────┐
   │ PaoLash                 Help   × │
   │                                  │
   │                                  │
   │           LIVE CAMERA            │
   │      eyes remain unobstructed    │
   │                                  │
   │        Original / With lashes    │
   ├──────────────────────────────────┤
   │ Wispy hybrid             Details │
   │ Airy texture. Soft definition.   │
   │                                  │
   │ [Wispy] [Volume] [Eyeliner]  →    │
   │                                  │
   │        Book this finish          │
   └──────────────────────────────────┘
   ```

   This diagram defines hierarchy, not fixed pixels. Aim for roughly 60–70% of usable height for the camera on typical portrait phones. Compact copy and supporting controls on short screens; use a separate scrollable details view at large text sizes. Do not shrink touch targets to preserve the ratio.

   Anchor the eye-framing guide relative to the available camera area. Ensure video crop and AR coordinates use the same transform. Layout changes must never move the digital lashes independently of the video.

4. **Adapt desktop, tablet, and landscape deliberately.**

   On wide screens, use a large centred dialog, approximately 1120–1240 px maximum width subject to viewport space. Allocate about two-thirds to the camera and one-third to a 300–360 px style/details panel. Keep the camera's native proportions through deliberate cropping or neutral margins; never stretch the face.

   At intermediate widths, switch based on available content space rather than an assumed device name. On landscape phones, use a narrow side control panel if that leaves more useful eye-view area than a bottom dock. Test browser bars, notches, and virtual keyboards.

   Lock background interaction while the experience is open, preserve the website's scroll position, contain focus, and restore focus to the opening control on exit. Define browser Back behaviour so it closes the try-on once before leaving the originating page; avoid duplicate history entries on style changes.

5. **Make style selection clear and immediate.**

   Display three live-ready extension finishes with consistent thumbnails, visible names, and one short distinguishing phrase. Thumbnails should use approved assets and a consistent presentation. Keep real-work photographs clearly labelled when shown in details.

   A selected style has both a visible selected marker and a border/contrast change. A horizontal strip on smaller screens may reveal the next card partially, but every choice remains reachable by tap and keyboard. Do not auto-scroll or auto-cycle styles.

   Load the chosen model first. When a different style is requested, show its pending state while keeping the currently displayed style name and asset consistent. Commit the new thumbnail selection, title, model, and booking context together after loading. If loading fails, retain the previous valid look and offer an inline retry for the requested one.

   Use a short transition only if it preserves believable lash density. Prefer a quick swap over two overlapping lash sets. Target a cached change within 150 ms. Camera capture and the face tracker continue throughout.

   Show Lash lift as “See real results” until its separate preview is approved. Do not disguise reference photography as a fourth live effect.

6. **Keep comparison honest and easy.**

   The primary comparison is an accessible “Original / With lashes” control on the same live view. Original means the current camera feed with the digital lashes hidden. It does not remove existing natural lashes or makeup.

   A press-and-hold shortcut may be added, but a normal tap/keyboard-operable toggle must remain available. Provide an explicit selected state and avoid relying on gestures alone.

   A frozen comparison is a secondary view. Capture one synchronised source frame and render its original and styled variants from the same timestamp. A split comparison must use that shared frame so head position, lighting, and expression do not create a misleading difference. Include labelled comparison buttons as an alternative to dragging a divider.

   Keep density and length controls out of the initial customer interface unless the artist approves specific selectable variants. An arbitrary “beauty intensity” slider would make the preview diverge from the actual named finish.

7. **Specify every camera and recovery state.**

   | State | Presentation/copy direction | Available action |
   |---|---|---|
   | Permission explanation | Calm introduction with local-processing note | Open camera; browse results; close |
   | Browser permission pending | “Allow camera access to start your preview.” | Close; brief help; do not repeatedly prompt |
   | Loading files | “Preparing your lash preview…” with real phase/progress information | Cancel/close; browse results |
   | Permission denied | “Camera access is off.” with concise browser help | Retry after permission changes; browse results |
   | Camera unavailable or busy | “Your camera is unavailable right now.” | Retry; browse results |
   | No face/poor positioning | Temporary framing guide and “Bring your face into view.” | Continue positioning; help; close |
   | Too far/turned away | One relevant instruction such as “Move a little closer.” | Continue positioning |
   | Low light | “Try facing a window or a brighter light.” when the quality signal is reliable | Continue; browse results |
   | Tracking ready | Guide fades away; selected look becomes active | Switch; compare; details; book |
   | Tracking interrupted | Overlay removed; one discreet guidance message | Reposition; close |
   | Style download fails | Existing look remains; failed choice has retry text | Retry choice; select another |
   | Slow device | Adapt visual detail automatically; explain only if the experience remains poor | Continue if usable; browse results |
   | Background/resume | Processing pauses; privacy-sensitive suspension stops tracks | Explicit resume where camera was stopped |
   | GPU/context failure | A bounded recovery attempt followed by a clear fallback | Restart preview; browse results |
   | Unsupported browser/in-app browser | Explain how to open the website in a supported browser | Open/copy website link; browse results |
   | Optional service/telemetry limit | No interruption to local camera preview | Drop optional events; preserve main actions |
   | Asset service temporarily blocked | “The preview is temporarily unavailable.” | Browse results; retry later; book |

   Debounce guidance so it does not flicker or repeatedly announce itself. Prioritise one actionable message at a time. Do not show facial landmark dots, developer errors, confidence percentages, fake scanning progress, or a promise that the browser detected an exact physical fit.

   Loading progress must reflect known bytes or honest named phases. Keep a cancel action visible through slow networks. Closing during a pending permission request must invalidate startup and stop any camera stream that arrives later.

8. **Design details, saving, and booking as complete secondary flows.**

   Details opens a small sheet on mobile or uses the desktop side panel. Include the style name, one-sentence description, artist-approved reference photography, and “Your final look is tailored at the studio.” Keep the active selection intact. If the sheet largely covers the camera, suspend unnecessary rendering without silently changing camera state.

   Optional saving is reached from a secondary action, not a large shutter button competing with booking. Freeze a synchronised frame locally and enter a clearly labelled review state. Stop the camera during review. Provide Save image, Back to live, and Delete preview. Returning to live explicitly restarts camera capture. Release temporary images when deleted or the experience closes.

   A saved image may carry the chosen finish and a small PaoLash mark in a margin, without covering the face. Keep the preview qualification readable. Configure cross-origin asset delivery so a local canvas export works; test it before promising download support. If sharing is later added, use a deliberate user action and the platform share interface; never upload or send automatically.

   “Book this finish” follows the existing Fresha flow. Stop the camera before handoff. Only claim a treatment is preselected if a verified service-specific URL actually does that. Otherwise say “Continue to booking” and remind the visitor which finish they chose. Booking remains available even when AR is unsupported.

9. **Make motion restrained and responsive.**

   Use approximately 180–240 ms panel entrances, 120–160 ms selection feedback, and a gentle 200–300 ms fade for a framing guide after stable detection. These are design starting points, not intentional delays added to already completed work.

   Keep the camera and lash tracking continuous during interface transitions. Avoid decorative looping animation and large blur effects on the live screen. Prioritise tracking/rendering over background website animation. Under reduced-motion preferences, remove positional transitions and retain immediate state changes or minimal fades.

   The close control, comparison control, and booking action should respond even while models are loading. A premium feel depends on predictable behaviour as much as typography and colour.

10. **Build accessibility into the visual specification.**

    Target 48 × 48 CSS px for primary touch controls with sufficient spacing. This exceeds W3C's enhanced target-size threshold of 44 × 44 CSS px. [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

    Verify ordinary text at 4.5:1 contrast and large text at 3:1. Use reliable control backgrounds so a bright camera frame cannot erase the labels. [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

    Provide visible focus, accessible names for icons, Escape to close, ordered keyboard navigation, selected-state announcements, and restrained live-region messages. Selection must not be communicated through colour alone. Avoid keyboard traps inside nested sheets.

    Test 320 px wide screens, 200% text zoom, screen readers, reduced motion, and landscape. Preserve a useful text-and-photography path for people who cannot or do not want to use the camera. The live visual simulation itself cannot be made equivalent through an empty canvas label.

11. **Define the handoff between this interface and the AR engine.**

    The UI receives selected/pending style IDs, asset-load phase, camera permission/startup state, tracking quality category, supported capabilities, and recoverable/fatal error categories. It sends start, stop, select style, show original, freeze frame, resume, and dispose requests.

    The UI does not need raw face landmarks. Keep those inside the local tracking/rendering pipeline. Store selection in memory for the visit; do not make camera access depend on an account, a server session, or a per-style API call.

    Version UI thumbnails and model manifests together. When closing, restore scroll/focus and dispose the session exactly once. A new opening must not inherit stale worker messages, a previous stream, or a pending style response.

    Performance telemetry, if enabled under the site's analytics choices, may include startup duration, coarse device tier, style ID, error category, and booking click. Exclude camera frames, screenshots, face geometry, and sensitive free text. A booking click is not proof of a completed booking.

12. **Produce a reviewable design package before implementation.**

    Deliver a flow diagram, responsive wireframes, final visual screens, reusable component variants, colour/type/spacing tokens, motion notes, copy, accessibility annotations, and the full state table. A clickable prototype should demonstrate entry, permission explanation, live switching, comparison, an error recovery, and booking; it is a later deliverable, not created by this plan.

    Prepare representative layouts at 390 × 844 and 360 × 800 for phones, 768 × 1024 for tablet, and 1440 × 900 for desktop, then add small-height and enlarged-text cases. Treat these as design canvases rather than fixed viewport requirements.

    | Design milestone | Acceptance requirement | Initial effort estimate |
    |---|---|---:|
    | Direction and wireframes | One approved visual direction, mobile/desktop hierarchy, complete flow | 1–2 design days |
    | Visual screens/components | Entry, live, selector, comparison, details, fallback, review, booking | 2–3 design days |
    | Interactive prototype and checks | Critical flows, responsive/accessibility review, realistic loading/error states | 1–2 design days |
    | Handoff and revisions | Component/state contract and corrected final package | 1–2 design days |

    Expect about 5–9 design days, overlapping the 3D benchmark. Frontend implementation and device QA are separate work in the overall project estimate. The UI can be reviewed with labelled placeholders, but final visual approval requires the actual approved lashes in the live view.

13. **Use clear experience acceptance criteria.**

    A first-time visitor should understand the camera action without explanation, start without registration, identify the active finish, switch to another finish, compare it with their original view, and find booking and close. Test these tasks with a small usability group before release and record failures rather than relying on internal familiarity.

    Require no controls over the eyes in supported layouts; readable controls over both bright and dark camera scenes; usable interaction at enlarged text; no automatic camera start; camera stopped after close/review/booking; correct focus restoration; no model request on every frame or style re-selection; and honest handling of unavailable effects.

    Retain the earlier engineering targets as provisional launch gates: cached style changes within 150 ms, at least 24 rendered FPS on supported midrange phones, p75 warm startup within 3 seconds, and cold startup measured against a declared device/network profile. Slow networks get honest progress and a usable exit. Do not promise universal timing from a design prototype.

    The final joint review is one complete mobile journey with a production candidate asset: open the selected finish, allow the camera, blink and turn, change finishes, compare, inspect details, and continue to booking. Approve the interface and the 3D result together before general rollout.
