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

/** Original, intentionally illustrative lash strokes—not simulated treatment results. */
function LashStudy({ variant }: { variant: number }) {
  const count = variant === 1 ? 33 : variant === 3 ? 13 : 21;
  return <svg className={styles.study} viewBox="0 0 240 125" fill="none" aria-hidden="true">
    <path className={styles.baseline} d="M22 97 Q120 148 218 89" pathLength="1" />
    {Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const x = 23 + t * 193;
      const y = 98 + Math.sin(t * Math.PI) * 19 - t * 8;
      const length = variant === 0 ? 43 + (i % 4 === 0 ? 28 : 5) : variant === 1 ? 67 + Math.sin(t * Math.PI) * 10 : variant === 2 ? 30 + t * 54 : 36 + Math.sin(t * Math.PI) * 17;
      const lean = (t - .4) * (variant === 2 ? 51 : 35);
      return <path className={styles.lash} key={i} d={`M${x} ${y} Q${x + lean * .9} ${y - length * .38} ${x + lean} ${y - length}`} pathLength="1" style={{ "--stroke-delay": `${i * 16}ms` } as CSSProperties} />;
    })}
  </svg>;
}

export default function LashFinder({ bookingUrl }: { bookingUrl: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const choiceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const previous = useRef<number | null>(null);

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
          <div className={styles.invitation}><span className={styles.spark} aria-hidden="true">✳</span><p>Start with a feeling.<br />We’ll take it from there.</p><span className={styles.instruction}>Choose a finish below <span aria-hidden="true">↙</span></span></div>
        </div>
        <div className={styles.choices}>
          {finishes.map((item, index) => <button key={item.name} ref={(node) => { choiceButtons.current[index] = node; }} className={styles.choice} type="button" onClick={() => setSelected(index)} aria-label={`${item.mood} — explore ${item.name}`}>
            <LashStudy variant={index} />
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
