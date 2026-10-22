# PaoLash website migration — white and burgundy

Status: superseded by the user's 21 October 2026 instruction to restore the existing design and apply color changes only. Do not implement the redesign below without a new request. Preserve existing layouts, content, photography, routing, and interactions; use white backgrounds, burgundy #7D1F2D interface accents, and the new supplied rose-gold logo.
Prepared: 21 October 2026.
Production baseline: `main` at `1d56bea2f2f87ca540bc1670260027fb26042cfe`.
Working checkout: `/Users/adhivishnu/Documents/polash/paolash-production`.
Repository: https://github.com/adhivishnuM/prolash

## 1. The brief and the decisions this plan makes

Recompose PaoLash as a carefully designed, minimal studio website. Keep its recognisable identity: authentic photography, generous white space, Manrope typography, rounded photographic corners, restrained curves, the personal presence of Paola, and a clear invitation to book. Make every section earn its space through a useful visitor question, convincing work, or a next step.

The central correction is **white backgrounds and Burgundy Red `#7D1F2D` for the interface**. Rose gold belongs to the newly supplied logo. It must not become the general palette for headings, buttons, gradients, waves, panels, or selected states.

This is a coordinated design and content migration within the existing Next.js application. The plan does not require moving to Framer, Canva, another framework, a new CMS, or another hosting provider. The reference establishes a polished editorial feeling; its literal decorative elements and proportions are not a specification to copy.

The primary visitor journey is choosing a lash look and booking. The secondary journey is learning about Paola's education offering. The site should support both without making booking visitors scroll through several repeated promotional endings.

Planning approval authorizes the proposed direction, not an automatic production deployment. Implementation should proceed through the complete local preview and verification stages below. Publishing remains a separate, explicit step.

### Non-negotiable requirements

- Use the new client file `rose gold logo.png` as the logo source, preserving its red and rose-gold finish.
- Use white as the dominant canvas and exact `#7D1F2D` as the brand/action color. Remove inherited champagne, peach, metallic, and rose-gold UI treatments.
- Preserve the original pixels, skin texture, clothing, facial features, and colors of the client photographs. No generated people or photographic enhancement.
- Keep all eight newly supplied lash photographs in the collection with their correct names. Retain the new Classic close-up in the compact care content.
- Keep the four supplied Paola photographs with distinct purposes: seated hero, standing artist, walking educator, and full award photograph.
- Keep the award photograph's original background and complete framing.
- Maintain clean URLs and the feeling of one connected website: `/`, `/collection/`, `/artist/`, `/academy/`, `/visit/`.
- Keep booking, contact, map, social, keyboard navigation, and mobile touch behavior working throughout migration.
- Keep Try On, Lash Mirror, camera code, and related assets out of production. They remain on their separate development branch.
- Resolve the narrow tablet layouts as deliberately as phone and desktop layouts. The repeatedly reported 597–621px range is a required review size.
- Preserve all client-approved business facts and booking policy terms. Do not invent reviews, prices, course availability, treatment durations, or outcomes to fill a layout.

## 2. Baseline and why the current site feels unfinished

The production checkout was clean when this plan was prepared. Its latest fixes are pushed to GitHub. Local production preview is on port 5174; the separate AR development preview is on port 5173. The latest pushed fixes have not been deployed as part of this planning task.

| Observed source condition | Effect on the experience | Migration response |
| --- | --- | --- |
| `--champagne`, `--gold-soft`, and `--rose-metal` still drive primary/accent colors | White background exists, but the identity still reads as rose gold | Replace with semantic white/burgundy/neutral tokens and audit every consuming component |
| Successive hero, artist, studio, and breakpoint overrides in `app/globals.css` | Proportions change unpredictably between widths; fixing one size can break another | Consolidate each component's styles and responsive rules; retire superseded declarations |
| Collection uses custom gesture state and a 900ms movement lock | Rapid input may be ignored; pointer movement causes React state updates | Prototype the existing Embla dependency for gesture physics; preserve working interactions until the replacement passes |
| Artist, recognition, academy credential, and closing each become large separate statements | Similar visual emphasis makes the journey feel long and repetitive | Combine related content into fewer, stronger chapters |
| Aftercare is mainly a large headline, image, and vague slogan | It consumes substantial space without answering a care question | Make it a compact, useful care/appointment information area |
| Visit information and a second large booking finale repeat one another | The end of the site has competing endings | Give visit one clear booking invitation and a quiet utility footer |
| `/visit/` targets the footer; route positioning uses a 120ms timer | A visit link can miss the practical information; timing is fragile | Target the visit section and establish deterministic navigation after layout readiness |
| Scroll effects move multiple headings, certificates, and images independently | Motion can make related elements feel disconnected | Use a small, consistent motion vocabulary with one owner per animated property |
| `docs/MOTION_PLAN.md` describes an older dark theme and four-photo treatment design | A later implementer could resurrect superseded decisions | Treat this document as the current brief; reconcile the old motion plan during implementation |

These observations are based on `components/paolash-experience.tsx`, `components/lash-finder.tsx`, `components/lash-finder.module.css`, `hooks/use-editorial-motion.ts`, `app/globals.css`, and the route/metadata files. They are not measurements of production performance; performance must be baselined before changing the application.

