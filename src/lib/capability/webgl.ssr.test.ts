// @vitest-environment node
import { describe, expect, it } from "vitest";

import { detectWebglSupport } from "./webgl";

describe("detectWebglSupport (no DOM)", () => {
  it("returns false instead of throwing when there is no document", () => {
    expect(detectWebglSupport()).toBe(false);
  });
});
