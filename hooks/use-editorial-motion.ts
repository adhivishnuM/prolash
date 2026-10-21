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
    let visualY = scrollY;
    let previousTime = 0;
    const compact = matchMedia("(max-width: 700px)");

    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("is-visible");
        reveal.unobserve(target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });
    root.querySelectorAll<HTMLElement>("[data-reveal], [data-unfold]").forEach((element) => {
      // Small, local staggers keep copy and imagery in the same visual phrase.
      const siblings = Array.from(element.parentElement?.children ?? []);
      if (!element.style.getPropertyValue("--delay")) {
        element.style.setProperty("--delay", `${Math.min(siblings.indexOf(element), 3) * 65}ms`);
      }
      reveal.observe(element);
    });

    const paint = (time: number) => {
      frame = 0;
      header?.classList.toggle("is-scrolled", scrollY > 40);
      if (reduced.matches || document.hidden) return;
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      // Dampen the artwork only. Native touch, wheel, keyboard and browser
      // scrolling retain their normal position and response.
      if (Math.abs(scrollY - visualY) > viewportHeight * 1.5) visualY = scrollY;
      visualY += (scrollY - visualY) * (1 - Math.exp(-elapsed / 95));
      const y = visualY;
      const amplitude = compact.matches ? .45 : 1;
      measurements.forEach(({ element, top, height }) => {
        const local = y - top;
        // Only write to scenes in or immediately beside the viewport.
        if (local < -viewportHeight * 1.2 || local > height + viewportHeight * .2) return;
        const enter = clamp((local + viewportHeight * .85) / (viewportHeight * .95));
        const passage = clamp((local + viewportHeight) / (height + viewportHeight));
        const name = element.dataset.scene;
        element.style.setProperty("--scene-rise", `${(1 - enter) * 22 * amplitude}px`);
        element.style.setProperty("--portrait-drift", `${(passage - .5) * -28 * amplitude}px`);
        if (name === "artist") {
          const reading = clamp((local + viewportHeight * .72) / (height * .6));
          words.forEach((word, index) => word.style.setProperty("--word-fill", `${clamp(reading * (words.length + 2) - index) * 100}%`));
        } else if (name === "recognition") {
          element.style.setProperty("--award-left", `${(1 - enter) * 65 * amplitude}px`);
          element.style.setProperty("--award-right", `${(1 - enter) * 100 * amplitude}px`);
          element.style.setProperty("--award-angle", `${(1 - enter) * 3 * amplitude}deg`);
        } else if (name === "detail") {
          element.style.setProperty("--ritual-drift", `${(1 - enter) * 65 * amplitude}px`);
          element.style.setProperty("--ritual-rise", `${(1 - enter) * 70 * amplitude}px`);
          element.style.setProperty("--ritual-turn", `${(1 - enter) * -3 * amplitude}deg`);
        } else if (name === "visit") {
          element.style.setProperty("--closing-drift", `${(1 - passage) * 80}px`);
          element.style.setProperty("--logo-rise", `${(1 - enter) * 70}px`);
        }
      });
      if (Math.abs(scrollY - visualY) > .1) frame = requestAnimationFrame(paint);
      else previousTime = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      viewportHeight = innerHeight;
      root.classList.toggle("motion-enabled", !reduced.matches);
      if (reduced.matches) {
        scenes.forEach((element) => {
          ["--scene-rise", "--portrait-drift", "--award-left", "--award-right", "--award-angle", "--ritual-drift", "--ritual-rise", "--ritual-turn", "--closing-drift", "--logo-rise"].forEach((property) => element.style.removeProperty(property));
        });
      }
      visualY = scrollY;
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
    document.addEventListener("visibilitychange", scheduleMeasure);
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
      document.removeEventListener("visibilitychange", scheduleMeasure);
      root.classList.remove("reveal-ready", "motion-enabled");
    };
  }, [rootRef]);
}
