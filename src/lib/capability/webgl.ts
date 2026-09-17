/**
 * Safe in SSR/no-DOM environments (returns false instead of throwing) —
 * 3D is always progressive enhancement, so the absence of a browser
 * environment must resolve to "no WebGL", never an error.
 */
export function detectWebglSupport(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return context !== null;
  } catch {
    return false;
  }
}
