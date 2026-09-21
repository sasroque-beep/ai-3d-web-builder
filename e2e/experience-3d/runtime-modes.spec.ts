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

  // Known product bug, found by this suite and tracked in #42 (not fixed in
  // the Issue that introduced the E2E suite). Discarding the scene makes R3F
  // fire `webglcontextlost` on the detached canvas, which the runtime takes
  // for a real failure and latches, so "Automático" can never recover.
  // Re-enable (drop `.fixme`) when #42 is fixed.
  test.fixme("Automático recovers after the scene was discarded (#42)", async ({
    page,
  }) => {
    const { wrapper, modeButton } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    await modeButton("FALLBACK_2D").click();
    await expectMode(wrapper, "FALLBACK_2D");

    await modeButton("Automático (capabilities reais)").click();
    await expectMode(wrapper, "FULL_3D");
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
