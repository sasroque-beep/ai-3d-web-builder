import { existsSync } from "node:fs";

import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

/**
 * Chromium is the only mandatory browser. Firefox and WebKit are declared
 * so enabling them later is a matter of installing the browser and listing
 * it in `E2E_BROWSERS` (e.g. `E2E_BROWSERS=chromium,firefox`) — nothing else
 * in this file or in the specs has to be restructured. They are NOT run in
 * CI and have not been validated: any Chromium-only behavior lives in
 * `e2e/support/`, never in a spec.
 */
const PROJECTS = {
  chromium: {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      launchOptions: {
        // Force software (SwiftShader) WebGL everywhere — CI runners have no
        // GPU, and using it on developer machines too keeps results the same.
        args: [
          "--use-angle=swiftshader",
          "--enable-unsafe-swiftshader",
          "--ignore-gpu-blocklist",
        ],
      },
    },
  },
  firefox: { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  webkit: { name: "webkit", use: { ...devices["Desktop Safari"] } },
} satisfies Record<
  string,
  NonNullable<PlaywrightTestConfig["projects"]>[number]
>;

type BrowserName = keyof typeof PROJECTS;

function selectedBrowsers(): BrowserName[] {
  const requested = (process.env.E2E_BROWSERS ?? "chromium")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const unknown = requested.filter((name) => !(name in PROJECTS));
  if (unknown.length > 0) {
    throw new Error(
      `E2E_BROWSERS has unknown browser(s): ${unknown.join(", ")}. ` +
        `Valid: ${Object.keys(PROJECTS).join(", ")}.`,
    );
  }

  return requested as BrowserName[];
}

// The suite runs against the production server (real code-splitting, real
// SSR), so a build must exist. Failing here beats a confusing 404/timeout.
if (!existsSync(".next/BUILD_ID")) {
  throw new Error(
    "No production build found (.next/BUILD_ID). Run `pnpm build` before `pnpm test:e2e`.",
  );
}

export default defineConfig({
  testDir: "./e2e",
  // WebGL through software (SwiftShader) rendering is CPU-heavy: parallel
  // workers starve each other and turn into timeouts (measured: 10% failures
  // with 2 workers on a 4-core machine). One worker, everywhere, on purpose.
  fullyParallel: false,
  workers: 1,
  // No retries: a retry would hide exactly the flakiness this suite must expose.
  retries: 0,
  forbidOnly: isCI,
  timeout: 30_000,
  expect: { timeout: 15_000 },
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    // Diagnostic artifacts on failure only — never used as assertions.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: selectedBrowsers().map((name) => PROJECTS[name]),
  webServer: {
    command: "pnpm start",
    env: { PORT: String(PORT) },
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
