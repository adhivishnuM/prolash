"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLashSession } from "@/hooks/use-lash-session";
import { BOOKING_URL, LASH_STYLES, getLashStyle } from "@/lib/ar/catalog";
import type { LashStyleId } from "@/lib/ar/types";
import styles from "./lash-mirror.module.css";

type IconName = "arrow" | "camera" | "close" | "help" | "lock" | "download" | "check" | "refresh" | "sun";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    camera: <><path d="M8 5 6.5 8H3v12h18V8h-3.5L16 5Z" /><circle cx="12" cy="13.5" r="3.5" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 16.5v.1" /></>,
    lock: <><rect x="5.5" y="10" width="13" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" /></>,
    check: <><path d="m5 12 4 4 10-10" /></>,
    refresh: <><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  };
  return <svg aria-hidden="true" className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function LashMirror() {
  const {
    videoRef, canvasRef, frameRef, status, phase, error, guidance, style, snapshot, definition, changeDefinition,
    showOriginal, start, stop, selectStyle: updateStyle, toggleOriginal,
    capture, saveSnapshot, discardSnapshot,
  } = useLashSession();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stateHeadingRef = useRef<HTMLHeadingElement>(null);
  const styleRailRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState<"help" | "details" | null>(null);
  const [saveNotice, setSaveNotice] = useState(false);
  const isIntro = status === "idle";
  const isReview = status === "review" && !!snapshot;
  const cameraVisible = ["permission", "loading", "positioning", "live"].includes(status);
  const busy = status === "permission" || status === "loading";
  const canCompare = status === "live" || isReview;
  const currentStyle = isReview ? getLashStyle(snapshot.styleId) : style;
  const styleCount = String(LASH_STYLES.length).padStart(2, "0");

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (dialog && !element.open) element.showModal();
    if (!dialog && element.open) element.close();
  }, [dialog]);

  useEffect(() => {
    if (status === "error" || status === "paused" || status === "review") {
      stateHeadingRef.current?.focus();
    }
  }, [status]);

  useEffect(() => {
    const rail = styleRailRef.current;
    if (isReview || !rail || rail.scrollWidth <= rail.clientWidth) return;
    const selected = rail.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.parentElement;
    if (!selected) return;
    const railBounds = rail.getBoundingClientRect();
    const selectedBounds = selected.getBoundingClientRect();
    const leftEdge = railBounds.left + rail.clientLeft + 4;
    const rightEdge = railBounds.left + rail.clientLeft + rail.clientWidth - 4;
    const shift = selectedBounds.left < leftEdge
      ? selectedBounds.left - leftEdge
      : selectedBounds.right > rightEdge ? selectedBounds.right - rightEdge : 0;
    // Horizontal only: deep links reveal their card without moving the page or
    // focus. No animated scrolling, including for reduced-motion preferences.
    if (shift) rail.scrollTo({ left: rail.scrollLeft + shift, behavior: "auto" });
  }, [style.id, isReview]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !dialogRef.current?.open) {
        stop();
        router.push("/#services");
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [router, stop]);

  const selectStyle = (id: LashStyleId) => {
    updateStyle(id);
    setSaveNotice(false);
  };

  const resume = () => {
    setSaveNotice(false);
    discardSnapshot();
    void start();
  };

  const exit = () => stop();

  return (
    <main className={`${styles.mirror} ${isIntro ? styles.introMode : styles.cameraMode}`} data-session-status={status}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} onClick={exit} aria-label="PaoLash home">PaoLash<span>LOUNGE & ACADEMY</span></Link>
        <span className={styles.headerTitle}>THE LASH MIRROR</span>
        <div className={styles.headerActions}>
          <button className={styles.helpButton} onClick={() => setDialog("help")} aria-label="Help with your lash preview"><Icon name="help" /><span>A little help</span></button>
          <Link href="/#services" className={styles.iconButton} onClick={exit} aria-label="Close lash mirror"><Icon name="close" /></Link>
        </div>
      </header>

      <div className={styles.workspace}>
        <section className={styles.stage} aria-label={isIntro ? "PaoLash lash artistry" : isReview ? "Your saved preview" : "Live camera preview"}>
          <video ref={videoRef} muted autoPlay playsInline aria-hidden="true" className={`${styles.cameraLayer} ${busy ? "" : styles.hiddenLayer}`} />
          <canvas ref={frameRef} data-layer="camera" aria-hidden="true" className={`${styles.cameraLayer} ${cameraVisible && !busy ? "" : styles.hiddenLayer}`} />
          <canvas ref={canvasRef} data-layer="lashes" aria-hidden="true" className={`${styles.cameraLayer} ${status === "live" && !showOriginal ? "" : styles.hiddenLayer}`} />

          {isIntro && (
            <div className={styles.editorial}>
              <Image className={styles.editorialImage} src={currentStyle.referenceImage ?? "/assets/lash-hybrid.webp"} alt={currentStyle.referenceImage ? `Real ${currentStyle.name.toLowerCase()} lash artistry by PaoLash` : "Real lash artistry by PaoLash"} width={900} height={950} preload />
              <div className={styles.editorialShade} />
              <div className={styles.editorialTop}><span>THE ART OF YOUR NEXT LOOK</span><span>{currentStyle.number} / {styleCount}</span></div>
              <div className={styles.editorialBottom}>
                <p>Small details.<br /><em>Entirely you.</em></p>
                <div><span>{currentStyle.referenceImage ? currentStyle.name : "A little inspiration"}</span><span>REAL WORK BY PAOLASH</span></div>
              </div>
            </div>
          )}

          {isReview && (
            <Image className={styles.snapshot} src={showOriginal ? snapshot.original : snapshot.styled} alt={showOriginal ? "Your original camera image" : `Your ${currentStyle.name.toLowerCase()} style preview`} width={1200} height={1600} unoptimized />
          )}

          {!isIntro && (
            <div className={styles.stageTop}>
              <span className={styles.stageBadge}><span className={status === "live" ? styles.liveDot : styles.neutralDot} />{isReview ? "Still preview · camera off" : status === "live" ? "Live · style preview" : "The Lash Mirror"}</span>
              {(status === "live" || status === "positioning") && <span className={styles.privateBadge}><Icon name="lock" /><span>Only on your device</span></span>}
            </div>
          )}

          {busy && (
            <div className={styles.stateOverlay} role="status" aria-live="polite">
              <span className={styles.stateSymbol}><Icon name={status === "permission" ? "camera" : "sun"} /></span>
              <p className={styles.stateTitle}>{status === "permission" ? "A moment for you." : "Preparing your mirror."}</p>
              <p className={styles.stateBody}>{phase || (status === "permission" ? "Allow camera access in your browser to begin." : "Loading your lash preview…")}</p>
              {status === "loading" && <span className={styles.loadingLine} aria-hidden="true" />}
              <button className={styles.quietButton} onClick={stop}>Cancel preview</button>
            </div>
          )}

          {status === "positioning" && (
            <div className={styles.positioning}>
              <div className={styles.faceGuide} aria-hidden="true"><span /><span /><span /><span /></div>
              <p role="status" aria-live="polite">{guidance || "Bring your face into view."}</p>
            </div>
          )}

          {(status === "error" || status === "paused") && (
            <div className={styles.stateOverlay}>
              <span className={styles.stateSymbol}><Icon name={status === "paused" ? "lock" : "camera"} /></span>
              <h2 ref={stateHeadingRef} tabIndex={-1} className={styles.stateTitle}>{status === "paused" ? "Your mirror is paused." : error?.title || "The preview is unavailable."}</h2>
              <p className={styles.stateBody}>{status === "paused" ? "Your camera is off. Take your time, then return whenever you’re ready." : error?.detail || "You can still explore our real lash work and find a finish you love."}</p>
              {(status === "paused" || error?.retryable) && <button className={styles.primaryButton} onClick={() => void start()}><span>{status === "paused" ? "Resume camera" : "Try again"}</span><Icon name="refresh" /></button>}
              <Link href="/#services" className={styles.quietButton} onClick={exit}>Explore real results <Icon name="arrow" /></Link>
            </div>
          )}

          {canCompare && (
            <div className={styles.stageBottom}>
              <div className={styles.comparison} role="group" aria-label="Compare your look">
                <button aria-pressed={showOriginal} onClick={() => { if (!showOriginal) toggleOriginal(); }}>Original</button>
                <button aria-pressed={!showOriginal} onClick={() => { if (showOriginal) toggleOriginal(); }}>With lashes</button>
              </div>
              {status === "live" && <button className={styles.captureButton} onClick={() => { setSaveNotice(false); capture(); }} aria-label="Capture a preview to review and save"><Icon name="camera" /><span>Keep a preview</span></button>}
            </div>
          )}
          {status === "live" && guidance && <p className={styles.liveGuidance} role="status">{guidance}</p>}
        </section>

        <aside className={styles.panel} aria-label="Lash styles and camera controls">
          {isIntro ? (
            <div className={styles.introCopy}>
              <p className={styles.eyebrow}><span />YOUR PERSONAL LASH MIRROR</p>
              <h1>Find your finish,<br /><em>on you.</em></h1>
              <p className={styles.introDescription}>{LASH_STYLES.length} distinct looks.<br />A little time to find your shape.</p>
            </div>
          ) : isReview ? (
            <div className={styles.activeCopy}>
              <p className={styles.eyebrow}>A MOMENT TO COMPARE</p>
              <h1 ref={stateHeadingRef} tabIndex={-1}>Your look,<br /><em>for keeps.</em></h1>
              <p className={styles.reviewStyle}>{currentStyle.name}</p>
              <p className={styles.styleDescription}>Compare the same moment with and without the digital lashes. Your camera is off.</p>
            </div>
          ) : (
            <div className={styles.activeCopy}>
              <p className={styles.eyebrow}>YOUR SELECTED FINISH <span className={styles.styleNumber}>{currentStyle.number} / {styleCount}</span></p>
              <div className={styles.styleHeading}><h1>{currentStyle.name}</h1><button className={styles.detailsButton} onClick={() => setDialog("details")}>Details <span>↗</span></button></div>
              <p className={styles.styleDescription}>{currentStyle.description}</p>
            </div>
          )}

          {!isReview && (
            <fieldset className={styles.styleSelector}>
              <legend>{isIntro ? "CHOOSE YOUR STARTING LOOK" : "EXPLORE THE COLLECTION"}</legend>
              <div ref={styleRailRef} className={styles.styleOptions}>
                {LASH_STYLES.map((item) => (
                  <label className={`${styles.styleOption} ${item.id === style.id ? styles.selectedStyle : ""}`} key={item.id}>
                    <input type="radio" name="lash-style" value={item.id} checked={item.id === style.id} onChange={() => selectStyle(item.id)} aria-label={`${item.name} — ${item.shape}`} />
                    <span className={styles.thumbnail}>
                      <Image src={item.preview} width={320} height={150} alt="" unoptimized />
                      {item.id === style.id && <span className={styles.selectedMark}><Icon name="check" /></span>}
                    </span>
                    <span className={styles.styleName}>{item.shortName}</span>
                    <span className={styles.styleShape}>{item.shape}</span>
                  </label>
                ))}
              </div>
              <p className={styles.referencesNote}>{LASH_STYLES.length} looks · <span className={styles.scrollHint}>Swipe to explore · </span>Find your favourite shape.</p>
            </fieldset>
          )}

          {(status === "live" || status === "positioning" || status === "paused") && (
            <div className={styles.definitionControl}>
              <div><label htmlFor="lash-definition">Lash definition</label><span>{definition < 35 ? "Soft" : definition > 80 ? "Bold" : "Defined"}</span></div>
              <input id="lash-definition" type="range" min="0" max="100" step="5" value={definition} onChange={(event) => changeDefinition(Number(event.target.value))} aria-valuetext={`${definition}% — ${definition < 35 ? "soft" : definition > 80 ? "bold" : "defined"}`} />
            </div>
          )}

          {isIntro ? (
            <div className={styles.introActions}>
              <button className={styles.primaryButton} onClick={() => void start()}><span>Open camera</span><Icon name="camera" /></button>
              <p className={styles.privacyNote}><Icon name="lock" /><span>Your camera stays on your device.<br />No account. Just you.</span></p>
              <Link href="/#services" className={styles.browseLink} onClick={exit}>Prefer to browse real results? <Icon name="arrow" /></Link>
            </div>
          ) : isReview ? (
            <div className={styles.reviewActions}>
              <button className={styles.primaryButton} onClick={() => { saveSnapshot(); setSaveNotice(true); }}><span>Save image</span><Icon name="download" /></button>
              {saveNotice && <p className={styles.saveNotice} role="status">Your browser will save the image to your device.</p>}
              <button className={styles.secondaryButton} onClick={resume}><span>Back to live</span><Icon name="camera" /></button>
              <button className={styles.deleteButton} onClick={() => { setSaveNotice(false); discardSnapshot(); }}>Delete preview</button>
              <a className={styles.bookingText} href={BOOKING_URL} onClick={exit} target="_blank" rel="noopener noreferrer">Continue to booking <Icon name="arrow" /><span className={styles.srOnly}> (opens a new tab)</span></a>
            </div>
          ) : (
            <div className={styles.liveActions}>
              <p className={styles.artistNote}>A little inspiration for your next appointment. Your artist tailors the final set to you.</p>
              <a className={styles.primaryButton} href={BOOKING_URL} onClick={exit} target="_blank" rel="noopener noreferrer"><span>Continue to booking</span><Icon name="arrow" /><span className={styles.srOnly}> (opens a new tab)</span></a>
              <p className={styles.bookingNote}>Choose an available treatment on Fresha.</p>
            </div>
          )}
          <p className={styles.previewNote}>Digital style inspiration. Your artist tailors the final set.</p>
        </aside>
      </div>

      <footer className={styles.footer}><span>LASH ARTISTRY, DUBLIN</span><span>A LITTLE EXPRESSION. ALL YOUR OWN.</span><span>PAOLASH</span></footer>

      <dialog ref={dialogRef} className={styles.dialog} onClose={() => setDialog(null)} aria-labelledby="mirror-dialog-title" onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
      }}>
        <div className={styles.dialogHeader}><span className={styles.eyebrow}>THE LASH MIRROR</span><button className={styles.iconButton} onClick={() => dialogRef.current?.close()} aria-label="Close information"><Icon name="close" /></button></div>
        {dialog === "details" ? (
          <>
            <h2 id="mirror-dialog-title">{currentStyle.name}</h2>
            <p className={styles.dialogLead}>{currentStyle.detail}</p>
            <figure className={styles.detailShape}><Image src={currentStyle.preview} alt={`${currentStyle.name}: ${currentStyle.shape.toLowerCase()}`} width={320} height={150} unoptimized /><figcaption>The shape used in your digital preview</figcaption></figure>
            {currentStyle.referenceImage && <figure className={styles.detailImage}><Image src={currentStyle.referenceImage} alt={`Real ${currentStyle.name.toLowerCase()} lashes by PaoLash`} width={900} height={950} /><figcaption>Real work by PaoLash · reference photograph</figcaption></figure>}
            <div className={styles.characteristics}>{currentStyle.character.map((item) => <span key={item}>{item}</span>)}</div>
            <p className={styles.dialogFootnote}>These digital looks are inspiration. Choose an available treatment when booking; your artist can advise on lengths, curl and placement for your eyes.</p>
          </>
        ) : (
          <>
            <h2 id="mirror-dialog-title">Make yourself<br /><em>comfortable.</em></h2>
            <p className={styles.dialogLead}>A few small things for a clearer preview.</p>
            <ol className={styles.helpList}>
              <li><span>01</span><div><h3>Find your light.</h3><p>Face a window or an evenly lit room. Avoid a bright light directly behind you.</p></div></li>
              <li><span>02</span><div><h3>Look into the mirror.</h3><p>Keep your face mostly forward and both eyes visible. Remove glasses if they cover your lash line.</p></div></li>
              <li><span>03</span><div><h3>Try, switch, compare.</h3><p>Choose a finish, then tap Original to see your camera view without digital lashes.</p></div></li>
            </ol>
            <div className={styles.helpPrivacy}><Icon name="lock" /><div><h3>A private little moment.</h3><p>Camera images are processed on your device. Saving is optional and downloads an image to your device.</p></div></div>
            <p className={styles.dialogFootnote}>Camera access off? Allow it in your browser’s site settings, then try again. If you’re inside another app, opening this page in Safari or Chrome may help.</p>
            <Link className={styles.browseLink} href="/#services" onClick={exit}>Explore real results instead <Icon name="arrow" /></Link>
          </>
        )}
      </dialog>
    </main>
  );
}