## 3. Visual system

### Color roles

| Role / proposed token | Value | Use |
| --- | --- | --- |
| `--color-canvas` | `#FFFFFF` | Main page, header, photo surrounds, menu |
| `--color-brand` | `#7D1F2D` | Primary buttons, active states, selected heading emphasis, links |
| `--color-brand-hover` | `#651925` | Hover/pressed treatment derived from the brand |
| `--color-ink` | `#321A20` | Main headings and prominent text |
| `--color-body` | `#5D5356` | Body copy and captions that must remain readable |
| `--color-muted` | `#75686C` | Secondary information, subject to contrast verification |
| `--color-surface` | `#FAF6F7` | Occasional functional inset, such as an expanded information area |
| `--color-line` | `#E8DDE0` | Only where a boundary clarifies a control or disclosure |
| `--color-on-brand` | `#FFFFFF` | Text/icons on primary buttons |
| `--color-focus` | `#7D1F2D` | A visible focus outline with separation from the surface |

White should visually dominate the entire page. Burgundy supplies emphasis and navigation. Neutral body text provides calm reading. Do not introduce alternating full-screen burgundy sections; the user's requested background is white. The proposed non-brand token values can be tuned for measured contrast and visual balance, but the exact brand color must remain `#7D1F2D`.

Primary buttons: solid burgundy, white text, consistent height, modest horizontal padding, one small arrow when it helps direction. Secondary actions: clear burgundy text, or a restrained outlined control where a control boundary is useful. Tertiary links: ordinary text links with visible hover and focus states. Buttons must not acquire metallic gradients, glow, oversized shadows, or several animated layers.

Replace `--cream`/`--wine`/`--champagne`/`--gold-soft` usages through an intentional component audit rather than a blind global find-and-replace. Component library aliases such as `--primary`, `--accent`, and `--primary-foreground` must point to the new semantic roles. Audit selection colors, focus rings, dialogs, image captions, carousel controls, and social graphics as well as the obvious headings.

### New logo: exact source and treatment

Authoritative source: `/Users/adhivishnu/Documents/polash/rose gold logo.png`.

- Verified dimensions: 1536 × 1024 PNG with transparency.
- SHA-256: `7f35bbdcdad826ce8c4ac9e8e13ec74f161128362962e7f67fdab1aa8022f987`.
- This replaces the older `paolash-paper-logo.png` as the preferred brand artwork when implementation starts.
- Preserve the full wordmark, monogram, metallic texture, existing transparency, colors, and aspect ratio. Inspect at actual navigation size on white before approving export sizing.
- Store an unchanged source in `assets/brand/` and a web copy in `public/assets/brand/`; use descriptive filenames and document provenance. Avoid a lossy export that damages small lettering.
- Adjust the image box and surrounding clear space, not the internal letter proportions. Do not use CSS color filters, blend modes, synthetic outlines, recoloring, generative recreation, or stretching.
- Review header, mobile menu, footer, metadata logo, social card, and favicon references. Do not force the full detailed wordmark into an unreadable tiny favicon; retain a legible approved icon until a suitable client-approved small-size variant exists.
- The new logo is an explicit exception to the UI palette restriction. Its rose gold does not authorize rose-gold buttons or background ornaments.

### Typography

Keep Manrope, already configured in `app/layout.tsx`. Use a small, consistent hierarchy rather than making every section headline as large as the hero. Retain the upright lighter-weight emphasis familiar from the current site; use burgundy for emphasis instead of rose gold.

| Text role | Phone starting range | Desktop starting range | Composition rule |
| --- | --- | --- | --- |
| Hero | 48–64px | 88–112px | Short, calm statement; line height around 1.05–1.12 |
| Section headline | 34–44px | 48–64px | Normally 2–3 lines maximum, dictated by available width |
| Artist statement | 32–42px | 48–60px | Must read comfortably alongside the portrait |
| Subheading | 22–28px | 28–36px | Use sparingly for genuinely subordinate content |
| Body | 16–18px | 17–19px | Roughly 1.55–1.75 line height; manageable line length |
| Label/caption | 12–14px | 12–14px | Restrained tracking; never essential information at 9px |

These are composition bounds, not instructions to force oversized type into a fixed grid. Use `clamp()` with deliberate limits. At 320px, allow a smaller hero or natural wrapping rather than clipping. Avoid hard-coded `<br>` tags that produce one-word columns on intermediate screens. Keep body copy around 45–65 characters per line where space permits. Keep names and short action labels together when they fit naturally.

### Grid, spacing, and surfaces

- Use one content shell, provisionally 1280px maximum, with fluid gutters: approximately 20px on small phones, 28–32px on tablets, and 48–64px on larger screens.
- Use a shared spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 88, 112. Avoid arbitrary per-section gaps accumulated through patches.
- Start major section spacing at 64–80px on phones and 96–128px on desktop; tighten related subsections to 24–48px. Do not pad every section to a viewport height.
- Build desktop compositions on an internal 12-column grid. Stack when text/image minimum widths no longer fit, rather than preserving two columns until they collapse.
- Use `minmax(0, ...)`, `min-width: 0`, and natural height. Long email/address content must wrap without widening the page.
- Use consistent photographic corner radii, provisionally 20–24px. Transparent portraits have no panel, border, or rounded clipping box.
- Reserve surfaces and shadows for interactive layers such as the header/menu/dialog. Sections themselves blend into the white canvas. Avoid section-ending divider lines and nested decorative cards.

