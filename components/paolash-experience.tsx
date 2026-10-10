"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type KeyboardEvent } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEditorialMotion } from "@/hooks/use-editorial-motion";

const BOOKING_URL = "https://www.fresha.com/book-now/paolash-lounge-au1el382/services?lid=2674229&share=true&pId=2588624";
const LOGO = "/assets/paolash-logo-transparent.png";
const services = [
  { name: "Wispy hybrid", note: "Softness, with a little intrigue.", image: "lash-hybrid.webp", mood: "Soft & expressive" },
  { name: "Russian volume", note: "Full, featherlight, unmistakable.", image: "lash-russian.webp", mood: "Full & featherlight" },
  { name: "Eyeliner effect", note: "A lifted line. A lasting impression.", image: "lash-line.webp", mood: "Lifted & sculpted" },
  { name: "Lash lift", note: "Your own lashes, beautifully lifted.", image: "lash-lift.webp", mood: "Naturally yours" },
];
const courses = [
  { name: "Classic", image: "lash-classic.webp", line: "Begin with precision.", note: "The foundations of a beautifully balanced set." },
  { name: "Hybrid", image: "lash-hybrid.webp", line: "Find the balance.", note: "Explore the meeting of softness and texture." },
  { name: "Volume", image: "lash-russian.webp", line: "Make an impression.", note: "Develop your eye for fullness, shape and proportion." },
  { name: "Wispy", image: "lash-hybrid.webp", line: "Create your signature.", note: "Explore the detail behind a more expressive finish." },
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
function Label({ children, number }: { children: ReactNode; number?: string }) { return <p className="eyebrow" data-reveal>{children}</p>; }
function Heading({ children, id }: { children: ReactNode; id: string }) { return <h2 id={id} className="display" data-reveal="type">{children}</h2>; }

export default function PaoLashExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState(0);
  const [verticalCourses, setVerticalCourses] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const collectionRef = useRef<HTMLElement>(null);
  useEditorialMotion(pageRef);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 1000px)");
    const courseLayout = matchMedia("(min-width: 601px)");
    const syncLayout = () => {
      if (desktop.matches) setMenuOpen(false);
      setVerticalCourses(courseLayout.matches);
    };
    syncLayout();
    desktop.addEventListener("change", syncLayout);
    courseLayout.addEventListener("change", syncLayout);
    return () => {
      desktop.removeEventListener("change", syncLayout);
      courseLayout.removeEventListener("change", syncLayout);
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

  function courseKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === (verticalCourses ? "ArrowDown" : "ArrowRight")) next = (index + 1) % courses.length;
    else if (event.key === (verticalCourses ? "ArrowUp" : "ArrowLeft")) next = (index + courses.length - 1) % courses.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = courses.length - 1;
    else return;
    event.preventDefault(); setActiveCourse(next); document.getElementById(`course-tab-${next}`)?.focus();
  }

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
        <div className="hero-topline"><span>Lash lounge & academy</span><span>Dublin, Ireland</span></div>
        <div className="hero-masthead" aria-hidden="true"><span>PAO</span><span>LASH</span></div>
        <div className="hero-portrait"><Image unoptimized src="/assets/hero.webp" alt="Paola Gutierrez, founder of PaoLash" width={900} height={1351} priority /></div>
        <div className="hero-intro"><h1 className="hero-title" id="hero-title"><span className="hero-line"><span>Lash artistry.</span></span><span className="hero-line"><em>Made personal.</em></span></h1><p>A signature of your own.</p></div>
        <div className="hero-action"><span>Exceptional lashes.<br />Entirely you.</span><BookingLink className="button button-wine">Find your look</BookingLink></div>
        <div className="hero-bottom"><span>By Paola Gutierrez</span><a href="#services"><span className="scroll-stroke" />Scroll to discover</a><span>Individual by nature</span></div>
      </section>

      <section className="collection" id="services" ref={collectionRef} data-scene="collection" aria-labelledby="collection-title">
        <div className="collection-sticky">
          <div className="collection-heading shell"><p className="eyebrow" data-reveal>The PaoLash edit</p><h2 id="collection-title" data-reveal="type">Find your <em>signature.</em></h2></div>
          <div className="look-stage">
            {services.map((service, index) => <article className={`look-chapter${index === 0 ? " is-current" : ""}`} key={service.name} data-look={index}>
              <div className="look-copy"><p className="look-kicker">{service.mood}</p><h3>{service.name.split(" ").map((word, i) => <span key={i}>{word} </span>)}</h3><p>{service.note}</p><a className="look-book" href={BOOKING_URL} target="_blank" rel="noreferrer">Make it yours <Arrow /></a></div>
              <figure className="look-photo"><Image unoptimized src={`/assets/${service.image}`} alt={`PaoLash ${service.name.toLowerCase()} lash work, shown in full`} width={900} height={950} loading="lazy" /></figure>
            </article>)}
          </div>
          <p className="collection-scroll">Keep scrolling. Find your expression.<span aria-hidden="true" /></p>
        </div>
      </section>

      <section className="artist shell" id="story" data-scene="artist" aria-labelledby="artist-title"><div className="artist-top"><Label number="02">The artist, the individual</Label><span className="edition-note" data-reveal>A personal point of view</span></div><div className="artist-layout"><figure className="artist-visual" data-unfold><div className="artist-portrait"><Image unoptimized src="/assets/founder-night.webp" alt="Paola Gutierrez, the artist behind PaoLash" width={760} height={1049} loading="lazy" /></div><figcaption>Paola Gutierrez <span>Founder & educator</span></figcaption></figure><div className="artist-copy"><h2 id="artist-title" className="artist-statement">{statement.map((word, index) => <span data-word key={index}>{word}{" "}</span>)}</h2><p data-reveal>Your shape, your features, your way of being.<br />That’s where every PaoLash set begins.</p><div className="artist-signoff" data-reveal><span className="signature">Paola G.</span><span>Made with intention.<br />Always by hand.</span></div></div></div></section>

      <section className="recognition shell" id="recognition" data-scene="recognition" aria-labelledby="recognition-title"><div className="recognition-copy"><Label number="03">Beyond the studio</Label><Heading id="recognition-title">A little<br /><em>recognition.</em></Heading><div className="award-number" data-reveal>3<sup>rd</sup></div><p data-reveal>Creative Effects · Master category<br />Lash Star Elite, Dubai · 2025</p></div><div className="recognition-gallery"><figure className="proof proof-certificate"><a href="/assets/award.webp" target="_blank" rel="noreferrer"><div className="proof-mat"><Image unoptimized src="/assets/award.webp" alt="Full competition certificate: Paola Gutierrez, third place, Creative Effects, Master category, Lash Star Elite Dubai 2025" width={720} height={1019} loading="lazy" /></div><figcaption><span>The recognition</span><span>View certificate <Arrow /></span></figcaption></a></figure><figure className="proof proof-trophy"><a href="/assets/trophy.webp" target="_blank" rel="noreferrer"><div className="proof-mat"><Image unoptimized src="/assets/trophy.webp" alt="Paola’s trophy at the Dubai competition, shown in full" width={900} height={1200} loading="lazy" /></div><figcaption><span>The moment</span><span>Dubai, 2025 <Arrow /></span></figcaption></a></figure></div></section>

      <section className="detail leather" data-scene="detail" aria-labelledby="detail-title"><div className="detail-top shell"><Label number="04">The finer details</Label><span className="edition-note" data-reveal>Small details. A different feeling.</span></div><div className="detail-stage shell"><div className="detail-title-wrap"><h2 id="detail-title">Light<br />on the <em>eye.</em></h2><p data-reveal>Precise placement.<br />A beautifully weightless finish.</p></div><figure className="detail-hero"><Image unoptimized src="/assets/lash-classic.webp" alt="A complete photograph of PaoLash’s classic lash work" width={900} height={900} loading="lazy" /><figcaption><span className="detail-dot" />The detail makes the difference</figcaption></figure></div><div className="aftercare shell"><span className="aftercare-line" data-reveal /><figure className="aftercare-photo"><Image unoptimized src="/assets/aftercare.webp" alt="The full PaoLash aftercare kit" width={700} height={805} loading="lazy" /></figure><div className="aftercare-copy"><p className="eyebrow" data-reveal>And after you leave</p><h3 data-reveal>Keep that<br /><em>just-done feeling.</em></h3><p data-reveal>A little daily care goes a long way.<br />Ask us about your aftercare ritual.</p></div></div></section>

      <section className="academy shell" id="academy" data-scene="academy" aria-labelledby="academy-title"><div className="academy-heading"><Label number="05">PaoLash academy</Label><Heading id="academy-title">The next pair<br />of <em>great hands.</em></Heading><p data-reveal>Learn the technique.<br />Make the artistry your own.</p></div><div className="academy-layout"><div className="academy-courses"><div className="course-tabs" role="tablist" aria-orientation={verticalCourses ? "vertical" : "horizontal"} aria-label="Explore academy disciplines">{courses.map((course, index) => <button key={course.name} type="button" id={`course-tab-${index}`} role="tab" aria-selected={activeCourse === index} aria-controls={`course-panel-${index}`} tabIndex={activeCourse === index ? 0 : -1} onClick={() => setActiveCourse(index)} onKeyDown={(event) => courseKey(event, index)} className={activeCourse === index ? "is-active" : ""}><span>0{index + 1}</span>{course.name}<Arrow /></button>)}</div><a className="text-link" href="mailto:support@paolash.com?subject=PaoLash%20Academy%20interest">Enquire about training <Arrow /></a></div><div className="academy-folio"><span className="folio-underlay" aria-hidden="true" />{courses.map((course, index) => <div key={course.name} className={`course-panel${activeCourse === index ? " is-active" : ""}`} role="tabpanel" id={`course-panel-${index}`} aria-labelledby={`course-tab-${index}`} hidden={activeCourse !== index} tabIndex={0}><div className="course-image"><Image unoptimized src={`/assets/${course.image}`} alt={`Real PaoLash ${course.name.toLowerCase()} lash work`} width={900} height={950} loading="lazy" /></div><div className="course-caption"><span>0{index + 1} / The {course.name.toLowerCase()} study</span><h3>{course.line}</h3><p>{course.note}</p></div></div>)}</div></div></section>

      <section className="essentials shell" aria-labelledby="essentials-title"><div><Label number="06">Before your visit</Label><Heading id="essentials-title">A few<br /><em>little details.</em></Heading></div><Accordion className="policy-accordion" type="single" collapsible>{policies.map((policy, index) => <AccordionItem className="policy-item" key={policy.title} value={`policy-${index}`} data-reveal="row" style={delay(index)}><AccordionTrigger className="policy-trigger"><span><b>0{index + 1}</b>{policy.title}</span></AccordionTrigger><AccordionContent className="policy-content"><p>{policy.text}</p></AccordionContent></AccordionItem>)}</Accordion></section>
    </main>

    <footer className="footer leather" id="visit" data-scene="visit" inert={menuOpen}><div className="closing shell"><Label>A little time, just for you</Label><h2><span>Your next</span><em>favourite look.</em></h2><BookingLink className="button button-light">Reserve your appointment</BookingLink><div className="closing-brand"><Image unoptimized src={LOGO} alt="PaoLash Lounge & Academy" width={1536} height={1024} loading="lazy" /></div></div><div className="footer-details shell"><div data-reveal><span className="footer-label">The studio</span><a href="https://www.google.com/maps/search/?api=1&query=65+William+St+S+Dublin+2+D02+AW81" target="_blank" rel="noreferrer">65 William St S<br />Dublin 2 · D02 AW81</a></div><div data-reveal style={delay(1)}><span className="footer-label">Say hello</span><a href="tel:+353838119207">083 811 9207</a><a href="mailto:support@paolash.com">support@paolash.com</a></div><div data-reveal style={delay(2)}><span className="footer-label">Follow the artistry</span><a href="https://www.instagram.com/paolash_lounge" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@paolash_0" target="_blank" rel="noreferrer">TikTok</a><a href="https://wa.me/353838119207" target="_blank" rel="noreferrer">WhatsApp</a></div><a className="back-top" href="#top" data-reveal>Back to top <Arrow /></a></div><div className="footer-bottom shell"><span>© {new Date().getFullYear()} PaoLash Lounge & Academy</span><span>Dublin. With love.</span></div></footer>
  </div>;
}
