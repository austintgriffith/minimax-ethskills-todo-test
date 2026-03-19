/**
 * Polyfill for localStorage in Node.js 25+
 * Next.js 15 / Node 25+ ships a broken localStorage shim that lacks getItem/setItem.
 * RainbowKit and next-themes call localStorage at import time during static build.
 * This polyfill ensures consistent WebStorage API across all Node processes.
 */
if (typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage.getItem !== "function") {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() { return store.size; },
  };
}
