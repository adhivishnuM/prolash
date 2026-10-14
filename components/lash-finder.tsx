"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, type CSSProperties } from "react";
import styles from "./lash-finder.module.css";

const finishes = [
  { mood: "A little texture", name: "Wispy hybrid", image: "lash-hybrid.webp", detail: "Soft volume. Airy texture. A little undone.", description: "A blend of definition and softness, with wispy lengths that give your set its own rhythm.", label: "Texture", tryOnId: "wispy-hybrid" },
  { mood: "More drama", name: "Russian volume", image: "lash-russian.webp", detail: "Fuller. Fluffier. Unmistakable.", description: "Fine lash fans create a fuller finish. Your artist shapes the density around your eyes.", label: "Volume", tryOnId: "russian-volume" },
  { mood: "A lifted line", name: "Eyeliner effect", image: "lash-line.webp", detail: "Clean definition. A sculpted finish.", description: "A defined lash line with an elongated effect, mapped individually by your artist.", label: "Definition", tryOnId: "eyeliner-effect" },
  { mood: "Naturally me", name: "Lash lift", image: "lash-lift.webp", detail: "Your lashes. A new perspective.", description: "A lifted finish using your natural lashes, without adding extensions.", label: "Natural", tryOnId: null },
];

function Direction({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={back ? { transform: "rotate(180deg)" } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Chevron({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 40 64" fill="none" aria-hidden="true" style={back ? { transform: "rotate(180deg)" } : undefined}><path d="M10 8Q20 22 30 32Q20 42 10 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function LashFinder({ bookingUrl }: { bookingUrl: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const choiceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const deckScene = useRef<HTMLDivElement>(null);
  const previous = useRef<number | null>(null);

  // Rotate only while the collection is visible and the visitor is not using it.
  useEffect(() => {
    const scene = deckScene.current;
    if (!scene || selected !== null || paused || interacting) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (visible && !document.hidden && !reduced.matches) {
        timer = setInterval(() => setActive(current => (current + 1) % finishes.length), 5500);
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .35 });
    observer.observe(scene);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync); };
  }, [selected, paused, interacting, active]);

  // A small amount of scroll depth keeps the deck alive without pinning the page.
  useEffect(() => {
    if (selected !== null) return;
    const scene = deckScene.current;
    if (!scene) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let top = 0;
    let height = 0;
    const paint = () => {
      frame = 0;
      const distance = top - scrollY;
      if (distance > innerHeight + 140 || distance + height < -140) return;
      const progress = Math.max(0, Math.min(1, (innerHeight - distance) / (innerHeight + height)));
      scene.style.setProperty("--deck-shift", reduced.matches ? "0px" : `${(progress - .5) * -24}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      measureFrame = 0;
      top = scene.getBoundingClientRect().top + scrollY;
      height = scene.offsetHeight;
      schedule();
    };
    const scheduleMeasure = () => { if (!measureFrame) measureFrame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(scene);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    reduced.addEventListener("change", schedule);
    void document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
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
  const move = (direction: number) => setActive((current) => (current + direction + finishes.length) % finishes.length);
  const cardPosition = (index: number) => {
    const forward = (index - active + finishes.length) % finishes.length;
    return forward > finishes.length / 2 ? forward - finishes.length : forward;
  };

  return <section id="services" className={styles.finder} aria-labelledby="finish-title">
    <div className={styles.masthead} data-reveal>
      <span>PaoLash / The collection</span><span>Made around your eyes</span>
    </div>
    <div className={styles.stage} data-reveal>
      {finish === null ? <div className={styles.choose} key="choose">
        <div className={styles.intro}>
          <div><span className={styles.eyebrow}>Four signatures. One made for you.</span><h2 id="finish-title">The lash<br /><span>edit.</span></h2></div>
        </div>
        <div className={styles.deckScene} ref={deckScene}
          onPointerEnter={event => { if (event.pointerType === "mouse") setInteracting(true); }}
          onPointerLeave={event => setInteracting(event.currentTarget.contains(document.activeElement))}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
          onKeyDown={event => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setPaused(true); move(event.key === "ArrowLeft" ? -1 : 1); }
          }}
          role="region" aria-roledescription="carousel" aria-label="Lash collection">
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.deck} aria-label="PaoLash treatment collection">
            {finishes.map((item, index) => {
              const position = cardPosition(index);
              const isActive = position === 0;
              return <button
                key={item.name}
                ref={(node) => { choiceButtons.current[index] = node; }}
                className={`${styles.deckCard} ${isActive ? styles.cardActive : ""}`}
                style={{ "--card-offset": position, "--card-distance": Math.abs(position), "--card-order": 10 - Math.abs(position), "--card-delay": `${index * 85}ms` } as CSSProperties}
                type="button"
                onClick={() => { setPaused(true); if (isActive) setSelected(index); else setActive(index); }}
                aria-label={isActive ? `Open ${item.name}` : `Bring ${item.name} to the front`}
                aria-current={isActive ? "true" : undefined}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={Math.abs(position) > 1 || undefined}
              >
                <Image className={styles.cardPhoto} unoptimized src={`/assets/${item.image}`} alt={`Real ${item.name.toLowerCase()} lashes by PaoLash`} width={900} height={950} loading={index === 0 ? "eager" : "lazy"} />
              </button>;
            })}
          </div>
          <p className={styles.activeName} aria-live={paused || interacting ? "polite" : "off"}><span key={active}>{finishes[active].name}</span></p>
          <button className={`${styles.deckArrow} ${styles.previous}`} type="button" onClick={() => { setPaused(true); move(-1); }} aria-label="Previous treatment"><Chevron back /></button>
          <button className={`${styles.deckArrow} ${styles.next}`} type="button" onClick={() => { setPaused(true); move(1); }} aria-label="Next treatment"><Chevron /></button>
        </div>
        <div className={styles.mirrorInvitation}><div><span className={styles.mirrorEyebrow}>The Lash Mirror</span><p>See your finish.<em> On you.</em></p></div><Link href="/try-on/" prefetch={false} className={styles.mirrorLink}>Try on our looks <Direction /></Link></div>
      </div> : <div className={styles.result} key={finish.name}>
        <div className={styles.resultTop}><button className={styles.back} onClick={() => setSelected(null)} type="button"><Direction back /> Choose another finish</button><span>{finish.label} / PaoLash</span></div>
        <figure className={styles.photograph}><Image unoptimized src={`/assets/${finish.image}`} alt={`${finish.name} lash work by PaoLash`} width={900} height={950} /><figcaption>Real work. By PaoLash.</figcaption></figure>
        <div className={styles.resultCopy}><p className={styles.resultKicker}>Your starting point</p><h2 id="finish-title" ref={resultHeading} tabIndex={-1}>{finish.name}</h2><p className={styles.detail}>{finish.detail}</p><p className={styles.description}>{finish.description}</p>{finish.tryOnId && <Link className={styles.tryOn} href={`/try-on/?style=${finish.tryOnId}`} prefetch={false}>Try on me <Direction /></Link>}<a className={finish.tryOnId ? styles.bookingSecondary : styles.reserve} href={bookingUrl} target="_blank" rel="noreferrer">Book your appointment <Direction /></a><p className={styles.consultation}>Your final look is tailored together at the studio.</p></div>
      </div>}
    </div>
  </section>;
}
