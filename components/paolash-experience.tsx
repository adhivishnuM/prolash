"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useEditorialMotion } from "@/hooks/use-editorial-motion";

const BOOKING_URL = "https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624";
const LOGO = "/assets/paolash-paper-logo.png";
const services = [
  { name: "Wispy hybrid", note: "Softness, with a little intrigue.", image: "lash-hybrid.webp", mood: "Soft & expressive" },
  { name: "Russian volume", note: "Full, featherlight, unmistakable.", image: "lash-russian.webp", mood: "Full & featherlight" },
  { name: "Eyeliner effect", note: "A lifted line. A lasting impression.", image: "lash-line.webp", mood: "Lifted & sculpted" },
  { name: "Lash lift", note: "Your own lashes, beautifully lifted.", image: "lash-lift.webp", mood: "Naturally yours" },
];
const policies = [
  { title: "Booking & deposits", text: "A €20 non-refundable deposit secures your appointment and is deducted from your salon balance. Please arrive on time; after 10 minutes, a €10 late fee or cancellation may apply." },
  { title: "Your first appointment", text: "New clients need a patch test up to 48 hours before their appointment. Arrive without eye makeup, mascara, oils, strip lashes or lash glue. A cleaning fee may apply if removal is needed." },
  { title: "Changing your appointment", text: "Please cancel or reschedule at least 48 hours in advance. Late changes may require full payment before another booking." },
  { title: "Finding the studio", text: "Find PaoLash at 65 William St S, Dublin 2, D02 AW81. For help with your appointment, call 083 811 9207 or email support@paolash.com." },
];
const navigation = [{ id: "services", name: "The collection" }, { id: "story", name: "The artist" }, { id: "academy", name: "Academy" }, { id: "visit", name: "Visit us" }];
const statement = "Every eye is different. Every set should be, too.".split(" ");
const delay = (index: number) => ({ "--delay": `${index * 85}ms` } as CSSProperties);

