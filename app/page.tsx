"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const BOOKING_URL = "https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624";
const LOGO = "/assets/paolash-logo-transparent.png";
const services = [
  { name: "Wispy hybrid", note: "Softness, with a little intrigue.", image: "lash-hybrid.webp", alt: "A real PaoLash wispy hybrid set", mood: "The soft statement" },
  { name: "Russian volume", note: "Full, featherlight, unmistakable.", image: "lash-russian.webp", alt: "Full Russian volume lashes by PaoLash", mood: "The main character" },
  { name: "Eyeliner effect", note: "A lifted line. A lasting impression.", image: "lash-line.webp", alt: "A sculpted eyeliner effect lash set", mood: "The quiet confidence" },
  { name: "Lash lift", note: "Your own lashes, beautifully lifted.", image: "lash-lift.webp", alt: "Before and after a PaoLash lash lift", mood: "The natural beauty" },
];
const policies = [
  { title: "Booking & deposits", text: "A €20 non-refundable deposit secures your appointment and is deducted from your salon balance. Please arrive on time; after 10 minutes, a €10 late fee or cancellation may apply." },
  { title: "Your first appointment", text: "New clients need a patch test up to 48 hours before their appointment. Arrive without eye makeup, mascara, oils, strip lashes or lash glue. A cleaning fee may apply if removal is needed." },
  { title: "Changing your appointment", text: "Please cancel or reschedule at least 48 hours in advance. Late changes may require full payment before another booking." },
  { title: "Finding the studio", text: "Find PaoLash at 65 William St S, Dublin 2, D02 AW81. For help with your appointment, call 083 811 9207 or email support@paolash.com." },
];

