import type { Page, Response } from "@playwright/test";

/**
 * A chunk is "3D" if its source contains Three.js. Deciding by content — not
 * by file name or a Next build manifest — keeps this independent of hashed
 * chunk names and of Next internals.
 */
const THREE_MARKER = "WebGLRenderer";

const SCRIPT_URL = /\/_next\/static\/[^"'\s<>]+\.js/g;

export function containsThree(source: string) {
  return source.includes(THREE_MARKER);
}

function isStaticScript(url: string) {
  return /\/_next\/static\/.+\.js(\?|$)/.test(url);
}

/**
 * Script chunks a page's server-rendered HTML references up front (`<script>`
 * and preload/prefetch hints) — i.e. what is downloaded before any user-land
 * decision. Fetched straight from the server, with no browser involved.
 */
export async function eagerScriptUrls(page: Page, path: string) {
  const response = await page.request.get(path);
  const html = await response.text();
  return [...new Set(html.match(SCRIPT_URL) ?? [])];
}

export async function threeChunksAmong(page: Page, scriptPaths: string[]) {
  const found: string[] = [];

  for (const scriptPath of scriptPaths) {
    const response = await page.request.get(scriptPath);
    if (containsThree(await response.text())) found.push(scriptPath);
  }

  return found;
}

/** Records every 3D chunk the browser actually downloads. */
export function trackThreeChunks(page: Page) {
  const urls = new Set<string>();
  const inspections: Promise<void>[] = [];

  page.on("response", (response: Response) => {
    if (!isStaticScript(response.url())) return;

    inspections.push(
      response
        .text()
        .then((source) => {
          if (containsThree(source)) urls.add(response.url());
        })
        // A body that can't be read (aborted/redirected) can't be 3D code
        // that ran, so it is deliberately not counted.
        .catch(() => {}),
    );
  });

  return {
    /** Wait for every response seen so far to be inspected. */
    async downloaded() {
      await Promise.all(inspections);
      return [...urls];
    },
  };
}
