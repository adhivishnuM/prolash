"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** One scroll listener; geometry is cached on resize, images and font loading. */
export function useEditorialMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 1000px) and (min-height: 650px)");
    const header = root.querySelector<HTMLElement>(".site-header");
    const rail = root.querySelector<HTMLElement>(".collection-rail");
    const track = root.querySelector<HTMLElement>(".collection-track");
    const collection = root.querySelector<HTMLElement>(".collection");
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    let measurements: { element: HTMLElement; top: number; height: number }[] = [];
    let frame = 0;
    let measureFrame = 0;
    let travel = 0;
    let viewportHeight = innerHeight;
    let active = -1;
    let disposed = false;
    let pinned = false;

    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("is-visible");
        reveal.unobserve(target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });
    root.querySelectorAll("[data-reveal], [data-unfold]").forEach((element) => reveal.observe(element));

    const paint = () => {
      frame = 0;
      const y = scrollY;
      header?.classList.toggle("is-scrolled", y > 40);
      if (reduced.matches) return;
      measurements.forEach(({ element, top, height }) => {
        const local = y - top;
        // Only write to scenes in or immediately beside the viewport.
        if (local < -viewportHeight * 1.2 || local > height + viewportHeight * .2) return;
        const enter = clamp((local + viewportHeight * .85) / (viewportHeight * .95));
        const passage = clamp((local + viewportHeight) / (height + viewportHeight));
        const name = element.dataset.scene;
        if (name === "hero") {
          const progress = clamp(local / height);
          element.style.setProperty("--hero-text", `${progress * -100}px`);
          element.style.setProperty("--hero-person", `${progress * 135}px`);
          element.style.setProperty("--hero-detail", `${progress * -85}px`);
          element.style.setProperty("--hero-fade", `${1 - progress * .8}`);
        } else if (name === "collection" && track && pinned) {
          const progress = clamp(local / Math.max(1, height - viewportHeight));
          track.style.transform = `translate3d(${-travel * progress}px,0,0)`;
          element.style.setProperty("--gallery-progress", String(progress));
          const next = Math.round(progress * 3);
          if (next !== active) {
            active = next;
            element.dispatchEvent(new CustomEvent("lookchange", { detail: next }));
          }
        } else if (name === "artist") {
          element.style.setProperty("--portrait-rise", `${(1 - enter) * 80}px`);
          const reading = clamp((local + viewportHeight * .72) / (height * .6));
          words.forEach((word, index) => word.style.setProperty("--word-fill", `${clamp(reading * (words.length + 2) - index) * 100}%`));
        } else if (name === "recognition") {
          element.style.setProperty("--award-left", `${(1 - enter) * 95}px`);
          element.style.setProperty("--award-right", `${(1 - enter) * 160}px`);
          element.style.setProperty("--award-angle", `${(1 - enter) * 5}deg`);
        } else if (name === "detail") {
          element.style.setProperty("--detail-scale", `${.84 + enter * .16}`);
          element.style.setProperty("--detail-type", `${(1 - enter) * -75}px`);
          element.style.setProperty("--care-rise", `${(1 - clamp((local + viewportHeight * .5) / (height * .5))) * 80}px`);
        } else if (name === "academy") {
          element.style.setProperty("--academy-lift", `${(1 - enter) * 100}px`);
          element.style.setProperty("--academy-angle", `${(1 - enter) * -7}deg`);
        } else if (name === "visit") {
          element.style.setProperty("--closing-drift", `${(1 - passage) * 80}px`);
          element.style.setProperty("--logo-rise", `${(1 - enter) * 70}px`);
        }
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      viewportHeight = innerHeight;
      const wasPinned = pinned;
      const selected = Math.max(0, active);
      pinned = desktop.matches && !reduced.matches;
      root.classList.toggle("motion-enabled", !reduced.matches);
      collection?.classList.toggle("is-pinned", pinned);
      if (track && rail) {
        travel = (track.lastElementChild as HTMLElement | null)?.offsetLeft ?? 0;
        if (!pinned) {
          track.style.transform = "";
          if (wasPinned) rail.scrollLeft = (track.children[selected] as HTMLElement)?.offsetLeft ?? 0;
          const cards = Array.from(track.children) as HTMLElement[];
          const visible = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - rail.scrollLeft) < Math.abs(cards[best].offsetLeft - rail.scrollLeft) ? index : best, 0);
          collection?.dispatchEvent(new CustomEvent("lookchange", { detail: visible }));
        }
        else rail.scrollLeft = 0;
      }
      measurements = scenes.map((element) => ({ element, top: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight }));
      active = -1;
      schedule();
    };
    const scheduleMeasure = () => { if (!measureFrame) measureFrame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(root);
    root.addEventListener("load", scheduleMeasure, true);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", scheduleMeasure, { passive: true });
    reduced.addEventListener("change", scheduleMeasure);
    desktop.addEventListener("change", scheduleMeasure);
    void document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    root.classList.add("reveal-ready");
    measure();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      reveal.disconnect();
      resize.disconnect();
      root.removeEventListener("load", scheduleMeasure, true);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", scheduleMeasure);
      reduced.removeEventListener("change", scheduleMeasure);
      desktop.removeEventListener("change", scheduleMeasure);
      root.classList.remove("reveal-ready", "motion-enabled");
      collection?.classList.remove("is-pinned");
      if (track) track.style.transform = "";
    };
  }, [rootRef]);
}
