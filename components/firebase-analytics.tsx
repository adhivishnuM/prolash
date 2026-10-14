"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { firebaseApp } from "@/lib/firebase";

const isMirrorPath = (pathname: string) => pathname === "/try-on" || pathname.startsWith("/try-on/");

export default function FirebaseAnalytics() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const measurementId = firebaseApp.options.measurementId;
    if (!measurementId || !isMirrorPath(pathname)) return;

    // Firebase's setAnalyticsCollectionEnabled ultimately writes this GA flag,
    // but waits for async initialization first. Set it immediately so an SDK
    // already loaded on the homepage is also suspended inside the mirror.
    const key = `ga-disable-${measurementId}` as const;
    const flags = window as unknown as Window & { [key: `ga-disable-${string}`]: boolean | undefined };
    const previous = flags[key];
    flags[key] = true;
    return () => {
      // Restore the preceding state, including an existing opt-out. Do not
      // replace consent settings or unconditionally enable collection.
      if (flags[key] !== true) return;
      if (previous === undefined) delete flags[key];
      else flags[key] = previous;
    };
  }, [pathname]);

  useEffect(() => {
    // Root layouts persist across client navigation: check both the subscribed
    // route and the current URL at every asynchronous boundary.
    if (isMirrorPath(pathname) || isMirrorPath(window.location.pathname)) return;
    let cancelled = false;
    const isCurrent = () => !cancelled && window.location.pathname === pathname && !isMirrorPath(window.location.pathname);

    void import("firebase/analytics").then(async ({ getAnalytics, isSupported, logEvent }) => {
      if (!isCurrent() || !(await isSupported()) || !isCurrent()) return;
      const analytics = getAnalytics(firebaseApp);
      if (!isCurrent()) return;
      logEvent(analytics, "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }).catch(() => {
      // Analytics is optional and must never block the page experience.
    });

    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
