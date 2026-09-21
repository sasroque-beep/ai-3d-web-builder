import { expect, test } from "../support/fixtures";
import {
  expectContentAndCtaUsable,
  expectMode,
  gotoHero,
  HERO_PATH,
  heroLocators,
} from "../support/hero";
import { disableWebGL, waitForWebGLProbe } from "../support/webgl";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the server-rendered page already carries the fallback, content and CTA", async ({
    page,
  }) => {
    await page.goto(HERO_PATH);
    const { wrapper, canvas, fallbackImage, cta } = heroLocators(page);

    await expectMode(wrapper, "FALLBACK_2D");
    await expect(fallbackImage).toBeVisible();
    await expect(canvas).toHaveCount(0);
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#contato");

    // A plain anchor works with no JS at all.
    await cta.click();
    await expect(page).toHaveURL(/#contato$/);
  });
});

test.describe("without WebGL", () => {
  test("stays on the 2D fallback, and never mounts a canvas", async ({
    page,
  }) => {
    await disableWebGL(page);
    const { wrapper, canvas, fallbackImage } = await gotoHero(page);

    // Detection really ran (and found nothing) before we assert the outcome.
    await waitForWebGLProbe(page);

    await expectMode(wrapper, "FALLBACK_2D");
    await expect(fallbackImage).toBeVisible();
    await expect(fallbackImage).toHaveAttribute(
      "src",
      "/dev/hero-showcase-fallback.svg",
    );
    await expect(canvas).toHaveCount(0);
  });

  test("the fallback image really loads", async ({ page }) => {
    await disableWebGL(page);
    const { fallbackImage } = await gotoHero(page);
    await waitForWebGLProbe(page);

    const naturalWidth = await fallbackImage.evaluate(
      (image) => (image as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });
});

/**
 * The buying journey must not depend on the 3D: the same content and a
 * working CTA in every state the experience can be in.
 */
test.describe("content and CTA stay usable in every state", () => {
  test("FULL_3D", async ({ page }) => {
    const { wrapper } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    await expectContentAndCtaUsable(page);
  });

  test("REDUCED_3D", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { wrapper } = await gotoHero(page);
    await expectMode(wrapper, "REDUCED_3D");

    await expectContentAndCtaUsable(page);
  });

  test("FALLBACK_2D forced by the override", async ({ page }) => {
    const { wrapper, modeButton } = await gotoHero(page);
    await modeButton("FALLBACK_2D").click();
    await expectMode(wrapper, "FALLBACK_2D");

    await expectContentAndCtaUsable(page);
  });

  test("no WebGL at all", async ({ page }) => {
    await disableWebGL(page);
    await gotoHero(page);
    await waitForWebGLProbe(page);

    await expectContentAndCtaUsable(page);
  });
});
