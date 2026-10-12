"use client";

import Image from "next/image";
import { useRef, useState, useEffect, type CSSProperties } from "react";
import styles from "./lash-finder.module.css";

const finishes = [
  { mood: "A little texture", name: "Wispy hybrid", image: "lash-hybrid.webp", detail: "Soft volume. Airy texture. A little undone.", description: "A blend of definition and softness, with wispy lengths that give your set its own rhythm.", label: "Texture" },
  { mood: "More drama", name: "Russian volume", image: "lash-russian.webp", detail: "Fuller. Fluffier. Unmistakable.", description: "Fine lash fans create a fuller finish. Your artist shapes the density around your eyes.", label: "Volume" },
  { mood: "A lifted line", name: "Eyeliner effect", image: "lash-line.webp", detail: "Clean definition. A sculpted finish.", description: "A defined lash line with an elongated effect, mapped individually by your artist.", label: "Definition" },
  { mood: "Naturally me", name: "Lash lift", image: "lash-lift.webp", detail: "Your lashes. A new perspective.", description: "A lifted finish using your natural lashes, without adding extensions.", label: "Natural" },
];

function Direction({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={back ? { transform: "rotate(180deg)" } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function LashFinder({ bookingUrl }: { bookingUrl: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const choiceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const previous = useRef<number | null>(null);

  // Each photo reveals when it enters view, including the second row on phones.
  // Scroll movement is frame-batched; geometry is measured only on layout changes.
  useEffect(() => {
    if (selected !== null) return;
    const buttons = choiceButtons.current.filter((item): item is HTMLButtonElement => !!item);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let positions: { element: HTMLButtonElement; top: number; height: number }[] = [];
    const paint = () => {
      frame = 0;
      positions.forEach(({ element, top, height }) => {
        const distance = top - scrollY;
        if (distance > innerHeight + 100 || distance + height < -100) return;
        const progress = Math.max(0, Math.min(1, (innerHeight - distance) / (innerHeight + height)));
        element.style.setProperty("--photo-drift", reduced.matches ? "0px" : `${(progress - .5) * -22}px`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      measureFrame = 0;
      positions = buttons.map((element) => ({ element, top: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight }));
      schedule();
    };
    const scheduleMeasure = () => { if (!measureFrame) measureFrame = requestAnimationFrame(measure); };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        (target as HTMLElement).dataset.entered = "true";
        observer.unobserve(target);
      });
    }, { threshold: .16 });
    buttons.forEach((button) => observer.observe(button));
    const resize = new ResizeObserver(scheduleMeasure);
    buttons.forEach((button) => resize.observe(button));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    reduced.addEventListener("change", schedule);
    void document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleMeasure);
      reduced.removeEventListener("change", schedule);
    };
  }, [selected]);

  useEffect(() => {
    if (selected !== null) {
      resultHeading.current?.focus({ preventScroll: true });
      previous.current = selected;
    } else if (previous.current !== null) {
      choiceButtons.current[previous.current]?.focus({ preventScroll: true });
    }
  }, [selected]);

  const finish = selected === null ? null : finishes[selected];

  return <section id="services" className={styles.finder} aria-labelledby="finish-title">
    <div className={styles.masthead} data-reveal>
      <span>PaoLash / The collection</span><span>Made around your eyes</span>
    </div>
    <div className={styles.stage} data-reveal>
      {finish === null ? <div className={styles.choose} key="choose">
        <div className={styles.intro}>
          <h2 id="finish-title">Find your<br /><span>finish.</span></h2>
          <div className={styles.invitation}><p>Start with a feeling.<br /> We’ll take it from there.</p><span className={styles.instruction}>Choose a finish below <span aria-hidden="true">↙</span></span></div>
        </div>
        <div className={styles.choices}>
          {finishes.map((item, index) => <button key={item.name} ref={(node) => { choiceButtons.current[index] = node; }} className={styles.choice} style={{ "--photo-delay": `${(index % 2) * 130}ms` } as CSSProperties} type="button" onClick={() => setSelected(index)} aria-label={`${item.mood} — explore ${item.name}`}>
            <span className={styles.photoReveal}><span className={styles.photoWindow}><Image className={styles.choicePhoto} unoptimized src={`/assets/${item.image}`} alt={`Real ${item.name.toLowerCase()} lashes by PaoLash`} width={900} height={950} loading="lazy" /><span className={styles.photoAction} aria-hidden="true">Explore this look <Direction /></span></span></span>
            <span className={styles.choiceName}>{item.mood}<span className={styles.choiceArrow}><Direction /></span></span>
            <span className={styles.treatment}>{item.name}</span>
          </button>)}
        </div>
        <div className={styles.bottom}><span>Four finishes. Never a one-size-fits-all set.</span><a href={bookingUrl} target="_blank" rel="noreferrer">Browse all treatments <Direction /></a></div>
      </div> : <div className={styles.result} key={finish.name}>
        <div className={styles.resultTop}><button className={styles.back} onClick={() => setSelected(null)} type="button"><Direction back /> Choose another finish</button><span>{finish.label} / PaoLash</span></div>
        <figure className={styles.photograph}><Image unoptimized src={`/assets/${finish.image}`} alt={`${finish.name} lash work by PaoLash`} width={900} height={950} /><figcaption>Real work. By PaoLash.</figcaption></figure>
        <div className={styles.resultCopy}><p className={styles.resultKicker}>Your starting point</p><h2 id="finish-title" ref={resultHeading} tabIndex={-1}>{finish.name}</h2><p className={styles.detail}>{finish.detail}</p><p className={styles.description}>{finish.description}</p><a className={styles.reserve} href={bookingUrl} target="_blank" rel="noreferrer">Book your appointment <Direction /></a><p className={styles.consultation}>Your final look is tailored together at the studio.</p></div>
      </div>}
    </div>
  </section>;
}
