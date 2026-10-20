"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback, type CSSProperties, type PointerEvent } from "react";
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
  const movingUntil = useRef(0);
  const gesture = useRef<{ id: number; x: number; y: number; time: number; dx: number; spacing: number; horizontal: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const move = useCallback((direction: number) => {
    const now = performance.now();
    if (now < movingUntil.current) return;
    movingUntil.current = now + (matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900);
    setActive(current => current + direction);
  }, []);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || performance.now() < movingUntil.current) return;
    suppressClick.current = false;
    if ((event.target as HTMLElement).closest(`.${styles.deckArrow}`)) return;
    const cards = event.currentTarget.querySelectorAll<HTMLElement>(`.${styles.deckCard}`);
    const center = cards[2].getBoundingClientRect();
    const next = cards[3].getBoundingClientRect();
    const spacing = Math.abs(next.x + next.width / 2 - center.x - center.width / 2);
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), dx: 0, spacing, horizontal: false };
    setInteracting(true);
  };
  const updateDrag = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.horizontal) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; setInteracting(false); return; }
      if (Math.abs(dx) < 8) return;
      current.horizontal = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    current.dx = dx;
    setDrag(Math.max(-1, Math.min(1, dx / current.spacing)));
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    setDrag(0);
    setInteracting(event.pointerType === "mouse" || event.currentTarget.contains(document.activeElement));
    if (!current.horizontal) return;
    setPaused(true);
    const velocity = Math.abs(current.dx) / Math.max(1, performance.now() - current.time);
    if (!cancelled && (Math.abs(current.dx) > 48 || (Math.abs(current.dx) > 16 && velocity > .35))) move(current.dx < 0 ? 1 : -1);
  };

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
        timer = setInterval(() => move(1), 5500);
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .35 });
    observer.observe(scene);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync); };
  }, [selected, paused, interacting, active, move]);


  useEffect(() => {
    if (selected !== null) {
      resultHeading.current?.focus({ preventScroll: true });
      previous.current = selected;
    } else if (previous.current !== null) {
      choiceButtons.current[previous.current]?.focus({ preventScroll: true });
    }
  }, [selected]);

  const finish = selected === null ? null : finishes[selected];
  const activeIndex = ((active % finishes.length) + finishes.length) % finishes.length;
  // Stable virtual neighbours move one slot at a time, including the last-to-first loop.
  const slots = [-2, -1, 0, 1, 2].map(offset => active + offset);

  return <section id="services" className={styles.finder} aria-labelledby="finish-title">
    <div className={styles.masthead} data-reveal>
      <span>PaoLash / The collection</span><span>Made around your eyes</span>
    </div>
    <div className={styles.stage} data-reveal>
      {finish === null ? <div className={styles.choose} key="choose">
        <div className={styles.intro}>
          <div><span className={styles.eyebrow}>Four signatures. One made for you.</span><h2 id="finish-title">The lash<br /><span>edit.</span></h2></div>
        </div>
        <div className={`${styles.deckScene} ${dragging ? styles.dragging : ""}`} ref={deckScene}
          onPointerDown={startDrag}
          onPointerMove={updateDrag}
          onPointerUp={event => endDrag(event)}
          onPointerCancel={event => endDrag(event, true)}
          onLostPointerCapture={event => endDrag(event, true)}
          onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
          onPointerEnter={event => { if (event.pointerType === "mouse") setInteracting(true); }}
          onPointerLeave={event => { if (!gesture.current) setInteracting(event.currentTarget.contains(document.activeElement)); }}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
          onKeyDown={event => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setPaused(true); move(event.key === "ArrowLeft" ? -1 : 1); }
          }}
          role="region" aria-roledescription="carousel" aria-label="Lash collection">
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.deck} aria-label="PaoLash treatment collection">
            {slots.map(slot => {
              const index = ((slot % finishes.length) + finishes.length) % finishes.length;
              const item = finishes[index];
              const position = slot - active;
              const isActive = position === 0;
              return <button
                key={slot}
                ref={(node) => { if (isActive) choiceButtons.current[index] = node; }}
                className={`${styles.deckCard} ${isActive ? styles.cardActive : ""}`}
                style={{ "--card-offset": position + drag, "--card-distance": Math.abs(position + drag), "--card-order": 10 - Math.abs(position) } as CSSProperties}
                type="button"
                onClick={() => { setPaused(true); if (isActive) setSelected(index); else move(position); }}
                aria-label={isActive ? `Open ${item.name}` : `Bring ${item.name} to the front`}
                aria-current={isActive ? "true" : undefined}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={Math.abs(position) > 1 || undefined}
              >
                <Image className={styles.cardPhoto} draggable={false} unoptimized src={`/assets/${item.image}`} alt={`Real ${item.name.toLowerCase()} lashes by PaoLash`} width={900} height={950} loading="eager" />
                <span className={styles.cardShade} aria-hidden="true" />
              </button>;
            })}
          </div>
          <p className={styles.activeName} aria-live={paused || interacting ? "polite" : "off"}><span key={active}>{finishes[activeIndex].name}</span></p>
          <button className={`${styles.deckArrow} ${styles.previous}`} type="button" onClick={() => { setPaused(true); move(-1); }} aria-label="Previous treatment"><Chevron back /></button>
          <button className={`${styles.deckArrow} ${styles.next}`} type="button" onClick={() => { setPaused(true); move(1); }} aria-label="Next treatment"><Chevron /></button>
          <p className={styles.gestureHint}>Swipe to discover. Tap to explore.</p>
        </div>
      </div> : <div className={styles.result} key={finish.name}>
        <div className={styles.resultTop}><button className={styles.back} onClick={() => setSelected(null)} type="button"><Direction back /> Choose another finish</button><span>{finish.label} / PaoLash</span></div>
        <figure className={styles.photograph}><Image unoptimized src={`/assets/${finish.image}`} alt={`${finish.name} lash work by PaoLash`} width={900} height={950} /><figcaption>Real work. By PaoLash.</figcaption></figure>
        <div className={styles.resultCopy}><p className={styles.resultKicker}>Your starting point</p><h2 id="finish-title" ref={resultHeading} tabIndex={-1}>{finish.name}</h2><p className={styles.detail}>{finish.detail}</p><p className={styles.description}>{finish.description}</p><a className={styles.reserve} href={bookingUrl} target="_blank" rel="noreferrer">Book your appointment <Direction /></a><p className={styles.consultation}>Your final look is tailored together at the studio.</p></div>
      </div>}
    </div>
  </section>;
}
