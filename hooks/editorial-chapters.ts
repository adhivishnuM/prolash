import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Every chapter follows scroll in both directions. No pinned sections,
 * scroll interception, artificial heights, or competing hero entrance timeline. */
export function startEditorialChapters(root: HTMLDivElement) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({ desktop: "(min-width: 701px)", mobile: "(max-width: 700px)", reduce: "(prefers-reduced-motion: reduce)" }, context => {
    if (context.conditions?.reduce) return;
    const amount = context.conditions?.desktop ? 1 : .6;
    const originalStyles = new Map<HTMLElement, string | null>();
    const q = (selector: string) => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
      nodes.forEach(node => { if (!originalStyles.has(node)) originalStyles.set(node, node.getAttribute("style")); });
      return nodes;
    };
    root.classList.add("motion-enabled", "motion-chapters");
    const scene = (selector: string, start = "top 94%", end = "top 48%") => {
      const trigger = root.querySelector(selector);
      return gsap.timeline({ defaults: { ease: "none" }, ...(trigger ? { scrollTrigger: { trigger, start, end, scrub: .35, invalidateOnRefresh: true } } : {}) });
    };
    const rise = (trigger: string, selector: string, distance = 38) => {
      const nodes = q(selector);
      if (!nodes.length || !root.querySelector(trigger)) return;
      scene(trigger).fromTo(nodes, { y: distance * amount }, { y: 0, stagger: .08 });
    };
    const exhibit = (selector: string, x: number, y: number, rotation: number) => {
      if (!root.querySelector(selector)) return;
      // Each exhibit owns its viewport timing. On a stacked phone layout, the
      // certificate must still be moving when it arrives after the trophy.
      scene(selector, "top 96%", "top 24%")
        .fromTo(q(selector), { x: x * amount, y: y * amount, rotation: rotation * amount },
          { x: 0, y: 0, rotation: 0 });
    };

    // CSS owns entrance once; only the parent invitation/independent translate
    // follows scroll. Loading this module can never restart or hide the headline.
    if (root.querySelector(".hero")) {
      scene(".hero-intro", "top 80px", "bottom 40px")
        .fromTo(q(".hero-intro"), { y: 0, opacity: 1 }, { y: -36 * amount, opacity: .25 });
      scene(".hero-portrait", "top bottom", "bottom top")
        .fromTo(q(".hero-portrait"), { "--portrait-depth": "18px" }, { "--portrait-depth": `${-25 * amount}px` });
    }

    rise("#services", "[data-motion='collection-label'], [data-motion='collection-intro']", 28);
    if (root.querySelector("[data-motion='collection-zoom']")) {
      // Restore the original .88 → 1 deck opening from ce49605. The static
      // scene measures scroll; only the visual wrapper lifts and zooms.
      // Embla retains its own positioned viewport and unscaled layout sizes.
      scene("[data-motion='collection-deck']", "top 95%", "top 32%")
        .fromTo(q("[data-motion='collection-zoom']"), { y: 110 * amount, scale: 1 - .12 * amount }, { y: 0, scale: 1 });
    }

    if (root.querySelector(".artist")) {
      rise(".artist-top", ".artist-top > *", 22);
      scene(".artist-layout", "top 94%", "top 40%")
        .fromTo(q(".artist-visual"), { x: -32 * amount, y: 24 * amount }, { x: 0, y: 0 }, 0)
        .fromTo(q(".artist-copy"), { y: 28 * amount }, { y: 0 }, .08);
      scene(".artist-statement", "top 88%", "bottom 55%")
        .fromTo(q("[data-word]"), { "--word-fill": "0%" }, { "--word-fill": "100%", stagger: .12 });
    }

    if (root.querySelector(".recognition")) {
      rise(".recognition-copy", ".recognition-copy > p", 24);
      // A quiet counter-movement between the title, its accent and the award.
      // Unlike a fade, every word and both original images stay fully visible.
      scene(".recognition-copy", "top 94%", "top 32%")
        .fromTo(q(".recognition .display"), { x: -24 * amount, y: 28 * amount }, { x: 0, y: 0 }, 0)
        .fromTo(q(".recognition .display em"), { x: 44 * amount }, { x: 0 }, 0)
        .fromTo(q(".award-number"), { y: 60 * amount }, { y: 0 }, 0);
      exhibit(".proof-trophy", -18, 72, -1.6);
      exhibit(".proof-certificate", 22, 86, 1.8);
    }

    // Preserve the aftercare poster's opposing typography and independent rise.
    if (root.querySelector(".ritual")) scene(".ritual", "top 85%", "top -10%")
      .fromTo(q(".ritual"), { "--ritual-drift": `${110 * amount}px`, "--ritual-rise": `${90 * amount}px`, "--ritual-turn": `${-8 * amount}deg` },
        { "--ritual-drift": "0px", "--ritual-rise": "0px", "--ritual-turn": "0deg" });

    if (root.querySelector(".academy")) {
      rise(".academy-copy", ".academy-copy > *", 38);
      scene(".academy-copy", "top 94%", "top 34%")
        .fromTo(q(".academy-copy h2 em"), { x: 30 * amount }, { x: 0 });
      scene(".academy-portrait", "top 96%", "top 28%")
        .fromTo(q(".academy-portrait"), { x: 16 * amount, y: 64 * amount }, { x: 0, y: 0 });
      rise(".trainer-credential-copy", ".trainer-credential-copy > p", 24);
      scene(".trainer-credential-copy", "top 94%", "top 34%")
        .fromTo(q(".trainer-credential-copy h3"), { x: -18 * amount, y: 32 * amount }, { x: 0, y: 0 }, 0)
        .fromTo(q(".trainer-credential-copy h3 em"), { x: 36 * amount }, { x: 0 }, 0);
      exhibit(".trainer-certificate", 20, 74, 1.4);
    }

    rise(".studio-visit-intro", ".studio-visit-intro > *", 32);
    if (root.querySelector(".studio-visit-intro")) scene(".studio-visit-intro", "top 94%", "top 34%")
      .fromTo(q(".studio-visit-intro h2 em"), { x: 28 * amount }, { x: 0 });
    rise(".studio-visit-actions", ".studio-visit-actions > *", 20);
    if (root.querySelector(".studio-visit-details")) scene(".studio-visit-details", "top 94%", "top 40%")
      .fromTo(q(".studio-detail"), { x: 22 * amount, y: 30 * amount }, { x: 0, y: 0, stagger: .1 });
    rise(".closing", ".closing > .eyebrow", 20);
    if (root.querySelector(".closing h2")) scene(".closing h2", "top 95%", "top 38%")
      .fromTo(q(".closing h2 > span"), { x: -36 * amount, y: 22 * amount }, { x: 0, y: 0 }, 0)
      .fromTo(q(".closing h2 > em"), { x: 36 * amount, y: 32 * amount }, { x: 0, y: 0 }, 0);
    rise(".closing > .button", ".closing > .button", 22);
    rise(".closing-brand", ".closing-brand", 36);
    rise(".footer-details", ".footer-details > *", 20);

    return () => {
      root.classList.remove("motion-enabled", "motion-chapters");
      originalStyles.forEach((style, node) => { if (style === null) node.removeAttribute("style"); else node.setAttribute("style", style); });
    };
  }, root);

  let timer: ReturnType<typeof setTimeout>;
  let disposed = false;
  let lastScroll = 0;
  const noteScroll = () => { lastScroll = Date.now(); };
  addEventListener("scroll", noteScroll, { passive: true });
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (disposed) return;
      if (Date.now() - lastScroll < 180) refresh();
      else ScrollTrigger.refresh();
    }, 200);
  };
  const resize = new ResizeObserver(refresh);
  resize.observe(root);
  root.addEventListener("load", refresh, true);
  void document.fonts.ready.then(() => { if (!disposed) refresh(); });
  return () => {
    disposed = true;
    clearTimeout(timer);
    resize.disconnect();
    root.removeEventListener("load", refresh, true);
    removeEventListener("scroll", noteScroll);
    media.revert();
  };
}
