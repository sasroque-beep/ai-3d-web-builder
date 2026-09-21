import type { Page } from "@playwright/test";

/**
 * Browser-side simulation of the environments the 3D layer has to survive.
 * These are the only helpers that touch browser internals, so anything
 * engine-specific stays in this file (the suite is meant to be portable to
 * Firefox/WebKit later). All of them use standard web APIs — none relies on
 * Chromium launch flags, which are not reliable to toggle per test.
 */

declare global {
  interface Window {
    __webglProbeCalls: number;
    __rafCount: number;
  }
}

/**
 * Makes `canvas.getContext("webgl" | "webgl2" | …)` return `null`, exactly
 * what a browser without WebGL does. `window.__webglProbeCalls` counts the
 * attempts, which proves capability detection actually ran (otherwise
 * "it stayed on the 2D fallback" could just mean it never got that far).
 */
export async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    window.__webglProbeCalls = 0;
    const original = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (/webgl/i.test(type)) {
        window.__webglProbeCalls++;
        return null;
      }
      return (original as (...a: unknown[]) => unknown).call(
        this,
        type,
        ...args,
      );
    } as typeof original;
  });
}

export async function waitForWebGLProbe(page: Page) {
  await page.waitForFunction(() => window.__webglProbeCalls > 0);
}

/** `detectDeviceTier` reports "low" for `hardwareConcurrency <= 2`. */
export async function simulateLowEndDevice(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      get: () => 2,
    });
  });
}

/**
 * Counts `requestAnimationFrame` callbacks. It tells a continuous render
 * loop (`frameloop="always"`) from a static frame (`frameloop="demand"`)
 * without ever looking at pixels.
 */
export async function installFrameCounter(page: Page) {
  await page.addInitScript(() => {
    window.__rafCount = 0;
    const original = window.requestAnimationFrame.bind(window);

    window.requestAnimationFrame = (callback: FrameRequestCallback) =>
      original((time) => {
        window.__rafCount++;
        callback(time);
      });
  });
}

/** Frames rendered during a fixed observation window (a measurement). */
export function countFrames(page: Page, windowMs: number) {
  return page.evaluate(async (ms) => {
    const start = window.__rafCount;
    await new Promise((resolve) => setTimeout(resolve, ms));
    return window.__rafCount - start;
  }, windowMs);
}

/** Loses the live WebGL context the way a GPU reset / tab pressure would. */
export async function loseWebGLContext(page: Page) {
  const lost = await page.evaluate(() => {
    const canvas = document.querySelector("[data-experience-mode] canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return "no-canvas";

    // Asking an existing canvas for its context returns that same context.
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    const extension = gl?.getExtension("WEBGL_lose_context");
    if (!extension) return "no-extension";

    extension.loseContext();
    return "lost";
  });

  if (lost !== "lost") {
    throw new Error(`Could not lose the WebGL context: ${lost}`);
  }
}

export function isWebGLContextLost(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("[data-experience-mode] canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    return gl ? gl.isContextLost() : null;
  });
}
