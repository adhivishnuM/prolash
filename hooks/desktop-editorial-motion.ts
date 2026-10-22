import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Chapter-specific choreography. Native scrolling controls the timelines;
 * no scroll interception, artificial document height, or pinned content. */
export function startDesktopMotion(root: HTMLDivElement) {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add({ desktop: "(min-width: 701px)", mobile: "(max-width: 700px)", reduce: "(prefers-reduced-motion: reduce)" }, context => {
      if (context.conditions?.reduce || !context.conditions?.desktop) return;
      const amount = context.conditions?.desktop ? 1 : .65;
      const originalStyles = new Map<HTMLElement, string | null>();
      const q = (selector: string) => {
        const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
        targets.forEach(element => {
          if (!originalStyles.has(element)) originalStyles.set(element, element.getAttribute("style"));
        });
        return targets;
      };
      root.classList.add("motion-enabled", "motion-chapters");
      const entrance = (trigger: string, selector: string, distance = 48) => {
        const targets = q(selector);
        if (!targets.length) return;
        gsap.set(targets, { y: distance * amount, opacity: 0 });
        return gsap.to(targets, {
          y: 0, opacity: 1, duration: 1.15, stagger: .14, ease: "power3.out",
          scrollTrigger: { trigger: q(trigger)[0], start: "top 90%", once: true },
          clearProps: "transform,opacity",
        });
      };
      const scene = (trigger: string, start = "top 90%", end = "top 30%") =>
        gsap.timeline({ defaults: { ease: "none" }, ...(root.querySelector(trigger) ? { scrollTrigger: {
          trigger: q(trigger)[0], start, end, scrub: .7, invalidateOnRefresh: true,
        } } : {}) });

      if (root.querySelector(".hero")) {
      // Hero: masked headline, staggered invitation, and portrait at a second depth.
      gsap.set(q(".hero-line > *"), { yPercent: 105, opacity: 0 });
      gsap.set(q(".hero-description, .hero-intro .button"), { y: 32, opacity: 0 });
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(q(".hero-location"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, 0)
        .to(q(".hero-line > *"), { yPercent: 0, opacity: 1, stagger: .13, duration: 1.25 }, .12)
        .to(q(".hero-description, .hero-intro .button"), { y: 0, opacity: 1, duration: .9, stagger: .12 }, .4)
        .fromTo(q(".hero-portrait"), { y: 75 * amount, opacity: 0, scale: .94 }, { y: 0, opacity: 1, scale: 1, duration: 1.5 }, .2);
      scene(".hero", "top top", "bottom top")
        .to(q(".hero-intro"), { y: -75 * amount }, 0)
        .to(q(".hero-portrait"), { "--portrait-depth": `${75 * amount}px` }, 0);

      }

      // Collection: open the complete deck; card transforms belong to gestures.
      entrance("#services", "[data-motion='collection-label'], [data-motion='collection-intro']");
      if (q("[data-motion='collection-deck']").length) {
        scene("[data-motion='collection-deck']", "top 95%", "top 32%")
          .fromTo(q("[data-motion='collection-deck']"), { y: 110 * amount, scale: .88 }, { y: 0, scale: 1 });
      }

      if (root.querySelector(".artist")) {
      // Artist: portrait enters from the edge, followed by the reading sequence.
      entrance(".artist-top", ".artist-top > *", 28);
      gsap.fromTo(q(".artist-visual"), { x: -75 * amount, opacity: 0, clipPath: "inset(0 0 16% 0)" }, {
        x: 0, opacity: 1, clipPath: "inset(-12% -12% -12% -12%)", duration: 1.35, ease: "power3.out",
        scrollTrigger: { trigger: q(".artist-visual")[0], start: "top 88%", once: true },
      });
      gsap.set(q("[data-word]"), { "--word-fill": "0%" });
      scene(".artist-statement", "top 82%", "bottom 48%")
        .to(q("[data-word]"), { "--word-fill": "100%", duration: 1, stagger: .22 });
      entrance(".artist-copy > p", ".artist-copy > p, .artist-signoff", 38);
      scene(".artist-visual", "top bottom", "bottom top").fromTo(q(".artist-visual"), { "--portrait-depth": `${35 * amount}px` }, { "--portrait-depth": `${-30 * amount}px` });

      }

      if (root.querySelector(".recognition")) {
      // Recognition: independent exhibits settle into place, full photos intact.
      entrance(".recognition-copy", ".recognition-copy > *", 55);
      gsap.set(q(".proof"), { y: 110 * amount, rotation: index => index ? 3 : -2, scale: .93, opacity: 0 });
      gsap.to(q(".proof"), {
        y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.4, stagger: .22, ease: "power3.out",
        scrollTrigger: { trigger: q(".recognition-gallery")[0], start: "top 87%", once: true },
      });

      }

      if (root.querySelector(".ritual")) {
      // Restore the original poster motion from 1d56bea: opposing type with
      // an independently rising, rotating product, controlled by native scroll.
      scene(".ritual", "top 85%", "top -10%")
        .fromTo(q(".ritual"), {
          "--ritual-drift": "110px", "--ritual-rise": "90px", "--ritual-turn": "-8deg",
        }, {
          "--ritual-drift": "0px", "--ritual-rise": "0px", "--ritual-turn": "0deg",
        });

      }

      if (root.querySelector(".academy")) {
      // Academy: copy, educator and credentials are three distinct beats.
      entrance(".academy-copy", ".academy-copy > *", 60);
      gsap.fromTo(q(".academy-portrait"), { y: 95 * amount, x: 40 * amount, opacity: 0 }, {
        y: 0, x: 0, opacity: 1, duration: 1.4, ease: "power3.out",
        scrollTrigger: { trigger: q(".academy-portrait")[0], start: "top 90%", once: true },
      });
      scene(".academy-portrait", "top bottom", "bottom top").fromTo(q(".academy-portrait"), { "--portrait-depth": `${35 * amount}px` }, { "--portrait-depth": `${-30 * amount}px` });
      entrance(".trainer-credential-copy", ".trainer-credential-copy > *", 40);
      entrance(".trainer-certificate", ".trainer-certificate", 75);

      }

      // Visit and closing: clear practical details, then the final brand reveal.
      entrance(".studio-visit-intro", ".studio-visit-intro > *", 50);
      entrance(".studio-visit-actions", ".studio-visit-actions > *", 30);
      entrance(".studio-visit-details", ".studio-detail", 45);
      entrance(".closing", ".closing > .eyebrow", 28);
      if (root.querySelector(".closing h2")) scene(".closing h2", "top 95%", "top 40%")
        .fromTo(q(".closing h2 > span"), { x: -90 * amount, y: 35 * amount }, { x: 0, y: 0 }, 0)
        .fromTo(q(".closing h2 > em"), { x: 90 * amount, y: 55 * amount }, { x: 0, y: 0 }, 0);
      entrance(".closing > .button", ".closing > .button", 35);
      entrance(".closing-brand", ".closing-brand", 75);
      entrance(".footer-details", ".footer-details > *", 35);

      return () => {
        root.classList.remove("motion-enabled", "motion-chapters");
        // Completed, once-only triggers may already have released their
        // timelines. Restore exact pre-animation styles on breakpoint changes
        // and live reduced-motion toggles, including not-yet-entered content.
        originalStyles.forEach((style, element) => {
          if (style === null) element.removeAttribute("style");
          else element.setAttribute("style", style);
        });
      };
    }, root);

    // Re-measure when images, fonts or collection details change page height.
    let refreshTimer: ReturnType<typeof setTimeout>;
    let disposed = false;
    let lastScroll = 0;
    const noteScroll = () => { lastScroll = Date.now(); };
    addEventListener("scroll", noteScroll, { passive: true });
    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (disposed) return;
        // Image/font remeasurement must not interrupt native smooth navigation.
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
      clearTimeout(refreshTimer);
      resize.disconnect();
      root.removeEventListener("load", refresh, true);
      removeEventListener("scroll", noteScroll);
      media.revert();
    };
}
