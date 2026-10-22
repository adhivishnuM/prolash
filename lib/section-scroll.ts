const targets: Record<string, string> = {
  services: "#services [data-section-start]",
  story: "#story .artist-top",
  academy: "#academy .academy-copy",
  visit: "#visit",
};

/** A logo click returns to the canonical homepage without reloading the same
 * one-page experience or interrupting its native smooth scroll. */
export function resetHomeUrl() {
  const { pathname, search, hash } = window.location;
  if (pathname !== "/" || search || hash) window.history.replaceState(window.history.state, "", "/");
}

/** Targets are static anchors outside reveal/GSAP transforms. Viewport bounds
 * also handle fractional zoom and nested layout offsets. Native scrolling remains
 * interruptible by touch, wheel and keyboard; there is no scroll hijacking. */
export function scrollToHomeSection(id: string) {
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
  if (id === "top") { window.scrollTo({ top: 0, behavior }); return; }
  const selector = targets[id];
  if (!selector) return;
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  let top = target.getBoundingClientRect().top + window.scrollY;
  if (id === "visit") top += Number.parseFloat(getComputedStyle(target).paddingTop) || 0;
  const header = document.querySelector<HTMLElement>(".site-header");
  const headerTop = header ? Number.parseFloat(getComputedStyle(header).top) || 0 : 0;
  // The header contracts to 64px on scroll (60px on narrow phones).
  const headerHeight = header ? Math.min(header.offsetHeight, 64) : 0;
  const gap = innerWidth <= 700 ? 20 : 24;
  window.scrollTo({ top: Math.max(0, top - headerTop - headerHeight - gap), behavior });
}
