"use client";

import { useEffect, useRef } from "react";

/** Tapered ribbons follow the client's reference. Only the decorative groups
 * move; the artwork never changes page geometry or captures pointer input. */
export default function AmbientRibbons() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => { if (root.current) root.current.dataset.paused = String(document.hidden); };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return <div className="ambient-waves" ref={root} aria-hidden="true">
    <svg viewBox="0 0 850 1850" fill="none" preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient id="ribbon-foil" x1="0" y1="0" x2="850" y2="1850" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b77760" /><stop offset=".2" stopColor="#f3ccba" /><stop offset=".39" stopColor="#c78d74" /><stop offset=".57" stopColor="#fae2d4" /><stop offset=".76" stopColor="#b8755e" /><stop offset="1" stopColor="#e8b29a" />
        </linearGradient>
        <linearGradient id="ribbon-edge" x1="0" y1="0" x2="850" y2="1850" gradientUnits="userSpaceOnUse">
          <stop stopColor="#af715a" /><stop offset=".35" stopColor="#dba88f" /><stop offset=".65" stopColor="#b67760" /><stop offset="1" stopColor="#bc7c65" />
        </linearGradient>
      </defs>
      <g className="wave wave-top">
        <path className="ribbon-foil" d="M542-20C623 71 711 120 880 164L880 159C710 114 630 65 550-20Z" />
        <path className="ribbon-edge" d="M547-20C627 69 710 118 880 162" />
      </g>
      <g className="ribbon-frame ribbon-frame-left"><g className="wave wave-left">
        <path className="ribbon-foil" d="M-17 339C83 485 39 692 119 878C162 965 218 1016 287 1042L285 1044C212 1017 157 971 113 882C31 696 75 490-23 341Z" />
        <path className="ribbon-edge" d="M-18 340C79 487 35 694 116 880C159 967 216 1017 286 1043" />
        <path className="ribbon-foil" d="M-37 681C1 807 91 921 168 975C208 1005 248 1028 287 1042L285 1044C244 1029 204 1007 164 978C86 925-5 811-42 682Z" />
        <path className="ribbon-edge" d="M-40 682C-2 809 88 923 166 977C206 1006 246 1029 286 1043" />
      </g></g>
      <g className="ribbon-frame ribbon-frame-right"><g className="wave wave-right">
        <path className="ribbon-foil" d="M880 1064C742 1133 693 1227 627 1364C699 1244 751 1161 880 1090Z" />
        <path className="ribbon-edge" d="M880 1064C742 1133 693 1227 627 1364" />
      </g></g>
      <g className="wave wave-bottom">
        <path className="ribbon-foil" d="M482 1888C600 1779 753 1744 884 1673L884 1684C748 1753 601 1787 492 1888Z" />
        <path className="ribbon-edge" d="M486 1888C601 1782 753 1748 884 1678" />
      </g>
    </svg>
  </div>;
}
