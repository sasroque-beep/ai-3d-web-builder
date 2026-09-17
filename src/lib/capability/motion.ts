/**
 * Safe in SSR/no-DOM environments — returns false rather than throwing.
 * `<Canvas>` only ever mounts client-side, so a real answer is always
 * available by the time this matters; the SSR case just needs to not crash.
 */
export function detectPrefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
