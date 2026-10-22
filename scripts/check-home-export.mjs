import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const html = await readFile("out/index.html", "utf8");
assert.doesNotMatch(html, /<a[^>]+href="\/assets\/(?:award|trainer-certificate)\.webp"/);
assert.doesNotMatch(html, /View certificate|Meet Paola|View the full collection|Continue exploring/);
assert.doesNotMatch(html, /ritual-note-line/);
assert.doesNotMatch(html, /\/collection\/(?:volume|classic|wispy-hybrid)\//);
assert.match(html, /id="visit" class="studio-notes shell"/);
assert.match(html, /paolash-logo-display\.webp/);
assert.match(html, /<source[^>]+srcSet="[^"]*paola-seated-display-480\.webp/);
for (const target of ["services", "story", "academy", "visit"]) assert.match(html, new RegExp(`href="#${target}"`));
assert.match(html, /class="trainer-certificate"><img/);
const original = await stat("public/assets/brand/paolash-logo.png");
const display = await stat("public/assets/brand/paolash-logo-display.webp");
assert.ok(display.size < original.size * .1, "Logo display image should be at least 90% smaller");
const choreography = await readFile("hooks/editorial-chapters.ts", "utf8");
assert.doesNotMatch(choreography, /once:\s*true|yPercent:\s*105/);
assert.match(choreography, /scrub:\s*\.35/);
// Editorial chapters stay opaque: movement, not a fade, carries the reveal.
assert.doesNotMatch(choreography.slice(choreography.indexOf('if (root.querySelector(".artist"))')), /opacity:/);
assert.match(choreography, /scene\(selector, "top 96%", "top 24%"\)/);
for (const exhibit of ["proof-trophy", "proof-certificate", "trainer-certificate"]) {
  assert.match(choreography, new RegExp(`exhibit\\("\\.${exhibit}",`));
}
const finder = await readFile("components/lash-finder.tsx", "utf8");
assert.match(finder, /WheelGesturesPlugin/);
assert.match(finder, /skipSnaps:\s*true/);
console.log("PASS: original one-page composition, section navbar, plain certificates, no new-page UI, responsive photos and >90% smaller logo.");
