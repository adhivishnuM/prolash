"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Native scrolling on every device. Phones use one-shot compositor reveals,
 * never GSAP's continuous scroll timelines or per-frame React state updates. */
export function useEditorialMotion(rootRef: RefObject<HTMLDivElement | null>) {
  const ready = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const header = root.querySelector<HTMLElement>(".site-header");
    const syncHeader = () => header?.classList.toggle("is-scrolled", scrollY > 40);
    addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
    const desktop = matchMedia("(min-width: 701px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposeMotion: (() => void) | undefined;
    let revision = 0;
    const sync = () => {
      const current = ++revision;
      disposeMotion?.();
      disposeMotion = undefined;
      ready.current = Promise.resolve();
      if (reduced.matches) return;
      if (desktop.matches) {
        ready.current = import("./desktop-editorial-motion").then(({ startDesktopMotion }) => {
          if (current === revision) disposeMotion = startDesktopMotion(root);
        }).catch(() => { /* CSS entrances remain available if the optional motion chunk fails. */ });
        return;
      }
      root.classList.add("reveal-ready", "motion-mobile");
      const ritual = root.querySelector<HTMLElement>(".ritual");
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }, { threshold: 0, rootMargin: "0px 0px -30px 0px" });
      root.querySelectorAll("[data-reveal],[data-unfold]").forEach(node => observer.observe(node));
      if (ritual) observer.observe(ritual);
      disposeMotion = () => {
        observer.disconnect();
        root.classList.remove("reveal-ready", "motion-mobile");
      };
    };
    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      ++revision;
      disposeMotion?.();
      removeEventListener("scroll", syncHeader);
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [rootRef]);
  return ready;
}
