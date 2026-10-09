"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BOOKING_URL = "https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624";

const services = [
  { name: "Full Russian", note: "Density, airiness, drama", image: "/assets/lash-russian.webp", alt: "Full Russian volume lash set" },
  { name: "Eyeliner Effect", note: "Lifted, sleek, sculpted", image: "/assets/lash-line.webp", alt: "Hybrid eyeliner effect lash set" },
  { name: "Wispy Hybrid", note: "Texture with softness", image: "/assets/lash-hybrid.webp", alt: "Soft wispy hybrid lash set" },
  { name: "Lash Lift", note: "Your lashes, elevated", image: "/assets/lash-lift.webp", alt: "Before and after lash lift" },
];

const policies = [
  { title: "Deposit", text: "A €20 non-refundable deposit secures your appointment and is deducted from the remaining salon balance." },
  { title: "Timing", text: "Please arrive on time. After 10 minutes, availability may require cancellation or a €10 late fee." },
  { title: "Changes", text: "Cancel or reschedule at least 48 hours ahead. Late changes may require full payment before another booking." },
  { title: "Patch test", text: "New clients need a patch test up to 48 hours before their appointment." },
  { title: "Come clean", text: "Arrive without eye makeup, mascara, oil, strip lashes or lash glue. A cleaning fee may apply if removal is needed." },
];

function BookingLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <a className={className} href={BOOKING_URL} target="_blank" rel="noreferrer">{children}</a>;
}

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? "brand-footer" : ""}`} href="#top" aria-label="PaoLash home"><img src="/assets/logo.webp" alt="PaoLash Lounge" width="520" height="520" /></a>;
}

function SectionLabel({ children, number, light = false }: { children: React.ReactNode; number: string; light?: boolean }) {
  return <div className={`section-label reveal ${light ? "section-label-light" : ""}`}><span>{number}</span>{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const heroLashRef = useRef<HTMLSpanElement>(null);
  const heroArtRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
    }, { threshold: 0.14 });
    document.querySelectorAll(".reveal, .reveal-image, .split-text").forEach((el) => observer.observe(el));

    const onScroll = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${maximum > 0 ? window.scrollY / maximum : 0})`;
      const shift = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
      if (heroLashRef.current) heroLashRef.current.style.transform = `translate3d(${-shift * 4}vw, ${shift * 7}vh, 0)`;
      if (heroArtRef.current) heroArtRef.current.style.transform = `translate3d(${shift * 5}vw, ${shift * 2}vh, 0)`;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (cursorRef.current && event.pointerType !== "touch") cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onCursorEnter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      cursorRef.current?.classList.add("is-active");
      const label = cursorRef.current?.querySelector("span");
      if (label) label.textContent = target.dataset.cursor || "View";
    };
    const onCursorLeave = () => cursorRef.current?.classList.remove("is-active");
    const cursorTargets = document.querySelectorAll<HTMLElement>("[data-cursor]");
    cursorTargets.forEach((target) => { target.addEventListener("pointerenter", onCursorEnter); target.addEventListener("pointerleave", onCursorLeave); });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      cursorTargets.forEach((target) => { target.removeEventListener("pointerenter", onCursorEnter); target.removeEventListener("pointerleave", onCursorLeave); });
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="scroll-meter" aria-hidden="true"><span ref={progressRef} /></div>
    <div className="cursor" aria-hidden="true" ref={cursorRef}><span>View</span></div>

    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="Primary navigation"><a href="#services">Services</a><a href="#story">Our story</a><a href="#academy">Academy</a><a href="#visit">Visit</a></nav>
      <div className="header-actions"><BookingLink className="pill pill-small">Book now</BookingLink><button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((value) => !value)}><span>{menuOpen ? "Close" : "Menu"}</span><i /><i /></button></div>
    </header>

    <div className={`menu-panel ${menuOpen ? "is-open" : ""}`} id="mobile-menu" aria-hidden={!menuOpen}>
      <div className="menu-word" aria-hidden="true">PAO</div>
      <nav aria-label="Mobile navigation">{["services", "story", "academy", "visit"].map((item, index) => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item === "story" ? "Our story" : item[0].toUpperCase() + item.slice(1)}</a>)}</nav>
      <BookingLink className="pill pill-light">Reserve your appointment</BookingLink>
    </div>

    <main id="main">
      <div className="hero-scroll"><section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-eyebrow reveal"><span>Dublin 2 · Ireland</span><span>Precision in every set</span></div>
        <h1 className="sr-only" id="hero-title">PaoLash — bespoke lash artistry in Dublin</h1>
        <div className="hero-type" aria-hidden="true"><span className="hero-word hero-word-lash" ref={heroLashRef}>LASH</span><span className="hero-word hero-word-art" ref={heroArtRef}>ARTISTRY</span></div>
        <div className="hero-detail hero-detail-left" aria-hidden="true"><img src="/assets/lash-line.webp" alt="" width="900" height="948" /></div>
        <div className="hero-detail hero-detail-right" aria-hidden="true"><img src="/assets/lash-hybrid.webp" alt="" width="900" height="905" /></div>
        <div className="hero-portrait hero-enter" data-cursor="Book"><div className="portrait-shape" /><img src="/assets/hero.webp" alt="Paola, founder and lash artist at PaoLash" width="900" height="1351" fetchPriority="high" /></div>
        <div className="hero-copy reveal"><p>Personalised lash and brow treatments, shaped around your eyes—not a template.</p><a className="text-link" href="#services">Explore the artistry <span aria-hidden="true">↗</span></a></div>
        <div className="award-seal" aria-label="International award recognition — third place, wispy style, Dubai"><svg viewBox="0 0 160 160" aria-hidden="true"><defs><path id="sealPath" d="M80,80 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" /></defs><text><textPath href="#sealPath">INTERNATIONAL RECOGNITION · DUBAI · </textPath></text><circle cx="80" cy="80" r="39" /></svg><strong>3<sup>rd</sup></strong><small>WISPY</small></div>
        <BookingLink className="hero-book"><span>Book an appointment</span><i aria-hidden="true">↗</i></BookingLink>
        <div className="scroll-cue" aria-hidden="true"><span />Scroll to discover</div>
      </section></div>

      <div className="ticker" aria-label="PaoLash services"><div className="ticker-track">{[0, 1].map((group) => <div className="ticker-group" key={group}><span>WISPY SETS</span><b>✦</b><span>BROW ARCHITECTURE</span><b>✦</b><span>LASH LIFTS</span><b>✦</b><span>PAOLASH ACADEMY</span><b>✦</b></div>)}</div></div>

      <section className="intro section-pad" id="story">
        <SectionLabel number="01">THE PAOLASH POINT OF VIEW</SectionLabel>
        <div className="intro-grid"><h2 className="display-copy split-text">Eyes are not identical. Your lashes shouldn’t be either.</h2><figure className="intro-photo reveal-image" data-cursor="Founder"><img src="/assets/founder-night.webp" alt="Paola, founder of PaoLash" width="760" height="1049" loading="lazy" /></figure><div className="intro-note reveal"><p>Every appointment begins with your eye shape, your features and how you want to feel. The result is considered, comfortable and unmistakably yours.</p><div className="signature">Paola G.</div><span>Founder · Lash artist · Educator</span></div></div>
      </section>

      <section className="services section-pad" id="services" aria-labelledby="services-title">
        <SectionLabel number="02">SIGNATURE SERVICES</SectionLabel>
        <div className="services-heading"><h2 id="services-title" className="billboard">YOUR <em>LOOK</em></h2><p className="reveal">From quiet definition to high-impact wispy volume, choose a direction and we’ll tailor the details.</p></div>
        <div className="service-stage">
          <div className="service-visual reveal-image" data-cursor="Explore"><div className="blob blob-a" /><img key={services[activeService].image} className="service-changing-image" src={services[activeService].image} alt={services[activeService].alt} width="900" height="950" /><div className="image-index"><span>0{activeService + 1}</span> / 04</div></div>
          <div className="service-list" role="tablist" aria-label="Featured lash services">{services.map((service, index) => <button key={service.name} className={`service-tab ${activeService === index ? "is-active" : ""}`} type="button" role="tab" aria-selected={activeService === index} onClick={() => setActiveService(index)}><span>0{index + 1}</span><strong>{service.name}</strong><i>{service.note}</i></button>)}</div>
        </div>
        <div className="service-chips reveal" aria-label="More services">{["Classic", "Wet effect", "Brown set", "Anime", "Fox eye", "Bottom lashes", "Brow lamination", "Wax & tint"].map((chip) => <span key={chip}>{chip}</span>)}</div>
        <div className="center-action reveal"><BookingLink className="pill">See all services on Fresha</BookingLink></div>
      </section>

      <section className="craft section-pad">
        <div className="craft-type" aria-hidden="true">CRAFT</div>
        <div className="craft-image craft-image-one reveal-image" data-cursor="Detail"><img src="/assets/lash-classic.webp" alt="Detailed classic wispy lash work" loading="lazy" width="900" height="900" /></div>
        <div className="craft-image craft-image-two reveal-image" data-cursor="Care"><img src="/assets/aftercare.webp" alt="PaoLash aftercare products" loading="lazy" width="700" height="805" /></div>
        <div className="craft-copy reveal"><SectionLabel number="03" light>THE FINISHING DETAILS</SectionLabel><h2>Light on the eye.<br />Heavy on impact.</h2><p>Careful mapping, considered weight and thoughtful aftercare come together in a finish that feels as good as it looks.</p></div>
        <div className="orbit-copy" aria-hidden="true"><span>PRECISE · PERSONAL · POLISHED · </span></div>
      </section>

      <section className="recognition section-pad" aria-labelledby="recognition-title">
        <SectionLabel number="04">INTERNATIONAL RECOGNITION</SectionLabel>
        <div className="recognition-grid"><div className="recognition-copy"><p className="eyebrow reveal">Dubai · 2025</p><h2 className="split-text" id="recognition-title">Awarded for the art of wispy styling.</h2><p className="reveal">Third place in the Wispy Style category—an international acknowledgement of the technique and creative eye behind every PaoLash set.</p></div><div className="award-stack" data-cursor="Award"><figure className="award-card award-card-one reveal-image"><img src="/assets/award.webp" alt="International Lash Competition third-place certificate for Paola Gutierrez" loading="lazy" width="720" height="1019" /></figure><figure className="award-card award-card-two reveal-image"><img src="/assets/trophy.webp" alt="Lash competition trophy in Dubai" loading="lazy" width="900" height="1200" /></figure><div className="third-place">03<sup>rd</sup></div></div></div>
      </section>

      <section className="academy section-pad" id="academy" aria-labelledby="academy-title">
        <div className="academy-backdrop" aria-hidden="true">ACADEMY</div><div className="academy-portrait reveal-image"><img src="/assets/founder-grey.webp" alt="Paola, PaoLash educator" loading="lazy" width="760" height="1045" /></div>
        <div className="academy-content"><SectionLabel number="05" light>PAOLASH ACADEMY</SectionLabel><h2 id="academy-title" className="split-text">Build your hand.<br />Find your signature.</h2><p className="reveal">Eyelash extension education for artists who want strong foundations, refined technique and the confidence to create distinctive work.</p><div className="academy-tags reveal">{["Classic", "Hybrid", "Volume", "Wispy"].map((tag) => <span key={tag}>{tag}</span>)}</div><a className="pill pill-light reveal" href="mailto:support@paolash.com?subject=PaoLash%20Academy%20interest">Join the academy list</a></div>
      </section>

      <section className="policies section-pad" aria-labelledby="policies-title">
        <SectionLabel number="06">BEFORE YOU ARRIVE</SectionLabel>
        <div className="policies-grid"><div><h2 id="policies-title" className="billboard billboard-small">GOOD TO <em>KNOW</em></h2><p className="policy-lead reveal">A smooth appointment starts before you reach the studio. Here are the essentials.</p></div><Accordion className="policy-accordion" defaultValue={["policy-0"]} multiple>{policies.map((policy, index) => <AccordionItem className="policy-item reveal" key={policy.title} value={`policy-${index}`}><AccordionTrigger className="policy-trigger"><span><b>0{index + 1}</b>{policy.title}</span></AccordionTrigger><AccordionContent className="policy-content"><p>{policy.text}</p></AccordionContent></AccordionItem>)}</Accordion></div>
      </section>

      <section className="book-banner" id="visit"><div className="book-curve" aria-hidden="true" /><div className="book-content"><p className="reveal">YOUR NEXT SET STARTS HERE</p><h2 className="split-text">Ready to meet your lashes?</h2><BookingLink className="book-orb"><span>BOOK<br />NOW</span><i>↗</i></BookingLink></div></section>
    </main>

    <footer className="footer"><div className="footer-top"><Brand footer /><p>65 William St S<br />Dublin 2 · D02 AW81</p><div className="footer-contact"><a href="tel:+353838119207">083 811 9207</a><a href="mailto:support@paolash.com">support@paolash.com</a></div><div className="socials"><a href="https://www.instagram.com/paolash_lounge?igsh=ZDA1endnazVoaWp2" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@paolash_0" target="_blank" rel="noreferrer">TikTok</a><a href="https://wa.me/353838119207" target="_blank" rel="noreferrer">WhatsApp</a></div></div><div className="footer-word" aria-hidden="true">PAOLASH</div><div className="footer-bottom"><span>© 2026 PaoLash</span><span>Made for eyes that speak first.</span><a href="#top">Back to top ↑</a></div></footer>
  </>;
}
