// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

/**
 * The 3D layer itself is covered by Experience3DView/HeroShowcaseScene tests;
 * here the view is a stand-in that surfaces the props the demo controls.
 */
vi.mock("@/modules/experience-3d/Experience3DView", () => ({
  Experience3DView: ({
    sceneConfig,
    modeOverride,
  }: {
    sceneConfig: {
      config: { shape: string };
      fallback2d: { imageAlt: string };
    };
    modeOverride: string | null;
  }) => (
    <div
      data-testid="view"
      data-shape={sceneConfig.config.shape}
      data-override={String(modeOverride)}
    />
  ),
}));

import { HeroShowcaseDemo } from "@/app/dev/experience-3d-hero-showcase/HeroShowcaseDemo";

describe("dev/experience-3d-hero-showcase/HeroShowcaseDemo", () => {
  it("starts in automatic mode with the default shape", () => {
    render(<HeroShowcaseDemo />);

    const view = screen.getByTestId("view");
    expect(view).toHaveAttribute("data-override", "null");
    expect(view).toHaveAttribute("data-shape", "icosahedron");
  });

  it("forces the chosen runtime mode and shape through the view props", async () => {
    const user = userEvent.setup();
    render(<HeroShowcaseDemo />);

    await user.click(screen.getByRole("button", { name: "REDUCED_3D" }));
    await user.click(screen.getByRole("button", { name: "torus-knot" }));

    const view = screen.getByTestId("view");
    expect(view).toHaveAttribute("data-override", "REDUCED_3D");
    expect(view).toHaveAttribute("data-shape", "torus-knot");
  });

  it("keeps the content and CTA outside the 3D component", () => {
    render(<HeroShowcaseDemo />);

    expect(
      screen.getByRole("link", { name: "Falar com a equipe" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("view")).not.toContainElement(
      screen.getByRole("link", { name: "Falar com a equipe" }),
    );
  });
});
