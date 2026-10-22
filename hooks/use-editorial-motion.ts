"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Native page scrolling, with lazy-loaded, reversible chapter choreography.
 * React never rerenders per scroll frame; hero entrance belongs to CSS only. */
export function useEditorialMotion(rootRef: RefObject<HTMLDivElement | null>) {
  const ready = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const header = root.querySelector<HTMLElement>(".site-header");
    const syncHeader = () => header?.classList.toggle("is-scrolled", scrollY > 40);
    addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
    const layout = matchMedia("(min-width: 701px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposeMotion: (() => void) | undefined;
    let revision = 0;
    const sync = () => {
      const current = ++revision;
      disposeMotion?.();
      disposeMotion = undefined;
      ready.current = Promise.resolve();
      if (reduced.matches) return;
      ready.current = import("./editorial-chapters").then(({ startEditorialChapters }) => {
        if (current === revision) disposeMotion = startEditorialChapters(root);
      }).catch(() => { /* All content and CSS hero remain available without the optional motion chunk. */ });
    };
    sync();
    layout.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      ++revision;
      disposeMotion?.();
      removeEventListener("scroll", syncHeader);
      layout.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [rootRef]);
  return ready;
}
