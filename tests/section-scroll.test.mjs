import assert from "node:assert/strict";
import test from "node:test";
import { resetHomeUrl, scrollToHomeSection } from "../lib/section-scroll.ts";

test("section navigation uses layout positions, header clearance and reduced motion", () => {
  let reduced = false;
  let width = 609;
  let headerHeight = 70;
  let headerTop = "16px";
  let result;
  const target = { getBoundingClientRect: () => ({ top: 300 }) };
  const header = { get offsetHeight() { return headerHeight; } };
  const selectors = [];
  const originals = new Map();
  const globals = {
    matchMedia: () => ({ matches: reduced }),
    innerWidth: width,
    getComputedStyle: () => ({ top: headerTop, paddingTop: "0px" }),
    document: { querySelector: (selector) => { selectors.push(selector); return selector === ".site-header" ? header : target; } },
    window: { scrollY: 800, scrollTo: (options) => { result = options; } },
  };
  for (const [key,value] of Object.entries(globals)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis,key));
    Object.defineProperty(globalThis,key,{ value, configurable: true, writable: true });
  }
  try {
    for (const id of ["services", "story", "academy", "visit"]) {
      scrollToHomeSection(id);
      assert.deepEqual(result, { top: 1000, behavior: "smooth" });
    }
    assert.ok(selectors.includes("#visit"));
    assert.ok(selectors.includes("#services [data-section-start]"));
    reduced = true;
    headerHeight = 60;
    headerTop = "10px";
    scrollToHomeSection("story");
    assert.deepEqual(result, { top: 1010, behavior: "instant" });
    reduced = false;
    width = 1440;
    Object.defineProperty(globalThis,"innerWidth",{ value: width, configurable: true });
    headerHeight = 64;
    headerTop = "16px";
    scrollToHomeSection("academy");
    assert.deepEqual(result, { top: 996, behavior: "smooth" });
    scrollToHomeSection("top");
    assert.deepEqual(result, { top: 0, behavior: "smooth" });
    result = undefined;
    scrollToHomeSection("missing");
    assert.equal(result, undefined);
  } finally {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis,key,descriptor);
      else Reflect.deleteProperty(globalThis,key);
    }
  }
});

test("logo clears section URLs, queries and hashes without reloading or losing history state", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const state = { __NA: true, preserved: "router-state" };
  let result;
  const location = { pathname: "/collection/", search: "?source=share", hash: "#services" };
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location,
    history: { state, replaceState: (...args) => { result = args; } },
  } });
  try {
    resetHomeUrl();
    assert.deepEqual(result, [state, "", "/"]);
    for (const path of ["/artist/", "/academy/", "/visit/"]) {
      location.pathname = path;
      resetHomeUrl();
      assert.deepEqual(result, [state, "", "/"]);
    }
    Object.assign(location, { pathname: "/", search: "", hash: "" });
    result = undefined;
    resetHomeUrl();
    assert.equal(result, undefined);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
