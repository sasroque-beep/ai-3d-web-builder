import { containsThree } from "../support/chunks";
import { expect, test } from "../support/fixtures";
import {
  expectContentAndCtaUsable,
  expectMode,
  gotoHero,
  heroLocators,
} from "../support/hero";
import {
  disableWebGL,
  isWebGLContextLost,
  loseWebGLContext,
  waitForWebGLProbe,
} from "../support/webgl";

/**
 * The 3D layer is an enhancement that can fail at runtime, after the upfront
 * capability check passed. It must degrade to the 2D fallback and leave the
 * page — content and CTA — working.
 */
test.describe("runtime failure falls back to 2D", () => {
  test("WebGL context loss", async ({ page }) => {
    const { wrapper, canvas, fallbackImage } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    await loseWebGLContext(page);

    await expectMode(wrapper, "FALLBACK_2D");
    await expect(canvas).toHaveCount(0);
    await expect(fallbackImage).toBeVisible();
    await expectContentAndCtaUsable(page);
  });

  test("the 3D chunk failing to download", async ({ page, consoleGuard }) => {
    // React reports the error the boundary caught with console.error; that is
    // the expected trace of this scenario, not noise.
    consoleGuard.allow(
      /console\.error:.*(chunk|Failed to fetch|load)/i,
      "React logs the chunk-load error caught by Canvas3DErrorBoundary",
    );
    consoleGuard.allow(
      /console\.error: Failed to load resource/i,
      "the browser logs the deliberately aborted chunk request",
    );

    let aborted = 0;
    await page.route("**/_next/static/**/*.js", async (route) => {
      const response = await route.fetch();
      const body = await response.text();

      if (containsThree(body)) {
        aborted++;
        await route.abort();
        return;
      }
      await route.fulfill({ response, body });
    });

    const { wrapper, canvas, fallbackImage } = heroLocators(page);
    await page.goto("/dev/experience-3d-hero-showcase");

    // Positive signal that the failure was actually processed: the chunk was
    // requested, refused, and React reported the caught error.
    await expect.poll(() => aborted).toBeGreaterThan(0);
    await consoleGuard.waitFor(/console\.error:/);

    await expectMode(wrapper, "FALLBACK_2D");
    await expect(canvas).toHaveCount(0);
    await expect(fallbackImage).toBeVisible();
    await expectContentAndCtaUsable(page);
  });
});

test.describe("a forced mode cannot break the page", () => {
  test("FULL_3D forced while WebGL is unavailable keeps the page usable", async ({
    page,
    consoleGuard,
  }) => {
    // The override deliberately wins over capability detection (Issue #28),
    // so the scene is mounted with no WebGL and *will* fail: the boundary is
    // what keeps that from taking the page down.
    consoleGuard.allow(
      /WebGL|context|Canvas|three/i,
      "the scene fails to create a context and React logs the caught error",
    );

    await disableWebGL(page);
    const { wrapper, canvas, fallbackImage, modeButton } = await gotoHero(page);
    await waitForWebGLProbe(page);

    await modeButton("FULL_3D").click();

    await expect(fallbackImage).toBeVisible();
    await expectMode(wrapper, "FALLBACK_2D");
    await expect(canvas).toHaveCount(0);
    expect(await isWebGLContextLost(page)).toBeNull();
    await expectContentAndCtaUsable(page);
  });
});
