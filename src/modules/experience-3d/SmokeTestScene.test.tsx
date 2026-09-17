// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * jsdom has no real WebGL context, so <Canvas> from @react-three/fiber
 * cannot actually render here. This test only proves SmokeTestScene
 * composes the expected R3F/Drei primitives correctly — real WebGL
 * rendering is out of scope for unit tests (Issue #24 risks) and left to
 * manual/E2E verification of the smoke-test route.
 */
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: () => {},
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="drei-orbit-controls" />,
}));

describe("experience-3d/SmokeTestScene", () => {
  it("renders the R3F canvas with the spinning cube and Drei controls", async () => {
    const { SmokeTestScene } = await import(
      "@/modules/experience-3d/SmokeTestScene"
    );

    const { getByTestId } = render(<SmokeTestScene />);

    expect(getByTestId("r3f-canvas")).toBeInTheDocument();
    expect(getByTestId("drei-orbit-controls")).toBeInTheDocument();
  });
});