## 4. Recommended content architecture

The resulting page has five main chapters and one compact care area. There is no need to add more sections merely to make the redesign feel larger.

| Current content | Decision | Visitor question answered |
| --- | --- | --- |
| Header and mobile menu | Refine and simplify | Where can I go, and how do I book? |
| Hero | Keep, rebalance | What is PaoLash, where is it, and does it feel right for me? |
| Lash collection | Strengthen | Which finish suits the look I want? |
| Artist + separate recognition | Combine into one story/proof chapter | Who is doing my lashes, and why should I trust her work? |
| Large aftercare poster | Replace with compact care content beside the practical visit information | How do I prepare, and where do I get care guidance? |
| Academy + separate trainer certificate block | Combine | Can I learn here, and who will teach me? |
| Studio invitation + oversized closing | Combine into one visit/booking chapter | Where is the studio and what do I do next? |
| Footer | Reduce to useful navigation and legal/brand information | How do I contact or follow the studio? |

Journey: **Hero → Collection → Artist & recognition → Academy → Visit, preparation & care → compact footer**.

On desktop, the page should vary between open paired compositions and a photo-led gallery. On mobile, preserve the order of meaning: section title, useful explanation, photograph/evidence, next action. Avoid creating an unrelated visual design on each screen size.

## 5. Section specifications

### 5.1 Header and mobile navigation

Keep the recognisable floating, rounded white header, made lighter through proportion rather than ornament. Use the new logo on the left, four text navigation links in the center, and a burgundy booking action on the right. Use a very subtle static shadow only if needed to keep it readable over photography.

Desktop target: about 72–84px tall, with consistent interior alignment. Phone target: about 64–72px tall, safe inset from the viewport edges, new logo and menu control. Show a short booking action on mobile only if it fits with appropriate spacing; do not compress the logo or touch targets to force it in. The mobile menu always contains booking prominently.

The menu should contain a clear list of the four destinations, one booking action, and compact studio/location information. Use a comfortable text size instead of oversized links in boxed rows. Opening and closing must retain Escape handling, focus containment, background inertness, and focus return. Crossing to desktop closes the mobile menu and releases body scroll.

Acceptance: no collision at 320px or 621px; navigation never covers the targeted heading; keyboard focus remains visible; all links work by click, touch, keyboard, and direct URL. The header stays stable during scroll, without a large shape or height transformation.

### 5.2 Hero — a confident, personal introduction

Keep “Entirely you.” and the seated photograph with tweezers. This portrait connects Paola to the craft and already matches the direction the client liked. Use the approved cutout with the original photo texture; do not regenerate it for this redesign.

Desktop: a balanced text/portrait composition, roughly 55/45 at wide sizes, with the headline, short explanation, and primary action forming one group. Align the visual center of the seated portrait to that group. The portrait should feel substantial without dominating the entire viewport or leaving the text isolated. Preserve the chair and the natural proportions; no stretched or floating body parts.

Phone: centered introduction followed by a centered portrait, with a controlled gap. “Entirely you.” may fit on one line on wider phones and two intentional lines on narrow phones. Prioritize readable introduction and an accessible action before the portrait; do not shrink everything to force the complete hero into one screen. The portrait should generally remain within a 320–390px content width and be contained without cutting off the chair or shoes.

Keep the location cue “Lash artistry · Dublin” and concise supporting copy. Primary action: “Find your look” to collection. Booking remains available in the header/menu. Do not introduce three equally weighted hero CTAs or additional unverified claims.

Motion: one short entrance sequence for text and portrait; both become usable immediately. No parallax on the face, no repeated reveal on every navigation, and no load curtain. At most a subtle burgundy curve at the outer margin, with visual clearance around the face and text.

Acceptance: clear brand, service, location, and action within the opening composition; no clipped glyphs; no hero image flash or dramatic layout shift; equal care at 390px, 621px, 1024px, and 1440px.

### 5.3 Collection — help visitors choose

Retain “The lash edit.”, all eight real photographs, and the familiar centered image with visible neighboring work. Modernize the arrangement into a shallow, horizontally sliding gallery with a consistent image frame. Reduce perspective and large dimmed overlaps so users can actually inspect the lashes.

Order initially remains: Wispy hybrid, Volume, Line effect, Wispy lash lift, Classic, Fox eye, Anime volume, Brown set. Preserve the supplied treatment labels. Existing descriptions are editorial descriptions, not confirmed prices, suitability guarantees, or a clinical consultation.

Desktop: compact section heading/introduction, gallery below, and active treatment name with a short useful descriptor. Keep names and controls in predictable positions. Use one discreet current/total indicator and accessible previous/next controls near the caption instead of stacking arrows, dots, progress bars, and multiple instructions.

Phone/tablet: central image about 78–84% of the available gallery width, neighboring images peeking at the edges. The image follows the finger during a drag. Page scrolling remains possible when the gesture is vertical. Keep the current treatment name visible and give a short swipe hint where useful. Do not let adjacent images create document-level horizontal overflow.