function Arrow({ down = false }: { down?: boolean }) {
  return <svg className={down ? "arrow arrow-down" : "arrow"} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BookingLink({ children, className = "button" }: { children: ReactNode; className?: string }) {
  return <a className={className} href={BOOKING_URL} target="_blank" rel="noreferrer">{children}<Arrow /></a>;
}
function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand${footer ? " brand-footer" : ""}`} href="#top" aria-label="PaoLash home"><Image unoptimized src={LOGO} alt="PaoLash" width="1254" height="1254" /></a>;
}
function Label({ children, number }: { children: ReactNode; number?: string }) {
  return <p className="eyebrow" data-reveal>{number && <span className="section-number">{number}</span>}{children}</p>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const collectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = matchMedia("(min-width: 1024px) and (min-height: 800px)");
    let frame = 0;
    let pinned = false;
    let travel = 0;
    let range = 0;
    const movingImages = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    root.querySelectorAll("[data-reveal], [data-image-reveal]").forEach((element) => observer.observe(element));
    root.classList.add("motion-ready");

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const collectionTop = collectionRef.current?.getBoundingClientRect().top ?? 0;
      const heroHeight = heroRef.current?.offsetHeight ?? innerHeight;
      const positions = movingImages.map((element) => ({ element, rect: element.getBoundingClientRect() }));
      headerRef.current?.classList.toggle("is-scrolled", y > 40);
      if (!motionQuery.matches) {
        heroRef.current?.style.setProperty("--hero-shift", `${Math.min(y, heroHeight) * 0.13}px`);
        positions.forEach(({ element, rect }) => {
          if (rect.bottom > 0 && rect.top < innerHeight) element.style.setProperty("--image-shift", `${(innerHeight / 2 - rect.top - rect.height / 2) / innerHeight * 45}px`);
        });
      }
      if (pinned && trackRef.current && range > 0) {
        const progress = Math.min(1, Math.max(0, -collectionTop / range));
        trackRef.current.style.transform = `translate3d(${-travel * progress}px, 0, 0)`;
        setActiveService(Math.min(3, Math.round(progress * 3)));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      pinned = desktopQuery.matches && !motionQuery.matches;
      const section = collectionRef.current;
      const rail = railRef.current;
      const track = trackRef.current;
      if (section && rail && track) {
        section.classList.toggle("is-pinned", pinned);
        track.style.transform = "";
        travel = Math.max(0, track.scrollWidth - rail.clientWidth + parseFloat(getComputedStyle(rail).paddingLeft) * 2);
        range = travel * 1.5;
        section.style.setProperty("--collection-travel", `${range}px`);
        if (pinned) rail.scrollLeft = 0;
      }
      schedule();
    };
    const resizeObserver = new ResizeObserver(measure);
    if (railRef.current) resizeObserver.observe(railRef.current);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", measure, { passive: true });
    motionQuery.addEventListener("change", measure);
    desktopQuery.addEventListener("change", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", measure);
      motionQuery.removeEventListener("change", measure);
      desktopQuery.removeEventListener("change", measure);
      root.classList.remove("motion-ready");
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const links = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
      const elements = [menuButtonRef.current, ...links].filter((element): element is HTMLElement => !!element);
      if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements[elements.length - 1]?.focus(); }
      if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) { event.preventDefault(); elements[0]?.focus(); }
    };
    addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = originalOverflow;
      removeEventListener("keydown", keydown);
      menuButton?.focus();
    };
  }, [menuOpen]);

  function selectService(index: number) {
    const section = collectionRef.current;
    const rail = railRef.current;
    const track = trackRef.current;
    if (!section || !rail || !track) return;
    const next = Math.max(0, Math.min(services.length - 1, index));
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (section.classList.contains("is-pinned")) {
      const range = Math.max(0, track.scrollWidth - rail.clientWidth + parseFloat(getComputedStyle(rail).paddingLeft) * 2) * 1.5;
      window.scrollTo({ top: section.getBoundingClientRect().top + scrollY + range * next / 3, behavior });
    } else {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      rail.scrollTo({ left: maxScroll * next / 3, behavior });
    }
    setActiveService(next);
  }

  return <div className="site" ref={pageRef}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={`site-header${menuOpen ? " menu-is-open" : ""}`} ref={headerRef}>
      <Brand />
      <nav className="desktop-nav" aria-label="Primary navigation"><a href="#services">The collection</a><a href="#story">The artist</a><a href="#academy">Academy</a><a href="#visit">Find us</a></nav>
      <div className="header-actions"><BookingLink className="button button-header">Book an appointment</BookingLink><button ref={menuButtonRef} className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((value) => !value)}><span>{menuOpen ? "Close" : "Menu"}</span><i /><i /></button></div>
    </header>
    <div ref={menuRef} className={`menu-panel leather${menuOpen ? " is-open" : ""}`} id="mobile-menu" inert={!menuOpen} role="dialog" aria-modal={menuOpen ? true : undefined} aria-label="Navigation">
      <p className="eyebrow">PaoLash · Dublin</p>
      <nav aria-label="Mobile navigation">{[{ id: "services", name: "The collection" }, { id: "story", name: "The artist" }, { id: "academy", name: "The academy" }, { id: "visit", name: "Find us" }].map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item.name}<Arrow /></a>)}</nav>
      <BookingLink>Make time for yourself</BookingLink><p className="menu-address">65 William St S · Dublin 2</p>
    </div>
    <main id="main" inert={menuOpen}>
      <section className="hero leather" id="top" ref={heroRef} aria-labelledby="hero-title">
        <div className="hero-topline"><span>Lash & brow atelier</span><span>Dublin, Ireland</span></div>
        <div className="hero-heading"><p className="eyebrow hero-enter">A personal kind of beautiful</p><h1 id="hero-title"><span className="line"><span>The art of</span></span><span className="line"><em>being you.</em></span></h1><div className="hero-note hero-enter"><p>Bespoke lashes. Considered brows.<br />An expression that’s entirely yours.</p><BookingLink className="button button-cream">Find your signature</BookingLink></div></div>
        <div className="hero-portrait" aria-hidden="true"><Image unoptimized src="/assets/hero.webp" alt="" width="900" height="1351" fetchPriority="high" /></div>
        <div className="hero-bottom"><span>By Paola Gutierrez</span><a href="#services">A closer look<Arrow down /></a><span className="hero-edition">Lounge & academy</span></div>
      </section>

      <section className="collection" id="services" ref={collectionRef} aria-labelledby="collection-title"><div className="collection-sticky">
        <div className="collection-heading section-shell"><div><Label number="01">The signature collection</Label><h2 id="collection-title" data-reveal>Your eyes.<br className="mobile-break" /> <em>Your signature.</em></h2></div><p className="collection-intro" data-reveal>Four expressions.<br />Always tailored to you.</p></div>
        <div className="collection-rail" ref={railRef} onScroll={() => {
          if (collectionRef.current?.classList.contains("is-pinned")) return;
          const rail = railRef.current;
          if (rail) {
            const max = rail.scrollWidth - rail.clientWidth;
            setActiveService(max > 0 ? Math.min(3, Math.round(rail.scrollLeft / max * 3)) : 0);
          }
        }}><div className="collection-track" ref={trackRef}>{services.map((service, index) => <a className="look-card" key={service.name} href={BOOKING_URL} target="_blank" rel="noreferrer" onFocus={() => {
          const rect = (trackRef.current?.children[index] as HTMLElement)?.getBoundingClientRect();
          if (rect && (rect.left < 0 || rect.right > innerWidth)) selectService(index);
        }} aria-label={`Book ${service.name} on Fresha`}><div className="look-card-top"><span>0{index + 1}</span><span>{service.mood}</span></div><div className="look-image"><Image unoptimized src={`/assets/${service.image}`} alt={service.alt} width="900" height="950" loading="lazy" /></div><div className="look-caption"><div><h3>{service.name}</h3><p>{service.note}</p></div><Arrow /></div></a>)}</div></div>
        <div className="collection-bottom section-shell"><div className="collection-pagination"><span>0{activeService + 1}<span className="muted"> / 04</span></span><div className="collection-line"><span style={{ transform: `translateX(${activeService * 100}%)` }} /></div><div className="gallery-buttons"><button type="button" onClick={() => selectService(activeService - 1)} disabled={activeService === 0} aria-label="Previous look"><Arrow /></button><button type="button" onClick={() => selectService(activeService + 1)} disabled={activeService === 3} aria-label="Next look"><Arrow /></button></div></div><BookingLink className="text-link">The full service menu</BookingLink></div>
      </div></section>

      <section className="artist leather" id="story" aria-labelledby="artist-title"><div className="artist-layout section-shell">
        <div className="artist-visual" data-image-reveal><div className="artist-portrait" data-parallax><Image unoptimized src="/assets/founder-night.webp" alt="Paola Gutierrez, the artist behind PaoLash" width="760" height="1049" loading="lazy" /></div><div className="artist-caption"><span>Meet your artist</span><span>Paola Gutierrez</span></div></div>
        <div className="artist-copy"><Label number="02">The eye behind the artistry</Label><h2 id="artist-title" data-reveal>Beauty is<br />in the <em>individual.</em></h2><p className="body-copy" data-reveal>Your eye shape. Your expression. Your way of being. Paola brings a precise hand and a personal eye to every set.</p><span className="signature" data-reveal>Paola G.</span><p className="artist-role" data-reveal>Founder · Lash artist · Educator</p></div>
      </div></section>

      <section className="credentials section-shell" aria-labelledby="recognition-title">
        <div className="credentials-intro"><Label number="03">International recognition</Label><h2 id="recognition-title" data-reveal>Recognised<br />for the <em>craft.</em></h2><p data-reveal>Third place · Creative Effects<br />Lash Star Elite · Dubai, 2025</p></div>
        <figure className="proof-card" data-reveal><a href="/assets/award.webp" target="_blank" rel="noreferrer" aria-label="View the complete competition certificate"><Image unoptimized src="/assets/award.webp" alt="Complete certificate: Paola Gutierrez, third place, Creative Effects, Master category, Lash Star Elite Dubai 2025" width="720" height="1019" loading="lazy" /><span>View certificate<Arrow /></span></a></figure>
        <figure className="proof-card" data-reveal><a href="/assets/trophy.webp" target="_blank" rel="noreferrer" aria-label="View the full competition trophy photograph"><Image unoptimized src="/assets/trophy.webp" alt="Full photograph of Paola’s trophy at the Dubai competition" width="900" height="1200" loading="lazy" /><span>The moment in Dubai<Arrow /></span></a></figure>
      </section>
      <section className="detail-section section-shell" aria-labelledby="detail-title">
        <div className="detail-heading"><Label number="04">A closer look</Label></div>
        <div className="detail-canvas" data-reveal><div className="detail-photo"><Image unoptimized src="/assets/lash-classic.webp" alt="A complete, uncropped photograph of a PaoLash classic lash set" width="900" height="900" loading="lazy" /></div><div className="detail-copy"><h2 id="detail-title">Every detail.<br /><em>Considered.</em></h2><p>Careful mapping. Weightless feel.<br />Beautifully you.</p><div className="care-product"><Image unoptimized src="/assets/aftercare.webp" alt="The complete PaoLash lash aftercare kit" width="700" height="805" loading="lazy" /><div><span className="eyebrow">The finishing touch</span><p>Keep your set at its best.<br />Ask about your aftercare ritual.</p></div></div></div></div>
      </section>

      <section className="academy section-shell" id="academy" aria-labelledby="academy-title"><div className="academy-panel leather"><div className="academy-copy"><Label number="05">PaoLash academy</Label><h2 id="academy-title" data-reveal>Good hands.<br /><em>Great possibilities.</em></h2><p className="body-copy" data-reveal>Learn the technique. Develop your eye.<br />Find the confidence to make it your own.</p><p className="academy-disciplines" data-reveal>Classic <span>·</span> Hybrid <span>·</span> Volume <span>·</span> Wispy</p><a className="button button-cream" data-reveal href="mailto:support@paolash.com?subject=PaoLash%20Academy%20interest">Discover the academy<Arrow /></a></div><figure className="academy-media" data-reveal><Image unoptimized src="/assets/lash-line.webp" alt="A complete photograph of PaoLash’s eyeliner effect lash work" width="900" height="948" loading="lazy" /><figcaption>The craft, up close.<span>Real PaoLash work</span></figcaption></figure></div></section>

      <section className="essentials section-shell" aria-labelledby="essentials-title"><div className="essentials-heading"><Label number="06">Before your visit</Label><h2 id="essentials-title" data-reveal>A few<br /> <em>little details.</em></h2></div><Accordion className="policy-accordion" type="single" collapsible>{policies.map((policy, index) => <AccordionItem className="policy-item" key={policy.title} value={`policy-${index}`} data-reveal><AccordionTrigger className="policy-trigger"><span><b>0{index + 1}</b>{policy.title}</span></AccordionTrigger><AccordionContent className="policy-content"><p>{policy.text}</p></AccordionContent></AccordionItem>)}</Accordion></section>
    </main>

    <footer className="footer leather" id="visit" inert={menuOpen}>
      <div className="footer-invitation section-shell"><div><Label>Your time. Your signature.</Label><h2 data-reveal>A little time<br /><em>for yourself.</em></h2><BookingLink className="button button-cream">Reserve your appointment</BookingLink></div><div className="brand-object" data-image-reveal><Image unoptimized src="/assets/paolash-burgundy-logo.png" alt="The PaoLash champagne monogram on burgundy leather" width="1254" height="1254" loading="lazy" /><span>PaoLash · An eye for the individual</span></div></div>
      <div className="footer-details section-shell"><Brand footer /><div><span className="footer-label">The studio</span><a href="https://www.google.com/maps/search/?api=1&query=65+William+St+S+Dublin+2+D02+AW81" target="_blank" rel="noreferrer">65 William St S<br />Dublin 2 · D02 AW81<Arrow /></a></div><div><span className="footer-label">Say hello</span><a href="tel:+353838119207">083 811 9207</a><a href="mailto:support@paolash.com">support@paolash.com</a></div><div><span className="footer-label">Follow the artistry</span><a href="https://www.instagram.com/paolash_lounge" target="_blank" rel="noreferrer">Instagram<Arrow /></a><a href="https://www.tiktok.com/@paolash_0" target="_blank" rel="noreferrer">TikTok<Arrow /></a><a href="https://wa.me/353838119207" target="_blank" rel="noreferrer">WhatsApp<Arrow /></a></div></div>
      <div className="footer-bottom section-shell"><span>© {new Date().getFullYear()} PaoLash Lounge & Academy</span><span>Made for eyes that speak first.</span><a href="#top">Back to the beginning<Arrow /></a></div>
    </footer>
  </div>;
}
