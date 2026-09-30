import "@testing-library/jest-dom/vitest"

// jsdom implements neither of these, and the responsive components call them
// on mount.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

if (!globalThis.EventSource) {
  globalThis.EventSource = class {
    close() {}
    addEventListener() {}
    removeEventListener() {}
  } as never
}