Provide a plain “View all 8 finishes” disclosure that expands to a simple named thumbnail grid. This is a navigation aid for comparing real work, not a filter dashboard. Each entry selects its corresponding finish and uses the same shared data. Keep it lightweight and keyboard accessible.

Preserve the existing detail experience: complete photograph, name, brief description, booking link, and a clear return to the collection. A reserved stage or carefully managed layout transition should avoid jumping the whole document. Back restores the selected card, scroll context, and focus. Do not imply that the generic Fresha link preselects a treatment unless that integration is verified.

Recommended default for approval: manual browsing with swipe/drag, arrows, and keyboard. Remove forced idle rotation to let visitors inspect work at their own pace. If automatic rotation is retained by request, ship a visible pause/resume control, pause on hover/focus and interaction, and stop for reduced motion. This preserves user control, consistent with [W3C's carousel guidance](https://www.w3.org/WAI/tutorials/carousels/animations/).

Engineering direction: test `embla-carousel-react`, already installed at the repository's 8.x dependency line, for track/gesture ownership. Do not let GSAP or Motion also transform the carousel track. Keep the existing implementation available until touch, keyboard, focus return, looping, and detail transitions pass the comparison checklist. The prototype decides whether Embla replaces it; adding a library name alone does not make motion smoother.

Acceptance: all eight names map to the correct photograph; images follow horizontal drags; cancelled gestures recover; vertical gestures scroll normally; rapid direction changes do not trigger a 900ms dead period; tapping after a drag does not accidentally open a detail; original full photos are available; selection works with reduced motion and keyboard only.

### 5.4 Artist and recognition — one believable story

Use the standing portrait and retain the statement “Every eye is different. Every set should be, too.” Bring its type size into proportion with the portrait. Identify Paola Gutierrez and “Founder & educator” clearly, then use a short explanation of the individual approach already expressed in the current copy.

Desktop: portrait on one side, statement/name/copy on the other, with intentional top and optical alignment. Keep the quote at a readable width so it does not become five oversized narrow lines. Keep the signoff adjacent to the copy, not at the opposite edge of a large empty region.

At intermediate widths, stack before the text becomes cramped. On phones, use a smaller section heading, portrait, and readable statement/copy. The portrait should have an appropriate maximum height; it should not become an entire extra screen with a small caption far below.

Place recognition immediately below as supporting evidence within this chapter. Use the complete award photo, with its original background, and a concise factual caption: “3rd place · Creative Effects · Master category — Lash Star Elite, Dubai, 2025.” Pair it with a modest certificate thumbnail or text link to the complete certificate. Remove the giant standalone “3rd” treatment and the additional large “A little recognition” headline.

The award image may remain a substantial photograph; compact recognition does not mean cutting the trophy or person to fit a narrow strip. On phones, use its natural aspect ratio, with the certificate action below. Keep accessible full-image links.

Motion: reveal the related copy and image together, gently. Remove word-by-word color filling, independently tilting certificates, and competing scroll drift. Reading and evidence should feel settled.

Acceptance: Paola's name, role, approach, and award are clear without repeated slogans; no face/feet/trophy cropping; name and caption stay aligned; the 621px screenshot problem cannot recur.

### 5.5 Academy — a clear second invitation

Keep “The art. In your hands.” and the walking educator portrait. Present a concise education introduction, techniques currently mentioned by the site, one enquiry action, and a compact credential.

Desktop: a calm two-column composition that reverses the artist section's visual weight where helpful. The portrait should support the information rather than occupy a large empty panel. Phone: copy, enquiry action, portrait, credential in a clear order. A visitor who is not considering training should be able to move through this section quickly.

Use “Enquire about training” as the proposed clear CTA to the existing academy email. Preserve the subject line. Do not create a fake course catalogue, price cards, dates, application form, certification guarantee, or “limited seats” marketing.

Combine the trainer credential with the academy content. Show “International Top Trainer” at subheading scale, with “International Lash School Lotus · June 2025” and a view-certificate action. The complete certificate remains available, readable, and unaltered. Do not turn its accreditation text into a broader claim about every course on offer.

Optional later content, only when the client supplies it: intended student level, course structure, delivery format, included materials, dates, price, and qualification details. Until then, the section is an honest invitation to enquire.

Acceptance: users understand what is being offered and how to ask; certificate is supporting evidence; no second full-height credential poster; no layout gap under the slim portrait.

### 5.6 Visit, preparation, and care — a useful conclusion

Replace the separate studio invitation and giant footer invitation with one open, white visit composition. Retain a short warm line if desired, but lead with practical information. Suggested heading: “Your time at PaoLash.” One main action: “Book your appointment.”

Place location, directions, telephone, email, and appointment preparation close to that action. On desktop, use two comfortably sized columns; on smaller screens, stack at the point where the address and actions stop fitting. Do not preserve the previous narrow left headline column and stacked rounded contact cards.

Move the `visit` target to this section. A direct `/visit/` arrival should show useful location and booking information beneath the header, not the bottom logo or social links.

Retain “Before you arrive” and the current client-approved booking policies. A restrained dialog or inline disclosure is suitable. Keep its content, close control, Escape handling, focus return, and scroll behavior. Policy text is not a design placeholder; do not silently change deposits, cancellation terms, late fees, or patch-test instructions.

Replace the large AFTER/CARE poster with a compact “Caring for your lashes” subsection here. Keep the new Classic close-up as requested, displayed at a modest size alongside concise useful content. Remove the product language and implication of a kit for sale. The current safe copy can direct visitors to Paola for treatment-specific care. Only add practical care instructions after they are confirmed by the client; avoid inventing universal advice for extensions and lash lifts.

Suggested information disclosures, using existing facts: “Before your first appointment”, “Changing your appointment”, and “Finding the studio”. They can expose existing policy content without adding another row of decorative cards. If the dialog remains the chosen interaction, do not duplicate its full text in a second accordion system.

Acceptance: booking, map, phone, and email can be used without searching; long contact strings wrap; each action fits on one natural line where space permits; the section contains no giant ticket, district number, or multiple nested surfaces.

### 5.7 Footer

Use a small instance of the new logo, useful section links, social links, copyright, and a back-to-top action. Keep the surface white. Avoid another headline, another oversized logo reveal, or another repeated address/booking composition.

Show contact information in the visit area and repeat only what is genuinely useful in the footer. Put accessibility and keyboard behavior ahead of eliminating every repeated utility link. The footer should feel like the end of a complete page, not another marketing section.

Acceptance: legible on phones, no truncated email or social label, no decorative border required to signal completion, and back-to-top respects reduced motion.

### 5.8 Social sharing and metadata

Produce a coordinated 1200 × 630 social image after the visual system is approved. Use white, the new client logo, burgundy typography, and an authentic supplied portrait. Keep “Entirely you.” readable at small preview size. Use a simple photographic composition; no new AI imagery or fake interface controls in the social graphic.

The current deterministic generator is `scripts/generate-social-card.mjs`; update its composition and source references rather than introducing a separate design pipeline without need. Use a new descriptive, versioned filename to avoid serving the previous cached preview. Update `lib/social-preview.ts`, relevant metadata, JSON-LD image/logo references, and image alt text together. Verify the exported image route and real HTML meta tags for every entry URL.

Preserve direct section URLs and their useful titles/descriptions. Since they render one shared document, review canonical handling explicitly; do not claim they are five unique full-content pages or change the indexing strategy casually during a visual refresh.

## 6. Photography and asset rules

| Placement | Source/use | Required treatment |
| --- | --- | --- |
| Hero | Seated Paola, holding tweezers | Approved original-texture cutout, chair intact, contained framing |
| Artist | Standing Paola in burgundy suit | Original-texture cutout, complete proportions, no forced tall container |
| Academy | Walking educator portrait | Original-texture cutout, tweezers retained, measured scale |
| Recognition | Paola with trophy | Full original photograph and background, no cutout |
| Collection | Eight supplied lash photographs | Correct names, individually reviewed focal positions, no photo filters |
| Care | New Classic close-up | Modest supporting image; not a product-kit claim |
| Logo | New `rose gold logo.png` | Preserve supplied artwork and transparency |

Keep originals and existing provenance records. `docs/lash-photographs.md` documents the eight sources and lossless exports. `lib/lash-collection.ts` is the single collection data source. Keep responsive variants and intrinsic dimensions; do not load all full-resolution photos at startup. Lazy-load below-fold images, and prioritize only the actual opening image when appropriate to the entry route.

Use CSS framing and object-position for gallery previews. Detail views and evidence links expose complete photographs. Check the low-resolution Line effect source at its actual display size; do not hide softness by generating fake detail. Do not enlarge any source excessively.

The new design does not reopen portrait generation or retouching. If a cutout edge looks poor on white, compare it with the original and record the issue. Any later mask-only correction must preserve original RGB data and be reviewed separately; do not replace the client with an AI recreation to meet a layout deadline.

## 7. Motion system and ownership

Motion should explain entry, selection, and continuity. Static layout must be approved internally before animation is applied. Every scene must still look complete when motion is disabled.

| Interaction | Proposed owner | Behavior |
| --- | --- | --- |
| Hero entrance and limited chapter reveals | GSAP with `@gsap/react` | One short, scoped sequence; clean up on unmount and breakpoint changes |
| Mobile menu, detail presence, optional disclosures | Motion for React (`motion/react`) | Interruptible state transitions; preserve semantic/focus behavior |
| Collection scrolling, dragging, snapping | Embla if the prototype passes | Sole owner of track transforms and input physics |
| Buttons, focus, link underline | CSS | Simple color/opacity or tiny directional movement |
| Background curves | CSS transform animation | Very low-opacity, slow, decorative movement |
| Route/scroll position | One navigation controller | Native scrolling, deliberate focus and history behavior |

GSAP's React integration provides scoped setup and cleanup through `useGSAP`; use it when introducing timelines rather than scattering unmanaged effects through the page. [Official GSAP React guidance](https://gsap.com/resources/React/).

Motion is the current continuation of Framer Motion for React. Use its reduced-motion behavior to adapt or remove movement when the user preference changes. [Official Motion reduced-motion guidance](https://motion.dev/docs/react-use-reduced-motion).

The concrete dependency choice is `gsap` + `@gsap/react` for editorial sequences and `motion` for state transitions, subject to installed-version compatibility and measured bundle cost. Do not install both `motion` and `framer-motion`. If a proposed effect is already cleanly handled by CSS, keep CSS. No paid plugin, scroll-smoothing dependency, or animation library upgrade is required merely to satisfy the visual brief.

### Timing and distance starting points

- Hover/press response: 140–200ms; touch controls must respond immediately.
- Menu/detail presence: approximately 220–320ms, with interrupted input handled gracefully.
- Section reveal: approximately 400–600ms, with 12–20px movement at most.
- Hero sequence: approximately 650–850ms total; controls remain interactive throughout.
- Stagger related elements by about 40–70ms only when it improves hierarchy.
- Prefer controlled ease-out motion. No elastic bounce for large photos, paragraphs, buttons, or certificates.
- Reveal a heading as one readable unit. Avoid word-by-word recoloring and prolonged typing/scrambling.
- Natural scroll remains under the user's control. No scroll interception, long pinned chapters, forced horizontal wheel behavior, or custom cursor.

### Background waves

Keep the user's requested moving curve motif across the site, but redraw its appearance in burgundy. Start with one or two thin curves positioned near the outer margins at approximately 3–6% effective opacity. Check the composited result on white; do not multiply several faint layers into an obvious pink pattern.

Animate a small translation/rotation using a slow 28–40 second cycle. Avoid path morphing, metallic gradient sheen, blur filters, or an ornament per section. Keep them behind content, `aria-hidden`, and unable to intercept input. Do not cross the important parts of the portrait or reduce text legibility.

Stop decorative animation for reduced motion and while the document is hidden. Provide a discreet site-wide motion toggle in the footer if continuous decoration remains; it should pause ambient movement and persist the visitor's choice without adding a floating overlay. If this control feels disproportionate, prefer a short finite movement that settles instead of indefinite animation.

### Implementation discipline

Only one system owns a given element's transform. If a reveal wrapper and an interactive child both animate, their ownership must be explicit and visually justified. Do not leave `useEditorialMotion` writing the same variables/transforms after a section migrates to GSAP or Motion.

Use React lifecycle cleanup, preference/breakpoint listeners, and proper disposal of observers/timers. Scope animation to relevant components. Avoid React state updates on every pointermove or scroll tick. Keep content visible and links usable if animation initialization fails; the page must not wait behind opacity zero.

## 8. Responsive and accessible experience

Treat the recurring tablet issue as a content-fit problem, not another isolated media-query patch. Use one-column layouts whenever a portrait and readable copy cannot share the available width. A 621px screen should never inherit a cramped desktop artist or visit grid.

Required review widths: 320, 390, 430, 621, 768, 1024, 1440, and 1920px. Also inspect a short laptop height, a phone in landscape, 200% zoom, and enlarged browser text. Capture at least the hero, collection, artist, academy, and visit at phone/tablet/desktop sizes.

- No document-level horizontal scroll, clipped type, overlapping captions, or obstructed buttons.
- Use comfortable touch targets, aiming for at least 44 × 44 CSS px for primary controls.
- Maintain visible keyboard focus. Distinguish selected state by more than a faint color change.
- Verify text/control contrast in their actual states, including disabled/hover/focus, against the intended surface.
- Keep one coherent heading hierarchy and meaningful image descriptions. Decorative waves and arrows are hidden from assistive technology.
- Menus/dialogs preserve focus containment, Escape, explicit close, body-scroll restoration, and trigger-focus return.
- After carousel/detail transitions, focus goes somewhere predictable without an unexpected scroll jump.
- Reduced motion removes ambient drifting, parallax, and large transitions. Layout and all actions remain available.
- Header offsets use measured/shared dimensions with `scroll-margin` or an equivalent controlled approach.
- Long contact information wraps naturally; meaningful copy does not become smaller than comfortable body text merely to fit.

## 9. Routing, state, and technical migration

Keep the existing Next.js App Router and static export. Preserve all five clean routes. Avoid another full move between a long page and separate unrelated pages.

Before changing navigation, prototype a persistent shared experience or explicit state restoration appropriate to the installed Next.js version. Read the bundled Next documentation required by `AGENTS.md` before writing code. Choose the smallest implementation that preserves clean entry URLs, browser history, and one connected page.

Replace the fixed 120ms initial scroll timer with section positioning driven by actual mount/layout readiness. Reserve image dimensions so the destination does not move after positioning. Set the header offset once through a shared layout rule. Navigation should not replay the entire hero animation, lose collection selection, or leave scroll restoration permanently changed after cleanup.

Required route scenarios: direct URL load, reload, in-page nav, logo/home, back-to-top, Back/Forward, menu navigation, and browser resizing after entry. `/visit/` must target the useful visit content. Do not add `#` fragments to ordinary navigation URLs. Accessibility skip links may still target an element ID; that is not a return to hash-based site routing.

### Proposed component boundaries

Keep `PaoLashExperience` as a thin composition layer. Extract sections incrementally into small, explicit components under a consistent directory such as `components/site/`: header/navigation, hero, artist/proof, academy, visit/care, footer, ambient background, and shared actions. Keep the collection component and data source recognisable during migration.

Put business/contact/navigation data into one typed source, for example `lib/site-content.ts`. Put visual tokens and global resets in a focused stylesheet. Put section layout and responsive styles beside their components or in clearly organized component styles. Do not introduce a complicated theme engine for one site.

| File or area | Planned work |
| --- | --- |
| `app/globals.css` | Semantic tokens, reset, shell/type foundations; remove superseded section overrides as each section migrates |
| `components/paolash-experience.tsx` | Split section responsibilities, remove duplicate endings, integrate new logo and correct visit target |
| `components/lash-finder.tsx` + module CSS | Gesture prototype, gallery refinement, view-all disclosure, reliable details/focus |
| `lib/lash-collection.ts` | Retain all eight mappings; centralize any added display metadata |
| `hooks/use-editorial-motion.ts` | Retire old scene responsibilities as replacements land; remove only when no consumers remain |
| `app/layout.tsx`, `app/[section]/page.tsx`, shared navigation | Route behavior, metadata consistency, new brand logo references |
| `scripts/generate-social-card.mjs`, `lib/social-preview.ts` | Coordinated white/burgundy social card and cache-safe asset reference |
| `assets/brand/`, `public/assets/brand/` | Preserve and serve the new logo |
| `docs/MOTION_PLAN.md` | Replace obsolete theme/section instructions with the implemented motion ownership |
| `scripts/check-production.mjs`, release documentation | Preserve production AR exclusions and validate them after structural changes |

This is a design migration, not an opportunity to delete all unused-looking dependencies or rewrite unrelated integrations. Preserve Firebase analytics behavior and other existing infrastructure unless a concrete defect requires a scoped change.

## 10. Performance and visual stability

Record a baseline before adding animation libraries: transfer size, route JavaScript, font/image loading, layout shifts, and a repeatable mobile lab run. Assess the redesign against that baseline under the same conditions. Treat Core Web Vitals goals as measurements to pursue, not a claim that the finished site already meets them.

Optimize the obvious workload first: responsive photograph delivery, constrained image dimensions, below-fold lazy loading, suitable opening-image priority, and a single font family. Avoid fetching every large source just because it belongs to a carousel. Preserve lossless source assets and choose display variants deliberately.

No continuous React render loop for decoration. Animate transform/opacity where possible, keep large filters and persistent `will-change` usage limited, pause hidden-page work, and load interaction modules only where useful. Compare the actual GSAP/Motion bundle cost against the benefit; keep imports scoped and remove replaced animation code.

Record remaining issues honestly. An emulator passing screenshots is not proof of smoothness on every real device; include touch checks in Safari/iOS and Chrome/Android when available, and state coverage when they are unavailable.

## 11. Business data and content guardrails

Use these established values consistently in the page, mobile menu, directions links, mailto links, policy text, and structured data:

| Field | Current approved value |
| --- | --- |
| Brand | PaoLash Lounge & Academy |
| Artist | Paola Gutierrez — Founder & educator |
| Address | 6 St Andrew’s St, 3rd Floor, Co. Dublin, D02 VW40 |
| Telephone | 083 811 9207 / `tel:+353838119207` |
| Email | `paolashacademy@gmail.com` |
| Booking | `https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624` |
| Directions | `https://www.google.com/maps/search/?api=1&query=6+St+Andrew%27s+St+3rd+Floor+Co.+Dublin+D02+VW40` |
| Instagram | `https://www.instagram.com/paolash_lounge` |
| TikTok | `https://www.tiktok.com/@paolash_0` |
| WhatsApp | `https://wa.me/353838119207` |

Do not reinstate 65 William St S, D02 AW81, or support@paolash.com from older screenshots or archive content. Do not substitute the sender's personal number from a reference screenshot for the published business contact.

Information requiring client confirmation before adding: opening hours, physical accessibility of the third-floor studio, course dates/prices/curriculum, detailed treatment-specific aftercare, testimonials, and updated policy terms. These gaps do not prevent the layout migration. Omit unconfirmed items or use an honest contact action; do not publish placeholder facts.

## 12. Execution sequence for Sol

### Phase 0 — establish a recoverable baseline

Read this plan, repository instructions, `docs/production-release.md`, and asset provenance. Check branch, status, current commit, and remote before any write. Existing user changes belong to the user and must be preserved.

Start implementation from production `main`, not `feat/premium-lash-try-on`. Create a focused design branch such as `feat/white-burgundy-redesign` only when implementation is authorized. Record the baseline SHA and retain before screenshots. Do not reset the worktree or merge the whole AR branch.

Import and record the new logo source. Inventory current route/booking/menu/dialog/gallery behavior. Run baseline lint/build and capture representative layouts. Confirm that the local preview being inspected is the production checkout, not the older deployment or AR preview.

Deliverable: reproducible baseline, asset map, known constraints, and before screenshots. No visual regressions introduced in this phase.

### Phase 1 — foundation and representative compositions

Build the new tokens, typography, shell, spacing, actions, header/menu, and hero. Establish the visual rules with actual client artwork and photography. Build phone, 621px/tablet, and desktop versions together. Then prototype one artist or visit layout to prove the system also handles longer text and practical content.

Deliverable: a coherent static design direction visible in the browser. Review side by side with the baseline for identity, portrait scale, alignment, and white/burgundy balance. Resolve the palette and proportions before expanding to all sections; this is an internal quality gate, not a requirement to interrupt the user for every styling choice.

### Phase 2 — collection interaction prototype

Refine the gallery with the eight current photographs. Test Embla against the current gesture implementation in isolation from other layout changes. Implement reliable drag/scroll intent, keyboard controls, detail/return flow, and the compact view-all mechanism. Apply the plan's manual-first default once this plan is approved, unless the user explicitly retains autoplay.

Deliverable: a complete, usable collection with correct media and no navigation regression. Do not proceed with a visually attractive carousel that cannot be dragged reliably or loses keyboard focus.

### Phase 3 — migrate the remaining content

Implement artist plus recognition, academy plus credential, and visit plus care. Reduce the footer. Preserve all client media, facts, policies, and external destinations. Move the visit route target. Review the whole scroll sequence for duplicated headlines, excessive whitespace, and abrupt changes of scale.

Deliverable: the complete static site, with every section purposeful and all routes functional, before decorative animation is layered in.

### Phase 4 — introduce the motion system

Add the scoped GSAP entrances and Motion state transitions only where specified. Implement subdued burgundy curves and motion preferences. Remove the old effects from migrated elements. Test interruption, reduced motion, tab visibility, repeated navigation, and resizing. Ensure basic content never depends on animation completing.

Deliverable: a smooth full experience that remains equally understandable as a still page. Remove any effect that makes text harder to read, delays control response, or fails on narrow screens.

### Phase 5 — metadata, accessibility, and performance

Create the new social image, update logo/preview references, and verify rendered metadata. Run the responsive/interaction matrix and compare the recorded performance baseline. Validate production exclusions, links, image requests, and console output. Reconcile old design/motion documentation so the next editor has one current source of truth.

Deliverable: reviewable local preview, screenshot set, test notes, and a list of any real remaining limitations. Fix material defects before calling the redesign complete.

### Phase 6 — review, GitHub, and release

Commit cohesive changes and provide a readable review diff, before/after proof, and verification summary. Push the approved implementation branch according to the user's GitHub instruction. A push does not itself mean the site is deployed. Keep the current production baseline recoverable.

Present the completed preview for the user's design review. Make authorized refinements. Merge/release only within the user's explicit authority. Deploy from the production checkout only after deployment is authorized; follow the existing release document and confirm the real deployed URL afterward. Do not deploy from the AR checkout or infer deployment approval from plan approval.

## 13. Definition of done

The migration is complete only when all of the following are demonstrated:

- The overall site reads as white and burgundy. The new logo is the sole intentional rose-gold brand artwork; no rose-metal buttons, peach headline emphasis, or champagne wave gradients remain.
- The new logo is legible, proportionate, and consistently used. Metadata logo/preview references are correct.
- Hero, collection, artist/proof, academy, visit/care, and footer share one spacing/type/action system while retaining varied, considered compositions.
- Every main section answers a distinct visitor question. Repeated oversized certificates, recognition numbering, care poster, and closing CTA have been consolidated as planned.
- All eight new lash photos are present and correctly named. Four Paola photos retain their intended roles. Original photographic texture and award-photo background are preserved.
- Swipe, mouse drag, arrows, keyboard, detail entry/return, and view-all selection work; vertical page scrolling is never trapped.
- `/`, `/collection/`, `/artist/`, `/academy/`, and `/visit/` work on direct load, refresh, in-page navigation, and Back/Forward without ordinary hash navigation.
- The menu and policy interaction remain accessible and usable; reduced-motion preference and ambient motion controls work.
- All required viewport checks pass with no overflow, clipped text, oversized empty areas, narrow stacked-word columns, or obstructed actions.
- Current address/email/phone/booking/social values are consistent. Unverified business facts have not been added.
- `npm run lint` and `npm run build` pass in the production checkout, including its prebuild/postbuild AR guards.
- No new broken images, runtime errors, interaction dead periods, or material unexplained performance regressions appear in the tested flows.
- The final preview and review evidence exist before any deployment approval is requested.

## 14. Ready-to-use implementation handoff

After this plan has been approved, the next implementation request can be:

> Implement `docs/site-migration-plan.md` in `/Users/adhivishnu/Documents/polash/paolash-production`. Read the full plan and current repository instructions first. Start from the verified production baseline, preserve any newer user work, and work on a focused design branch. Use white and `#7D1F2D` for the website UI, with the new `/Users/adhivishnu/Documents/polash/rose gold logo.png` kept in its original red/rose-gold finish. Preserve original client photography, all eight lash finishes, correct contact information, clean routes, and production AR exclusions. Complete the planned sections, interactions, responsive QA, and reviewable preview. Follow the staged quality gates without repeatedly asking about routine implementation choices. Report actual verification and limitations. Do not deploy until I authorize deployment.

This file supersedes earlier aesthetic instructions about dark burgundy backgrounds, champagne UI, rose-gold buttons, four-finish collections, giant recognition numerals, and the ticket-style studio section. It does not supersede current business facts, source-photo constraints, production safeguards, or a later direct instruction from the user.
