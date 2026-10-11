"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** One scroll listener; geometry is cached on resize, images and font loading. */
export function useEditorialMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const header = root.querySelector<HTMLElement>(".site-header");
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    let measurements: { element: HTMLElement; top: number; height: number }[] = [];
    let frame = 0;
    let measureFrame = 0;
    let viewportHeight = innerHeight;
    let disposed = false;

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
        } else if (name === "collection") {
          element.style.setProperty("--lookbook-rise", `${(1 - enter) * 65}px`);
        } else if (name === "artist") {
          element.style.setProperty("--portrait-rise", `${(1 - enter) * 80}px`);
          const reading = clamp((local + viewportHeight * .72) / (height * .6));
          words.forEach((word, index) => word.style.setProperty("--word-fill", `${clamp(reading * (words.length + 2) - index) * 100}%`));
        } else if (name === "recognition") {
          element.style.setProperty("--award-left", `${(1 - enter) * 95}px`);
          element.style.setProperty("--award-right", `${(1 - enter) * 160}px`);
          element.style.setProperty("--award-angle", `${(1 - enter) * 5}deg`);
        } else if (name === "detail") {
          element.style.setProperty("--ritual-drift", `${(1 - enter) * 110}px`);
          element.style.setProperty("--ritual-rise", `${(1 - enter) * 90}px`);
          element.style.setProperty("--ritual-turn", `${(1 - enter) * -8}deg`);
        } else if (name === "studies") {
          const spread = clamp((local + viewportHeight * .9) / (viewportHeight * .55));
          element.style.setProperty("--study-spread", String(spread));
          element.style.setProperty("--academy-lift", `${(1 - spread) * 65}px`);
        } else if (name === "academy") {
          const spread = clamp((local + viewportHeight * .55) / viewportHeight);
          element.style.setProperty("--academy-type", `${(1 - spread) * -70}px`);
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
      root.classList.toggle("motion-enabled", !reduced.matches);
      measurements = scenes.map((element) => ({ element, top: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight }));
      schedule();
    };
    const scheduleMeasure = () => { if (!measureFrame) measureFrame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(root);
    root.addEventListener("load", scheduleMeasure, true);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", scheduleMeasure, { passive: true });
    reduced.addEventListener("change", scheduleMeasure);
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
      root.classList.remove("reveal-ready", "motion-enabled");
    };
  }, [rootRef]);
}
