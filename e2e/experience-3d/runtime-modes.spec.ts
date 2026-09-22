import { expect, test } from "../support/fixtures";
import { expectMode, gotoHero } from "../support/hero";
import {
  countFrames,
  installFrameCounter,
  isWebGLContextLost,
  simulateLowEndDevice,
} from "../support/webgl";

/** Long enough to tell a running render loop from an idle one. */
const OBSERVATION_MS = 1_500;

/**
 * R3F disposes an unmounted Canvas (including `forceContextLoss()`) 500 ms
 * later. This outlasts it, so anything that disposal would trigger has
 * happened by the time we look.
 */
const R3F_DISPOSE_SETTLE_MS = 800;

test.describe("FULL_3D", () => {
  test("upgrades the server-rendered 2D fallback to a live 3D scene", async ({
    page,
  }) => {
    const { wrapper, canvas, fallbackImage } = await gotoHero(page);

    await expectMode(wrapper, "FULL_3D");
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);

    // The 3D layer is decorative: hidden from assistive tech, while the same
    // content stays available through the (still attached) fallback image.
    await expect(
      canvas.locator("xpath=ancestor::div[@aria-hidden]"),
    ).toHaveAttribute("aria-hidden", "true");
    await expect(fallbackImage).toBeAttached();

    expect(await isWebGLContextLost(page)).toBe(false);
  });

  test("keeps rendering frames continuously", async ({ page }) => {
    await installFrameCounter(page);
    const { wrapper } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    expect(await countFrames(page, OBSERVATION_MS)).toBeGreaterThanOrEqual(8);
  });
});

test.describe("REDUCED_3D", () => {
  test("is chosen from the very first load with prefers-reduced-motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await installFrameCounter(page);
    const { wrapper, canvas } = await gotoHero(page);

    await expectMode(wrapper, "REDUCED_3D");
    await expect(canvas).toBeVisible();

    // A static frame: the render loop is idle instead of running.
    expect(await countFrames(page, OBSERVATION_MS)).toBeLessThanOrEqual(3);
  });

  test("reacts to prefers-reduced-motion changing while the page is open", async ({
    page,
  }) => {
    const { wrapper } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectMode(wrapper, "REDUCED_3D");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectMode(wrapper, "FULL_3D");
  });

  test("is chosen for a reliably low-end device", async ({ page }) => {
    await simulateLowEndDevice(page);
    const { wrapper, canvas } = await gotoHero(page);

    await expectMode(wrapper, "REDUCED_3D");
    await expect(canvas).toBeVisible();
  });

  test("stops the render loop when switched from FULL_3D at runtime", async ({
    page,
  }) => {
    await installFrameCounter(page);
    const { wrapper, modeButton } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");
    expect(await countFrames(page, OBSERVATION_MS)).toBeGreaterThanOrEqual(8);

    await modeButton("REDUCED_3D").click();
    await expectMode(wrapper, "REDUCED_3D");

    // Let the switch settle (a final static frame) before measuring idleness.
    await countFrames(page, 500);
    expect(await countFrames(page, OBSERVATION_MS)).toBeLessThanOrEqual(3);
  });
});

test.describe("mode override controls", () => {
  test("each mode button drives the experience and reports its state", async ({
    page,
  }) => {
    const { wrapper, canvas, fallbackImage, modeButton } = await gotoHero(page);
    const auto = modeButton("Automático (capabilities reais)");
    await expectMode(wrapper, "FULL_3D");
    await expect(auto).toHaveAttribute("aria-pressed", "true");

    await modeButton("FALLBACK_2D").click();
    await expectMode(wrapper, "FALLBACK_2D");
    await expect(modeButton("FALLBACK_2D")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(canvas).toHaveCount(0);
    await expect(fallbackImage).toBeVisible();

    await modeButton("REDUCED_3D").click();
    await expectMode(wrapper, "REDUCED_3D");
    await expect(canvas).toBeVisible();

    await modeButton("FULL_3D").click();
    await expectMode(wrapper, "FULL_3D");
    await expect(modeButton("FULL_3D")).toHaveAttribute("aria-pressed", "true");
    await expect(auto).toHaveAttribute("aria-pressed", "false");
  });

  // Regression for #42. Discarding the scene made R3F fire `webglcontextlost`
  // on the already-detached canvas, which the runtime took for a real failure
  // and latched — so "Automático" could never recover. R3F fires that event
  // ~500 ms *after* unmounting, hence the waits: an assertion made sooner
  // would pass before the (old) bug had even happened.
  test.describe("Automático after the scene was discarded (#42)", () => {
    const auto = "Automático (capabilities reais)";

    test("recovers once R3F has finished disposing the old scene", async ({
      page,
    }) => {
      const { wrapper, canvas, modeButton } = await gotoHero(page);
      await expectMode(wrapper, "FULL_3D");

      await modeButton("FALLBACK_2D").click();
      await expectMode(wrapper, "FALLBACK_2D");
      await page.waitForTimeout(R3F_DISPOSE_SETTLE_MS);

      await modeButton(auto).click();
      await expectMode(wrapper, "FULL_3D");
      await expect(canvas).toBeVisible();
    });

    test("recovers when switching back before the old scene is disposed", async ({
      page,
    }) => {
      const { wrapper, canvas, modeButton } = await gotoHero(page);
      await expectMode(wrapper, "FULL_3D");

      await modeButton("FALLBACK_2D").click();
      await modeButton(auto).click();
      await expectMode(wrapper, "FULL_3D");

      // The old scene's deferred context loss lands during this window; it
      // must not take the new scene down with it.
      await page.waitForTimeout(R3F_DISPOSE_SETTLE_MS);
      await expectMode(wrapper, "FULL_3D");
      await expect(canvas).toBeVisible();
    });

    test("survives repeated discard/restore cycles", async ({ page }) => {
      const { wrapper, modeButton } = await gotoHero(page);
      await expectMode(wrapper, "FULL_3D");

      for (let cycle = 0; cycle < 3; cycle++) {
        await modeButton("FALLBACK_2D").click();
        await expectMode(wrapper, "FALLBACK_2D");
        await modeButton(auto).click();
        await expectMode(wrapper, "FULL_3D");
        await page.waitForTimeout(R3F_DISPOSE_SETTLE_MS);
        await expectMode(wrapper, "FULL_3D");
      }
    });
  });

  test("changing the shape keeps the 3D scene running without errors", async ({
    page,
  }) => {
    const { wrapper, canvas, modeButton } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    for (const shape of ["torus-knot", "octahedron", "icosahedron"]) {
      await modeButton(shape).click();
      await expect(modeButton(shape)).toHaveAttribute("aria-pressed", "true");
      await expectMode(wrapper, "FULL_3D");
      await expect(canvas).toBeVisible();
    }

    expect(await isWebGLContextLost(page)).toBe(false);
  });
});
