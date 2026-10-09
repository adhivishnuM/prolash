"use client";

import { useEffect } from "react";
import { firebaseApp } from "@/lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;

    void import("firebase/analytics").then(async ({ getAnalytics, isSupported, logEvent }) => {
      if (cancelled || !(await isSupported())) return;
      const analytics = getAnalytics(firebaseApp);
      logEvent(analytics, "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }).catch(() => {
      // Analytics is optional and must never block the page experience.
    });

    return () => { cancelled = true; };
  }, []);

  return null;
}
