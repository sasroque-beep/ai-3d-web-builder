// @vitest-environment node
import { describe, expect, it } from "vitest";

import { detectDeviceTier } from "./device";

describe("detectDeviceTier (no browser device signals)", () => {
  it("returns 'unknown' instead of throwing outside a browser environment", () => {
    expect(detectDeviceTier()).toBe("unknown");
  });
});