function Arrow({ down = false }: { down?: boolean }) {
  return <svg className={`arrow${down ? " arrow-down" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BookingLink({ children, className = "button" }: { children: ReactNode; className?: string }) {
  return <a className={className} href={BOOKING_URL} target="_blank" rel="noreferrer"><span>{children}</span><Arrow /></a>;
}
function Brand() { return <a className="brand" href="#top" aria-label="PaoLash home"><Image unoptimized src={LOGO} alt="PaoLash" width={1536} height={1024} /></a>; }
function Label({ children }: { children: ReactNode; number?: string }) { return <p className="eyebrow" data-reveal>{children}</p>; }
function Heading({ children, id }: { children: ReactNode; id: string }) { return <h2 id={id} className="display" data-reveal="type">{children}</h2>; }

export default function PaoLashExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLook, setSelectedLook] = useState(0);
  const notesRef = useRef<HTMLDialogElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEditorialMotion(pageRef);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 1000px)");
    const syncLayout = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    syncLayout();
    desktop.addEventListener("change", syncLayout);
    return () => {
      desktop.removeEventListener("change", syncLayout);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const links = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
      const elements = [menuButton, ...links].filter((element): element is HTMLElement => !!element);
      if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1)?.focus(); }
      if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0]?.focus(); }
    };
    addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = originalOverflow; removeEventListener("keydown", keydown); menuButton?.focus(); };
  }, [menuOpen]);

  return <div className="site" ref={pageRef}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={`site-header${menuOpen ? " menu-is-open" : ""}`}>
      <div inert={menuOpen}><Brand /></div>
      <nav className="desktop-nav" aria-label="Primary navigation" inert={menuOpen}>{navigation.map((item) => <a href={`#${item.id}`} key={item.id}>{item.name}</a>)}</nav>
      <div className="header-actions"><BookingLink className="header-booking">Book a visit</BookingLink><button ref={menuButtonRef} className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((value) => !value)}><span>{menuOpen ? "Close" : "Menu"}</span><i /><i /></button></div>
    </header>
    <div ref={menuRef} className={`menu-panel leather${menuOpen ? " is-open" : ""}`} id="mobile-menu" inert={!menuOpen} role="dialog" aria-modal={menuOpen ? true : undefined} aria-label="Navigation">
      <p className="eyebrow">PaoLash · Dublin</p><nav aria-label="Mobile navigation">{navigation.map((item, index) => <a key={item.id} href={`#${item.id}`} style={delay(index)} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item.name}<Arrow /></a>)}</nav>
      <BookingLink className="button button-light">Make time for yourself</BookingLink><p className="menu-address">65 William St S · Dublin 2</p>
    </div>
    <main id="main" inert={menuOpen}>
      <section className="hero" id="top" data-scene="hero" aria-labelledby="hero-title">
        <p className="hero-location">Lash artistry · Dublin</p>
        <div className="hero-masthead" aria-hidden="true"><span>PAO</span><span>LASH</span></div>
        <div className="hero-portrait"><Image unoptimized src="/assets/hero.webp" alt="Paola Gutierrez, founder of PaoLash" width={900} height={1351} priority /></div>
        <div className="hero-intro"><h1 className="hero-title" id="hero-title"><span className="hero-line"><span>Entirely</span></span><span className="hero-line"><em>you.</em></span></h1><BookingLink className="button button-wine">Find your look</BookingLink></div>
      </section>

      <section className="collection" id="services" aria-labelledby="collection-title">
        <div className="collection-editorial">
          <div className="collection-heading shell"><h2 id="collection-title" data-reveal="type">The lash edit.</h2><p className="collection-hint" data-reveal>Four ways to make it yours.</p></div>
          <div className="lash-gallery shell" data-reveal>
            <figure className="lash-exhibit" aria-live="polite">
              <div className="lash-exhibit-image" key={services[selectedLook].image}><Image unoptimized src={`/assets/${services[selectedLook].image}`} alt={`PaoLash ${services[selectedLook].name.toLowerCase()} lash work, shown in full`} width={900} height={950} loading="eager" /></div>
              <figcaption><h3>{services[selectedLook].name}</h3><p>{services[selectedLook].note}</p></figcaption>
            </figure>
            <div className="lash-index" role="group" aria-label="Choose a lash treatment">
              <p className="lash-index-label">Explore the looks <Arrow down /></p>
              {services.map((service,index) => <button className="lash-option" key={service.name} type="button" aria-pressed={index === selectedLook} onClick={() => setSelectedLook(index)}><Image unoptimized src={`/assets/${service.image}`} alt="" width={90} height={95} /><span className="lash-option-copy"><span>{service.name}</span><small>{index === selectedLook ? "Now viewing" : "View look"}</small></span><Arrow /></button>)}
            </div>
          </div>
        </div>
      </section>

      <section className="artist shell" id="story" data-scene="artist" aria-labelledby="artist-title"><div className="artist-top"><Label number="02">The artist, the individual</Label><span className="edition-note" data-reveal>A personal point of view</span></div><div className="artist-layout"><figure className="artist-visual" data-unfold><div className="artist-portrait"><Image unoptimized src="/assets/founder-night.webp" alt="Paola Gutierrez, the artist behind PaoLash" width={760} height={1049} loading="lazy" /></div><figcaption>Paola Gutierrez <span>Founder & educator</span></figcaption></figure><div className="artist-copy"><h2 id="artist-title" className="artist-statement">{statement.map((word, index) => <span data-word key={index}>{word}{" "}</span>)}</h2><p data-reveal>Your shape, your features, your way of being.<br />That’s where every PaoLash set begins.</p><div className="artist-signoff" data-reveal><span className="signature">Paola G.</span><span>Made with intention.<br />Always by hand.</span></div></div></div></section>

      <section className="recognition shell" id="recognition" data-scene="recognition" aria-labelledby="recognition-title"><div className="recognition-copy"><Label number="03">Beyond the studio</Label><Heading id="recognition-title">A little<br /><em>recognition.</em></Heading><div className="award-number" data-reveal>3<sup>rd</sup></div><p data-reveal>Creative Effects · Master category<br />Lash Star Elite, Dubai · 2025</p></div><div className="recognition-gallery"><figure className="proof proof-certificate"><a href="/assets/award.webp" target="_blank" rel="noreferrer"><div className="proof-mat"><Image unoptimized src="/assets/award.webp" alt="Full competition certificate: Paola Gutierrez, third place, Creative Effects, Master category, Lash Star Elite Dubai 2025" width={720} height={1019} loading="lazy" /></div><figcaption><span>The recognition</span><span>View certificate <Arrow /></span></figcaption></a></figure><figure className="proof proof-trophy"><a href="/assets/trophy.webp" target="_blank" rel="noreferrer"><div className="proof-mat"><Image unoptimized src="/assets/trophy.webp" alt="Paola’s trophy at the Dubai competition, shown in full" width={900} height={1200} loading="lazy" /></div><figcaption><span>The moment</span><span>Dubai, 2025 <Arrow /></span></figcaption></a></figure></div></section>

      <section className="ritual" data-scene="detail" aria-labelledby="detail-title">
        <div className="ritual-caption shell"><Label>The PaoLash ritual</Label><span>Care, beyond the studio.</span></div>
        <div className="ritual-poster">
          <h2 id="detail-title"><span>AFTER</span><span>CARE.</span></h2>
          <figure className="ritual-product"><Image unoptimized src="/assets/aftercare.webp" alt="PaoLash’s complete lash aftercare kit" width={700} height={805} loading="lazy" /></figure>
          <div className="ritual-note"><span className="ritual-note-line" aria-hidden="true" /><p>Your daily ritual.<br />Our finishing touch.</p></div>
          <p className="ritual-footnote">Ask your artist about<br />caring for your set.</p>
        </div>
      </section>

      <section className="academy" id="academy" data-scene="academy" aria-labelledby="academy-title">
        <div className="academy-intro shell"><Label>For the next generation of artists</Label><h2 id="academy-title">The art.<br /><em>In your hands.</em></h2><p>PaoLash Academy<br />Learn with Paola Gutierrez.</p></div>
        <div className="academy-contact-sheet" aria-label="Lash artistry taught at PaoLash Academy">
          <figure className="academy-study study-one"><Image unoptimized src="/assets/lash-classic.webp" alt="Classic lash technique by PaoLash" width={900} height={900} loading="lazy" /><figcaption>The foundation</figcaption></figure>
          <figure className="academy-study study-two"><Image unoptimized src="/assets/lash-russian.webp" alt="Volume lash technique by PaoLash" width={900} height={950} loading="lazy" /><figcaption>The precision</figcaption></figure>
          <figure className="academy-study study-three"><Image unoptimized src="/assets/lash-hybrid.webp" alt="Wispy lash technique by PaoLash" width={900} height={950} loading="lazy" /><figcaption>The expression</figcaption></figure>
        </div>
        <div className="academy-word" aria-hidden="true">ACADEMY</div>
        <div className="academy-invite shell"><p>Classic · Hybrid · Volume · Wispy</p><a className="button button-wine" href="mailto:support@paolash.com?subject=PaoLash%20Academy%20interest">Let’s talk training <Arrow /></a></div>
        <div className="trainer-credential shell" data-reveal>
          <div className="trainer-credential-copy">
            <p className="eyebrow">Your educator’s credentials</p>
            <h3>International<br /><em>Top Trainer.</em></h3>
            <p>Paola Gutierrez<br />International Lash School Lotus · June 2025</p>
            <a className="button" href="/assets/trainer-certificate.webp" target="_blank" rel="noreferrer">View certificate <Arrow /></a>
          </div>
          <figure className="trainer-certificate"><a href="/assets/trainer-certificate.webp" target="_blank" rel="noreferrer" aria-label="Open Paola’s International Top Trainer certificate in full"><Image unoptimized src="/assets/trainer-certificate.webp" alt="Paola Gutierrez’s International Top Trainer course certificate, LondonLashPro accredited, issued by International Lash School Lotus in June 2025" width={1080} height={755} loading="lazy" /></a></figure>
        </div>
      </section>

      <section className="studio-notes shell" data-scene="notes" aria-labelledby="essentials-title">
        <div className="studio-ticket" data-reveal>
          <div className="ticket-main"><Label>Your studio invitation</Label><h2 id="essentials-title">Make time<br />for <em>you.</em></h2><p>65 William St S<br />Dublin 2 · D02 AW81</p><button className="notes-open" type="button" onClick={() => notesRef.current?.showModal()}>Before your appointment <span aria-hidden="true">+</span></button></div>
          <div className="ticket-stub"><span className="ticket-city">DUBLIN</span><span className="ticket-district">2</span><span className="ticket-studio">PaoLash<br />Lounge & Academy</span><BookingLink className="ticket-book">Save your date</BookingLink></div>
        </div>
        <dialog ref={notesRef} className="studio-dialog" aria-labelledby="studio-notes-title" onClick={(event) => { if (event.target === event.currentTarget) notesRef.current?.close(); }}>
          <div className="notes-sheet"><div className="notes-sheet-head"><h2 id="studio-notes-title">Before we meet.</h2><button type="button" aria-label="Close studio notes" onClick={() => notesRef.current?.close()}>×</button></div><div className="notes-content">{policies.map((policy) => <article key={policy.title}><h3>{policy.title}</h3><p>{policy.text}</p></article>)}</div><p className="notes-help">A question? <a href="mailto:support@paolash.com">Ask the studio.</a></p></div>
        </dialog>
      </section>
    </main>

    <footer className="footer leather" id="visit" data-scene="visit" inert={menuOpen}><div className="closing shell"><Label>A little time, just for you</Label><h2><span>Your next</span><em>favourite look.</em></h2><BookingLink className="button button-light">Reserve your appointment</BookingLink><div className="closing-brand"><Image unoptimized src={LOGO} alt="PaoLash Lounge & Academy" width={1536} height={1024} loading="lazy" /></div></div><div className="footer-details shell"><div data-reveal><span className="footer-label">The studio</span><a href="https://www.google.com/maps/search/?api=1&query=65+William+St+S+Dublin+2+D02+AW81" target="_blank" rel="noreferrer">65 William St S<br />Dublin 2 · D02 AW81</a></div><div data-reveal style={delay(1)}><span className="footer-label">Say hello</span><a href="tel:+353838119207">083 811 9207</a><a href="mailto:support@paolash.com">support@paolash.com</a></div><div data-reveal style={delay(2)}><span className="footer-label">Follow the artistry</span><a href="https://www.instagram.com/paolash_lounge" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@paolash_0" target="_blank" rel="noreferrer">TikTok</a><a href="https://wa.me/353838119207" target="_blank" rel="noreferrer">WhatsApp</a></div><a className="back-top" href="#top" data-reveal>Back to top <Arrow /></a></div><div className="footer-bottom shell"><span>© {new Date().getFullYear()} PaoLash Lounge & Academy</span><span>Dublin. With love.</span></div></footer>
  </div>;
}
