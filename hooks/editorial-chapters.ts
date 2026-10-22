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
    const reveal = (trigger: string, selector: string, distance = 38) => {
      const nodes = q(selector);
      if (!nodes.length || !root.querySelector(trigger)) return;
      scene(trigger).fromTo(nodes, { y: distance * amount, opacity: .55 }, { y: 0, opacity: 1, stagger: .08 });
    };

    // CSS owns entrance once; only the parent invitation/independent translate
    // follows scroll. Loading this module can never restart or hide the headline.
    if (root.querySelector(".hero")) {
      scene(".hero-intro", "top 80px", "bottom 40px")
        .fromTo(q(".hero-intro"), { y: 0, opacity: 1 }, { y: -36 * amount, opacity: .25 });
      scene(".hero-portrait", "top bottom", "bottom top")
        .fromTo(q(".hero-portrait"), { "--portrait-depth": "18px" }, { "--portrait-depth": `${-25 * amount}px` });
    }

    reveal("#services", "[data-motion='collection-label'], [data-motion='collection-intro']", 28);
    if (root.querySelector("[data-motion='collection-deck']")) {
      // Never scale or translate the carousel's layout/measurement root.
      // Its continuous depth belongs exclusively to the gesture engine.
      scene("#services", "top 96%", "top 48%")
        .fromTo(q("[data-motion='collection-deck']"), { opacity: .65 }, { opacity: 1 });
    }

    if (root.querySelector(".artist")) {
      reveal(".artist-top", ".artist-top > *", 22);
      scene(".artist-layout", "top 94%", "top 40%")
        .fromTo(q(".artist-visual"), { x: -32 * amount, y: 24 * amount, opacity: .6 }, { x: 0, y: 0, opacity: 1 }, 0)
        .fromTo(q(".artist-copy"), { y: 28 * amount, opacity: .65 }, { y: 0, opacity: 1 }, .08);
      scene(".artist-statement", "top 88%", "bottom 55%")
        .fromTo(q("[data-word]"), { "--word-fill": "0%" }, { "--word-fill": "100%", stagger: .12 });
    }

    if (root.querySelector(".recognition")) {
      reveal(".recognition-copy", ".recognition-copy > *", 32);
      scene(".recognition-gallery", "top 95%", "top 40%")
        .fromTo(q(".proof-trophy"), { y: 50 * amount, rotation: -1.5 * amount, opacity: .65 }, { y: 0, rotation: 0, opacity: 1 }, 0)
        .fromTo(q(".proof-certificate"), { y: 34 * amount, rotation: 1.5 * amount, opacity: .65 }, { y: 0, rotation: 0, opacity: 1 }, .08);
    }

    // Preserve the aftercare poster's opposing typography and independent rise.
    if (root.querySelector(".ritual")) scene(".ritual", "top 85%", "top -10%")
      .fromTo(q(".ritual"), { "--ritual-drift": `${110 * amount}px`, "--ritual-rise": `${90 * amount}px`, "--ritual-turn": `${-8 * amount}deg` },
        { "--ritual-drift": "0px", "--ritual-rise": "0px", "--ritual-turn": "0deg" });

    if (root.querySelector(".academy")) {
      reveal(".academy-copy", ".academy-copy > *", 38);
      scene(".academy-layout", "top 95%", "top 38%")
        .fromTo(q(".academy-portrait"), { x: 22 * amount, y: 48 * amount, opacity: .6 }, { x: 0, y: 0, opacity: 1 });
      reveal(".trainer-credential-copy", ".trainer-credential-copy > *", 28);
      reveal(".trainer-certificate", ".trainer-certificate", 40);
    }

    reveal(".studio-visit-intro", ".studio-visit-intro > *", 32);
    reveal(".studio-visit-actions", ".studio-visit-actions > *", 20);
    reveal(".studio-visit-details", ".studio-detail", 26);
    reveal(".closing", ".closing > .eyebrow", 20);
    if (root.querySelector(".closing h2")) scene(".closing h2", "top 95%", "top 38%")
      .fromTo(q(".closing h2 > span"), { x: -36 * amount, y: 22 * amount }, { x: 0, y: 0 }, 0)
      .fromTo(q(".closing h2 > em"), { x: 36 * amount, y: 32 * amount }, { x: 0, y: 0 }, 0);
    reveal(".closing > .button", ".closing > .button", 22);
    reveal(".closing-brand", ".closing-brand", 36);
    reveal(".footer-details", ".footer-details > *", 20);

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
