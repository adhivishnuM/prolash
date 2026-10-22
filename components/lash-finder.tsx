"use client";

import ResponsivePhoto from "@/components/responsive-photo";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { lashFinishes } from "@/lib/lash-collection";
import styles from "./lash-finder.module.css";

function Direction({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={back ? { transform: "rotate(180deg)" } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Chevron({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 40 64" fill="none" aria-hidden="true" style={back ? { transform: "rotate(180deg)" } : undefined}><path d="M10 8Q20 22 30 32Q20 42 10 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Embla owns drag physics and click suppression; React updates only on selection. */
export default function LashFinder({ bookingUrl }: { bookingUrl: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const choiceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const previous = useRef<number | null>(null);
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, align: "center", duration: 26 });
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const [interacted, setInteracted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin: "300px" });
    if (scene.current) observer.observe(scene.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const sync = () => setActive(carousel.selectedScrollSnap());
    const stop = () => setInteracted(true);
    sync();
    carousel.on("select", sync).on("reInit", sync).on("pointerDown", stop);
    return () => { carousel.off("select", sync).off("reInit", sync).off("pointerDown", stop); };
  }, [carousel]);

  useEffect(() => {
    if (!carousel || selected !== null || interacted || hovered || focused) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (visible && !document.hidden && !reduced.matches) timer = setInterval(() => carousel.scrollNext(), 5500);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .35 });
    if (scene.current) observer.observe(scene.current);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync); };
  }, [carousel, selected, interacted, hovered, focused]);

  const move = useCallback((direction: number) => {
    setInteracted(true);
    const jump = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (direction < 0) carousel?.scrollPrev(jump);
    else carousel?.scrollNext(jump);
  }, [carousel]);

  useEffect(() => {
    if (selected !== null) {
      resultHeading.current?.focus({ preventScroll: true });
      previous.current = selected;
    } else if (previous.current !== null) {
      choiceButtons.current[previous.current]?.focus({ preventScroll: true });
    }
  }, [selected]);

  const finish = selected === null ? null : lashFinishes[selected];

  return <section id="services" className={styles.finder} aria-labelledby="finish-title">
    <div className={styles.masthead} data-reveal data-motion="collection-label"><span>PaoLash / The collection</span><span>Made around your eyes</span></div>
    <div className={styles.stage}>
      <span className={styles.sectionAnchor} data-section-start aria-hidden="true" />
      {finish === null ? <div className={styles.choose} key="choose"><div className={styles.intro} data-motion="collection-intro"><div><span className={styles.eyebrow}>Find your signature. Make it yours.</span><h2 id="finish-title">The lash <span>edit.</span></h2></div></div>
      <div className={styles.deckScene} ref={scene} data-motion="collection-deck" role="region" aria-roledescription="carousel" aria-label="Lash collection"
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
        onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}>
        <p className={styles.activeName} aria-live={interacted ? "polite" : "off"}>{lashFinishes[active].name}</p>
        <div className={styles.deckViewport} ref={viewportRef}>
          <div className={styles.deck}>
            {lashFinishes.map((item, index) => {
              const distance = Math.min((index - active + lashFinishes.length) % lashFinishes.length, (active - index + lashFinishes.length) % lashFinishes.length);
              return <div className={`${styles.deckSlide} ${active === index ? styles.slideActive : ""}`} key={item.image} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${lashFinishes.length}: ${item.name}`}>
              <button type="button" ref={node => { choiceButtons.current[index] = node; }} className={`${styles.deckCard} ${distance <= 1 ? styles.cardNearby : ""} ${active === index ? styles.cardActive : ""}`} aria-label={`Explore ${item.name}`} aria-current={active === index ? "true" : undefined}
                onClick={() => { setInteracted(true); if (active === index) setSelected(index); else carousel?.scrollTo(index, matchMedia("(prefers-reduced-motion: reduce)").matches); }} tabIndex={active === index ? 0 : -1} draggable={false}>
                {((ready && distance <= 1) || index === active) && <ResponsivePhoto className={styles.cardPhoto} style={{ objectPosition: item.position }} draggable={false} unoptimized
                  src={`/assets/lashes/${item.image.replace(".webp", "-640.webp")}`}
                  srcSet={`/assets/lashes/${item.image.replace(".webp", "-320.webp")} ${Math.min(320, item.width)}w, /assets/lashes/${item.image.replace(".webp", "-640.webp")} ${Math.min(640, item.width)}w`}
                  sizes="(max-width: 700px) 70vw, (max-width: 999px) 45vw, 420px" alt={`Real ${item.name.toLowerCase()} lashes by PaoLash`} width={item.width} height={item.height} loading="lazy" />}
                <span className={styles.cardShade} aria-hidden="true" />
              </button>
            </div>; })}
          </div>
        </div>
        <button className={`${styles.deckArrow} ${styles.previous}`} type="button" onClick={() => move(-1)} aria-label="Previous treatment"><Chevron back /></button>
        <button className={`${styles.deckArrow} ${styles.next}`} type="button" onClick={() => move(1)} aria-label="Next treatment"><Chevron /></button>
        <p className={styles.gestureHint}>Swipe to discover. Tap to explore.</p>
      </div>
      </div> : <div className={styles.result} key={finish.name}>
        <div className={styles.resultTop}><button className={styles.back} onClick={() => setSelected(null)} type="button"><Direction back /> Choose another finish</button><span>{finish.label} / PaoLash</span></div>
        <figure className={styles.photograph}><Image unoptimized src={`/assets/lashes/${finish.image.replace(".webp", "-900.webp")}`} alt={`${finish.name} lash work by PaoLash`} width={finish.width} height={finish.height} /><figcaption>Real work. By PaoLash.</figcaption></figure>
        <div className={styles.resultCopy}><p className={styles.resultKicker}>Your starting point</p><h2 id="finish-title" ref={resultHeading} tabIndex={-1}>{finish.name}</h2><p className={styles.detail}>{finish.detail}</p><p className={styles.description}>{finish.description}</p><a className={styles.reserve} href={bookingUrl} target="_blank" rel="noreferrer">Book your appointment <Direction /></a><p className={styles.consultation}>Your final look is tailored together at the studio.</p></div>
      </div>}
    </div>
  </section>;
}
