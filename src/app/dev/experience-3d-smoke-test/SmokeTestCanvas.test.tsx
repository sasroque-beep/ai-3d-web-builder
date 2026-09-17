// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * The real SmokeTestScene mounts a WebGL <Canvas>, which jsdom can't
 * provide, so it's replaced here — this test only verifies the dynamic
 * import/loading contract (Skeleton while loading, real content once
 * resolved), not R3F rendering itself (see SmokeTestScene.test.tsx).
 */
vi.mock("@/modules/experience-3d/SmokeTestScene", () => ({
  SmokeTestScene: () => <div data-testid="smoke-test-scene" />,
}));

describe("dev/experience-3d-smoke-test/SmokeTestCanvas", () => {
  it("shows a skeleton while the 3D scene loads, then renders it", async () => {
    const { SmokeTestCanvas } = await import(
      "@/app/dev/experience-3d-smoke-test/SmokeTestCanvas"
    );

    render(<SmokeTestCanvas />);

    expect(
      screen.getByRole("presentation", { hidden: true }),
    ).toBeInTheDocument();

    expect(await screen.findByTestId("smoke-test-scene")).toBeInTheDocument();
  });
});
