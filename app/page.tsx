"use client";

import { useEffect, useRef, useState } from "react";

const BOOKING_URL = "https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624";

const looks = [
  { title: "Russian Volume", detail: "Airy · dimensional", image: "/assets/lash-russian.webp", className: "look-card--tall" },
  { title: "Eyeliner Effect", detail: "Lifted · sculpted", image: "/assets/lash-line.webp", className: "look-card--wide" },
  { title: "Wispy Hybrid", detail: "Soft · textured", image: "/assets/lash-hybrid.webp", className: "look-card--square" },
  { title: "Lash Lift", detail: "Natural · elevated", image: "/assets/lash-lift.webp", className: "look-card--small" },
];

const appointmentNotes = [
  { number: "01", title: "Reserve", text: "A €20 deposit confirms your time and comes off your final balance." },
  { number: "02", title: "Prepare", text: "Arrive with clean eyes—no mascara, oils, strip lashes or lash glue." },
  { number: "03", title: "Patch test", text: "First visit? Arrange your patch test up to 48 hours beforehand." },
  { number: "04", title: "Change plans", text: "Give us 48 hours when moving or cancelling an appointment." },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d={diagonal ? "M7 17 17 7M8 7h9v9" : "M5 12h14M14 7l5 5-5 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookingLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <a className={className} href={BOOKING_URL} target="_blank" rel="noreferrer">{children}</a>;
}

function Logo({ footer = false }: { footer?: boolean }) {
  return <a className={`logo ${footer ? "logo--footer" : ""}`} href="#top" aria-label="PaoLash home"><img src="/assets/logo.webp" alt="PaoLash Lounge & Academy" width="322" height="240" /></a>;
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={`eyebrow reveal ${dark ? "eyebrow--dark" : ""}`}><span />{children}</p>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal, .image-reveal, .line-reveal").forEach((element) => observer.observe(element));

    const onScroll = () => {
      const maximum = document.documentElement.scrollHeight - innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${maximum > 0 ? scrollY / maximum : 0})`;
      if (heroImageRef.current && innerWidth > 760) heroImageRef.current.style.transform = `translate3d(0, ${Math.min(scrollY * 0.08, 56)}px, 0)`;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (cursorRef.current && event.pointerType !== "touch") cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const cursorTargets = document.querySelectorAll<HTMLElement>("[data-cursor]");
    const enter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      cursorRef.current?.classList.add("is-active");
      const text = cursorRef.current?.querySelector("span");
      if (text) text.textContent = target.dataset.cursor || "View";
    };
    const leave = () => cursorRef.current?.classList.remove("is-active");
    cursorTargets.forEach((target) => { target.addEventListener("pointerenter", enter); target.addEventListener("pointerleave", leave); });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onPointerMove, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointerMove);
      cursorTargets.forEach((target) => { target.removeEventListener("pointerenter", enter); target.removeEventListener("pointerleave", leave); });
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="page-progress" aria-hidden="true"><span ref={progressRef} /></div>
    <div className="cursor" ref={cursorRef} aria-hidden="true"><span>View</span></div>

    <header className="site-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Primary navigation"><a href="#artistry">Artistry</a><a href="#about">About</a><a href="#academy">Academy</a><a href="#visit">Visit</a></nav>
      <div className="header-actions"><BookingLink className="nav-book">Book a visit <Arrow /></BookingLink><button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}><span>{menuOpen ? "Close" : "Menu"}</span><i /><i /></button></div>
    </header>

    <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} id="mobile-menu" aria-hidden={!menuOpen}>
      <Logo />
      <nav aria-label="Mobile navigation">{["artistry", "about", "academy", "visit"].map((item, index) => <a href={`#${item}`} key={item} onClick={() => setMenuOpen(false)}><small>0{index + 1}</small>{item}</a>)}</nav>
      <BookingLink className="button button--gold">Reserve your appointment <Arrow /></BookingLink>
    </div>

    <main id="main">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-kicker"><span>Dublin 2</span><span>By Paola Gutierrez</span></p>
          <h1 id="hero-title"><span className="line-reveal">Quiet luxury.</span><span className="line-reveal"><em>Unmissable</em> eyes.</span></h1>
          <p className="hero-intro reveal">Bespoke lash artistry shaped to your features, your rhythm and your idea of beautiful.</p>
          <div className="hero-actions reveal"><BookingLink className="button button--gold">Book your set <Arrow /></BookingLink><a className="text-action" href="#artistry">View the work <span>↓</span></a></div>
        </div>
        <div className="hero-visual" ref={heroImageRef}>
          <div className="hero-frame image-reveal" data-cursor="Book"><img src="/assets/hero.webp" alt="Paola, founder and lash artist at PaoLash" width="900" height="1351" fetchPriority="high" /></div>
          <div className="hero-monogram" aria-hidden="true">P</div>
          <div className="hero-card hero-card--detail image-reveal"><img src="/assets/lash-line.webp" alt="Sculpted eyeliner-effect lashes" width="900" height="948" /><span>Signature mapping</span></div>
          <div className="hero-card hero-card--award reveal"><strong>03</strong><span>International<br />Wispy Style<br />Dubai</span></div>
        </div>
        <div className="hero-footer" aria-hidden="true"><span>01 — Lash atelier</span><span>Scroll to discover</span></div>
      </section>

      <section className="statement" id="about">
        <Eyebrow dark>Our point of view</Eyebrow>
        <div className="statement-grid"><h2 className="line-reveal">Not a template.<br /><em>A composition.</em></h2><div className="statement-copy reveal"><p>Every set begins with the person, not the trend. Eye shape, movement and mood lead the design.</p><span>Precise. Personal. Effortless.</span></div></div>
      </section>

      <section className="work" id="artistry" aria-labelledby="work-title">
        <div className="section-head"><Eyebrow>Selected artistry</Eyebrow><h2 className="line-reveal" id="work-title">The PaoLash edit</h2><p className="reveal">Four signatures. Every detail tailored.</p></div>
        <div className="look-grid">{looks.map((look, index) => <article className={`look-card ${look.className} image-reveal`} key={look.title} data-cursor="Explore"><img src={look.image} alt={`${look.title} lash look`} width="900" height="950" loading="lazy" /><div className="look-shade" /><span className="look-number">0{index + 1}</span><div className="look-info"><p>{look.detail}</p><h3>{look.title}</h3></div><i><Arrow diagonal /></i></article>)}</div>
        <div className="work-footer reveal"><p>Classic · Wet effect · Brown set · Anime · Fox eye · Brow lamination</p><BookingLink className="text-action text-action--light">Discover every service <Arrow diagonal /></BookingLink></div>
      </section>

      <section className="founder" aria-labelledby="founder-title">
        <div className="founder-gallery"><figure className="founder-main image-reveal"><img src="/assets/founder-night.webp" alt="Paola Gutierrez, founder of PaoLash" width="760" height="1049" loading="lazy" /></figure><figure className="founder-detail image-reveal"><img src="/assets/lash-classic.webp" alt="Fine classic lash work" width="900" height="900" loading="lazy" /></figure><div className="founder-mark" aria-hidden="true">PG</div></div>
        <div className="founder-copy"><Eyebrow dark>Meet the artist</Eyebrow><h2 className="line-reveal" id="founder-title">An eye for what<br /><em>makes you, you.</em></h2><p className="reveal">Paola brings an editorial eye and a technician’s precision to every appointment—creating lashes that feel considered, never copied.</p><div className="founder-signature reveal"><strong>Paola G.</strong><span>Founder · Lash Artist · Educator</span></div></div>
      </section>

      <section className="recognition" aria-labelledby="recognition-title">
        <div className="recognition-copy"><Eyebrow>International recognition</Eyebrow><p className="award-place reveal">03<sup>rd</sup></p><h2 className="line-reveal" id="recognition-title">Awarded in Dubai.<br /><em>Refined in Dublin.</em></h2><p className="recognition-note reveal">Wispy Style · International Lash Competition</p></div>
        <div className="award-gallery"><figure className="award-photo image-reveal"><img src="/assets/trophy.webp" alt="PaoLash international lash competition trophy" width="900" height="1200" loading="lazy" /></figure><figure className="certificate image-reveal"><img src="/assets/award.webp" alt="Third place Wispy Style certificate awarded to Paola Gutierrez" width="720" height="1019" loading="lazy" /></figure></div>
      </section>

      <section className="academy" id="academy" aria-labelledby="academy-title">
        <figure className="academy-image image-reveal"><img src="/assets/founder-grey.webp" alt="Paola, PaoLash educator" width="760" height="1045" loading="lazy" /></figure>
        <div className="academy-copy"><Eyebrow>The academy</Eyebrow><h2 className="line-reveal" id="academy-title">Technique gives you confidence.<br /><em>Vision makes it yours.</em></h2><p className="reveal">Focused education for artists ready to build strong foundations, refine their hand and develop a signature.</p><a className="button button--outline reveal" href="mailto:support@paolash.com?subject=PaoLash%20Academy%20interest">Explore the academy <Arrow /></a></div>
        <div className="academy-word" aria-hidden="true">PAOLA</div>
      </section>

      <section className="visit" id="visit" aria-labelledby="visit-title">
        <div className="visit-heading"><Eyebrow dark>Before your visit</Eyebrow><h2 className="line-reveal" id="visit-title">A little prep.<br /><em>A flawless appointment.</em></h2></div>
        <div className="notes-rail">{appointmentNotes.map((note) => <article className="note-card reveal" key={note.number}><span>{note.number}</span><div><h3>{note.title}</h3><p>{note.text}</p></div></article>)}</div>
      </section>

      <section className="final-cta" aria-labelledby="final-title">
        <div className="final-cta-image" aria-hidden="true"><img src="/assets/lash-hybrid.webp" alt="" width="900" height="905" loading="lazy" /></div><div className="final-cta-shade" />
        <div className="final-cta-copy"><p className="reveal">Your next signature set</p><h2 className="line-reveal" id="final-title">Let your eyes<br /><em>speak first.</em></h2><BookingLink className="cta-disc"><span>Book<br />PaoLash</span><Arrow diagonal /></BookingLink></div>
      </section>
    </main>

    <footer className="footer"><div className="footer-main"><Logo footer /><div><span>Studio</span><p>65 William St S<br />Dublin 2 · D02 AW81</p></div><div><span>Contact</span><a href="tel:+353838119207">083 811 9207</a><a href="mailto:support@paolash.com">support@paolash.com</a></div><div><span>Follow</span><a href="https://www.instagram.com/paolash_lounge?igsh=ZDA1endnazVoaWp2" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.tiktok.com/@paolash_0" target="_blank" rel="noreferrer">TikTok ↗</a></div></div><div className="footer-rule" /><div className="footer-bottom"><p>© 2026 PaoLash Lounge & Academy</p><p>Bespoke lash artistry in Dublin</p><a href="#top">Back to top ↑</a></div></footer>
  </>;
}
