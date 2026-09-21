import { expect, test } from "./support/fixtures";

/**
 * Probe: the rest of the suite assumes the browser can create a WebGL2
 * context. If it can't, every 3D test would fail in a confusing way, so this
 * fails first, loudly and with the actual reason.
 */
test("the E2E browser provides a working WebGL2 context", async ({ page }) => {
  await page.goto("/");

  const info = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return { supported: false as const };

    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      supported: true as const,
      renderer: debug
        ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
        : "unknown",
    };
  });

  expect(
    info.supported,
    "WebGL2 is unavailable in this browser: FULL_3D/REDUCED_3D cannot be validated. Check the SwiftShader launch args in playwright.config.ts.",
  ).toBe(true);
  console.log(`WebGL2 renderer: ${info.supported ? info.renderer : "n/a"}`);
});
