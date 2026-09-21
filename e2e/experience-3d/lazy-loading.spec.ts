import {
  eagerScriptUrls,
  threeChunksAmong,
  trackThreeChunks,
} from "../support/chunks";
import { expect, test } from "../support/fixtures";
import { expectMode, gotoHero, HERO_PATH } from "../support/hero";
import { disableWebGL, waitForWebGLProbe } from "../support/webgl";

/**
 * Three.js/R3F/Drei are a large payload. The whole point of the code-split is
 * that nobody pays for it unless a 3D scene is actually about to run.
 */
test.describe("3D code is loaded lazily", () => {
  test("the hero page's initial HTML references no 3D chunk", async ({
    page,
  }) => {
    const scripts = await eagerScriptUrls(page, HERO_PATH);

    // Guards the guard: the page does ship scripts, we're just not finding 3D.
    expect(scripts.length).toBeGreaterThan(0);
    expect(await threeChunksAmong(page, scripts)).toEqual([]);
  });

  test("the 3D chunk is fetched after hydration, once a scene is going to run", async ({
    page,
  }) => {
    const tracker = trackThreeChunks(page);
    const eager = await threeChunksAmong(
      page,
      await eagerScriptUrls(page, HERO_PATH),
    );

    const { wrapper } = await gotoHero(page);
    await expectMode(wrapper, "FULL_3D");

    const downloaded = await tracker.downloaded();
    expect(downloaded.length).toBeGreaterThan(0);
    // ...and it arrived because of the dynamic import, not the HTML.
    expect(eager).toEqual([]);
  });

  test("without WebGL the 3D chunk is never downloaded", async ({ page }) => {
    const tracker = trackThreeChunks(page);
    await disableWebGL(page);

    await gotoHero(page);
    await waitForWebGLProbe(page);
    await page.waitForLoadState("networkidle");

    expect(await tracker.downloaded()).toEqual([]);
  });

  test("forcing FALLBACK_2D after load does not download anything new", async ({
    page,
  }) => {
    await disableWebGL(page);
    const tracker = trackThreeChunks(page);
    const { wrapper, modeButton } = await gotoHero(page);
    await waitForWebGLProbe(page);

    await modeButton("FALLBACK_2D").click();
    await expectMode(wrapper, "FALLBACK_2D");
    await page.waitForLoadState("networkidle");

    expect(await tracker.downloaded()).toEqual([]);
  });
});

test.describe("pages that do not use 3D never load it", () => {
  for (const path of ["/", "/leads/new"]) {
    test(`${path}`, async ({ page }) => {
      const tracker = trackThreeChunks(page);

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(await tracker.downloaded()).toEqual([]);
    });
  }
});
