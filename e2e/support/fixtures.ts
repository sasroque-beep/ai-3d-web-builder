import { test as base, expect } from "@playwright/test";

/**
 * Console/network noise that is known, harmless and reproducible. Every entry
 * needs a reason — an unexplained entry is just a hidden bug. Keep this list
 * empty until the suite actually meets noise; per-test expectations (see
 * `consoleGuard.allow`) are preferred for anything scenario-specific.
 */
const KNOWN_BENIGN: ReadonlyArray<{ pattern: RegExp; reason: string }> = [];

export interface ConsoleGuard {
  /** Declares an expected problem for this test only, with a reason. */
  allow(pattern: RegExp, reason: string): void;
  /** Resolves once a matching problem was recorded (a positive signal). */
  waitFor(pattern: RegExp): Promise<void>;
}

/**
 * Every test fails on an uncaught page error, a `console.error`, or a
 * same-origin HTTP error, unless it was explicitly allowed. That is the
 * suite's "no critical console errors" check — applied to every scenario,
 * not just to one test that could be forgotten.
 */
export const test = base.extend<{ consoleGuard: ConsoleGuard }>({
  consoleGuard: [
    async ({ page, baseURL }, run) => {
      const problems: string[] = [];
      const allowed: Array<{ pattern: RegExp; reason: string }> = [
        ...KNOWN_BENIGN,
      ];
      const waiters: Array<{ pattern: RegExp; resolve: () => void }> = [];

      const record = (message: string) => {
        problems.push(message);
        for (const waiter of waiters) {
          if (waiter.pattern.test(message)) waiter.resolve();
        }
      };

      page.on("pageerror", (error) => record(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") {
          record(`console.error: ${message.text()}`);
        }
      });
      page.on("response", (response) => {
        const sameOrigin = baseURL && response.url().startsWith(baseURL);
        if (sameOrigin && response.status() >= 400) {
          record(`HTTP ${response.status()}: ${response.url()}`);
        }
      });

      await run({
        allow: (pattern, reason) => {
          if (!reason.trim()) throw new Error("allow() needs a reason");
          allowed.push({ pattern, reason });
        },
        waitFor: (pattern) =>
          new Promise<void>((resolve) => {
            if (problems.some((problem) => pattern.test(problem))) {
              resolve();
              return;
            }
            waiters.push({ pattern, resolve });
          }),
      });

      const unexpected = problems.filter(
        (problem) => !allowed.some(({ pattern }) => pattern.test(problem)),
      );
      expect(
        unexpected,
        "unexpected console errors / page errors / HTTP errors",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
