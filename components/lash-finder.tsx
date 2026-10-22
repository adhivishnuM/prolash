"use client";

import ResponsivePhoto from "@/components/responsive-photo";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { carouselDepth } from "@/lib/carousel-depth";
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
  const [wheelTarget, setWheelTarget] = useState<HTMLElement | null>(null);
  const plugins = useMemo(() => [WheelGesturesPlugin({ target: wheelTarget ?? undefined })], [wheelTarget]);
  const [startIndex, setStartIndex] = useState(0);
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: true, duration: 28, startIndex }, plugins);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const scene = useRef<HTMLDivElement>(null);

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
    let frame = 0;
    const renderDepth = () => {
      frame = 0;
      const progress = carousel.scrollProgress();
      const depths = carousel.scrollSnapList().map(snap => carouselDepth(snap, progress, lashFinishes.length));
      // All geometry comes from the engine, not transformed DOM measurements.
      carousel.slideNodes().forEach((slide, index) => {
        const depth = depths[index];
        const card = slide.querySelector<HTMLElement>("button");
        if (!card) return;
        slide.style.zIndex = String(20 - Math.round(depth * 5));
        card.style.setProperty("--deck-depth", String(Math.min(depth, 2)));
        card.style.setProperty("--deck-opacity", String(depth <= 1 ? 1 - depth * .23 : Math.max(0, .77 * (2 - depth))));
        card.style.pointerEvents = depth < 1.7 ? "auto" : "none";
      });
    };
    const requestRender = () => { if (!frame) frame = requestAnimationFrame(renderDepth); };
    const sync = () => { setActive(carousel.selectedScrollSnap()); requestRender(); };
    sync();
    carousel.on("select", sync).on("reInit", sync).on("scroll", requestRender).on("settle", requestRender);
    return () => {
      cancelAnimationFrame(frame);
      carousel.off("select", sync).off("reInit", sync).off("scroll", requestRender).off("settle", requestRender);
    };
  }, [carousel]);

  const move = useCallback((direction: number) => {
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

  return <section id="services" ref={setWheelTarget} className={styles.finder} aria-labelledby="finish-title">
    <span className={styles.sectionAnchor} data-section-start aria-hidden="true" />
    <div className={styles.masthead} data-reveal data-motion="collection-label"><span>PaoLash / The collection</span><span>Made around your eyes</span></div>
    <div className={styles.stage}>
      {finish === null ? <div className={styles.choose} key="choose"><div className={styles.intro} data-motion="collection-intro"><div><span className={styles.eyebrow}>Find your signature. Make it yours.</span><h2 id="finish-title">The lash <span>edit.</span></h2></div></div>
      <div className={styles.deckScene} ref={scene} data-motion="collection-deck" role="region" aria-roledescription="carousel" aria-label="Lash collection"
        onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}>
        <p className={styles.activeName} aria-live="polite">{lashFinishes[active].name}</p>
        <div className={styles.deckViewport} ref={viewportRef}>
          <div className={styles.deck}>
            {lashFinishes.map((item, index) => {
              const distance = Math.min((index - active + lashFinishes.length) % lashFinishes.length, (active - index + lashFinishes.length) % lashFinishes.length);
              return <div className={`${styles.deckSlide} ${active === index ? styles.slideActive : ""}`} key={item.image} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${lashFinishes.length}: ${item.name}`}>
              <button type="button" ref={node => { choiceButtons.current[index] = node; }} className={`${styles.deckCard} ${distance <= 1 ? styles.cardNearby : ""} ${active === index ? styles.cardActive : ""}`} aria-label={`Explore ${item.name}`} aria-current={active === index ? "true" : undefined}
                onClick={() => { if (active === index) { setStartIndex(index); setSelected(index); } else carousel?.scrollTo(index, matchMedia("(prefers-reduced-motion: reduce)").matches); }} tabIndex={active === index ? 0 : -1} draggable={false}>
                {((ready && distance <= 2) || index === active) && <ResponsivePhoto className={styles.cardPhoto} style={{ objectPosition: item.position }} draggable={false} unoptimized
                  src={`/assets/lashes/${item.image.replace(".webp", "-640.webp")}`}
                  srcSet={`/assets/lashes/${item.image.replace(".webp", "-320.webp")} ${Math.min(320, item.width)}w, /assets/lashes/${item.image.replace(".webp", "-480.webp")} ${Math.min(480, item.width)}w, /assets/lashes/${item.image.replace(".webp", "-640.webp")} ${Math.min(640, item.width)}w`}
                  sizes="(max-width: 459px) 74vw, (max-width: 700px) 340px, (max-width: 999px) 54vw, 450px" alt={`Real ${item.name.toLowerCase()} lashes by PaoLash`} width={item.width} height={item.height} loading="lazy" />}
                <span className={styles.cardShade} aria-hidden="true" />
              </button>
            </div>; })}
          </div>
        </div>
        <button className={`${styles.deckArrow} ${styles.previous}`} type="button" onClick={() => move(-1)} aria-label="Previous treatment"><Chevron back /></button>
        <button className={`${styles.deckArrow} ${styles.next}`} type="button" onClick={() => move(1)} aria-label="Next treatment"><Chevron /></button>
        <p className={styles.gestureHint}>Swipe or drag to discover. Tap to explore.</p>
      </div>
      </div> : <div className={styles.result} key={finish.name}>
        <div className={styles.resultTop}><button className={styles.back} onClick={() => setSelected(null)} type="button"><Direction back /> Choose another finish</button><span>{finish.label} / PaoLash</span></div>
        <figure className={styles.photograph}><Image unoptimized src={`/assets/lashes/${finish.image.replace(".webp", "-900.webp")}`} alt={`${finish.name} lash work by PaoLash`} width={finish.width} height={finish.height} /><figcaption>Real work. By PaoLash.</figcaption></figure>
        <div className={styles.resultCopy}><p className={styles.resultKicker}>Your starting point</p><h2 id="finish-title" ref={resultHeading} tabIndex={-1}>{finish.name}</h2><p className={styles.detail}>{finish.detail}</p><p className={styles.description}>{finish.description}</p><a className={styles.reserve} href={bookingUrl} target="_blank" rel="noreferrer">Book your appointment <Direction /></a><p className={styles.consultation}>Your final look is tailored together at the studio.</p></div>
      </div>}
    </div>
  </section>;
}
