import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Everything here goes through what the page already exposes — roles, alt
 * text and the `data-experience-mode` attribute — so the suite needs no
 * test-only hooks in product code.
 */
export const HERO_PATH = "/dev/experience-3d-hero-showcase";

export const HERO_FALLBACK_ALT =
  "Forma geométrica abstrata em roxo com anel ciano";

export const CTA_NAME = "Falar com a equipe";

export type ExperienceMode = "FULL_3D" | "REDUCED_3D" | "FALLBACK_2D";

export function heroLocators(page: Page) {
  const wrapper = page.locator("[data-experience-mode]");

  return {
    wrapper,
    canvas: wrapper.locator("canvas"),
    fallbackImage: wrapper.getByRole("img", { name: HERO_FALLBACK_ALT }),
    cta: page.getByRole("link", { name: CTA_NAME }),
    contentHeading: page.getByRole("heading", { name: "Conteúdo e CTA" }),
    modeButton: (name: string) =>
      page.getByRole("button", { name, exact: true }),
  };
}

export function expectMode(wrapper: Locator, mode: ExperienceMode) {
  return expect(wrapper).toHaveAttribute("data-experience-mode", mode);
}

/**
 * React tags every DOM node it hydrates with an internal `__reactFiber$…`
 * key, so this is a reliable "the client took over" signal. Without it, an
 * assertion like "stays FALLBACK_2D" could pass simply because hydration
 * (and therefore capability detection) had not run yet.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const node = document.querySelector("[data-experience-mode]");
    return (
      node !== null &&
      Object.keys(node).some((key) => key.startsWith("__reactFiber"))
    );
  });
}

export async function gotoHero(page: Page) {
  await page.goto(HERO_PATH);
  await waitForHydration(page);
  return heroLocators(page);
}

/** The CTA must be reachable and actually work, whatever the 3D is doing. */
export async function expectContentAndCtaUsable(page: Page) {
  const { contentHeading, cta } = heroLocators(page);

  await expect(contentHeading).toBeVisible();
  await expect(cta).toBeVisible();
  await expect(cta).toBeEnabled();
  // `click` also fails if something (e.g. the canvas layer) covers the link.
  await cta.click();
  await expect(page).toHaveURL(/#contato$/);
}
