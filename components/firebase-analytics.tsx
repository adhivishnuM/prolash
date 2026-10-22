"use client";

import { useEffect } from "react";

export default function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;

    const start = () => { void Promise.all([import("firebase/analytics"), import("@/lib/firebase")]).then(async ([{ getAnalytics, isSupported, logEvent }, { firebaseApp }]) => {
      if (!(await isSupported()) || cancelled) return;
      const analytics = getAnalytics(firebaseApp);
      logEvent(analytics, "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }).catch(() => {
      // Analytics is optional and must never block the page experience.
    }); };

    // Neither Firebase core nor analytics competes with the hero or hydration.
    const timer = setTimeout(() => {
      if (cancelled) return;
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 5000 });
      else start();
    }, 5000);
    let idle: number | undefined;

    return () => { cancelled = true; clearTimeout(timer); if (idle !== undefined) window.cancelIdleCallback(idle); };
  }, []);

  return null;
}
