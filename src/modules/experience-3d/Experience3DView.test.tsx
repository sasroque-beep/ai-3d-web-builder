// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Experience3DSceneProps } from "@/modules/experience-3d/presets/types";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";

const detectors = vi.hoisted(() => ({
  webgl: vi.fn<() => boolean>(),
  reducedMotion: vi.fn<() => boolean>(),
  deviceTier: vi.fn<() => "low" | "unknown">(),
}));

const scene = vi.hoisted(() => ({
  crashOnRender: false,
  rendered: vi.fn(),
}));

vi.mock("@/lib/capability", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/capability")>()),
  detectWebglSupport: detectors.webgl,
  detectPrefersReducedMotion: detectors.reducedMotion,
  detectDeviceTier: detectors.deviceTier,
}));

/**
 * The real scene mounts a WebGL <Canvas> jsdom can't provide — this stand-in
 * exposes the two callbacks the view wires up so each runtime path can be
 * driven from the test.
 */
vi.mock("@/modules/experience-3d/presets/renderers", () => {
  // One stable component identity, like the real `dynamic(...)` scene —
  // a fresh function per call would remount the scene on every render.
  function TestScene({
    config,
    mode,
    onReady,
    onRuntimeFailure,
  }: Experience3DSceneProps) {
    if (scene.crashOnRender) throw new Error("chunk failed to load");
    scene.rendered(config);
    return (
      <div data-testid="scene" data-mode={mode}>
        <button type="button" onClick={onReady}>
          ready
        </button>
        <button type="button" onClick={onRuntimeFailure}>
          context lost
        </button>
      </div>
    );
  }

  return {
    getPresetRenderer: (presetKey: string) =>
      presetKey === "hero-showcase" ? TestScene : undefined,
  };
});

import { Experience3DView } from "@/modules/experience-3d/Experience3DView";

function sceneConfig(
  overrides: Partial<Experience3DSceneConfig> = {},
): Experience3DSceneConfig {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: { shape: "octahedron" },
    fallback2d: {
      imageUrl: "https://cdn.example.com/hero.png",
      imageAlt: "Produto em destaque",
    },
    generatedBy: "manual",
    ...overrides,
  };
}

describe("Experience3DView", () => {
  beforeEach(() => {
    detectors.webgl.mockReturnValue(true);
    detectors.reducedMotion.mockReturnValue(false);
    detectors.deviceTier.mockReturnValue("unknown");
    scene.crashOnRender = false;
    scene.rendered.mockClear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: () => ({
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("server render / first paint", () => {
    it("emits only the 2D fallback, with its alt text and no 3D layer", () => {
      const html = renderToString(
        <Experience3DView sceneConfig={sceneConfig()} />,
      );

      expect(html).toContain("<img");
      expect(html).toContain('src="https://cdn.example.com/hero.png"');
      expect(html).toContain('alt="Produto em destaque"');
      expect(html).toContain('data-experience-mode="FALLBACK_2D"');
      expect(html).not.toContain("<canvas");
      expect(html).not.toContain('data-testid="scene"');
      expect(detectors.webgl).not.toHaveBeenCalled();
    });

    it("emits the same fallback markup even when a mode override is given", () => {
      const withOverride = renderToString(
        <Experience3DView sceneConfig={sceneConfig()} modeOverride="FULL_3D" />,
      );
      const without = renderToString(
        <Experience3DView sceneConfig={sceneConfig()} />,
      );

      expect(withOverride).toBe(without);
    });
  });

  describe("after mount", () => {
    it("keeps the fallback image in the DOM and mounts the 3D layer aria-hidden", () => {
      render(<Experience3DView sceneConfig={sceneConfig()} />);

      expect(screen.getByAltText("Produto em destaque")).toBeInTheDocument();
      const layer = screen.getByTestId("scene").parentElement;
      expect(layer).toHaveAttribute("aria-hidden", "true");
    });

    it("hands the scene the preset-normalized config, not the raw one", () => {
      render(<Experience3DView sceneConfig={sceneConfig()} />);

      expect(scene.rendered).toHaveBeenCalledWith({
        shape: "octahedron",
        primaryColor: "#6d5efc",
        accentColor: "#22d3ee",
        motionIntensity: 0.5,
        particleCount: 40,
      });
    });

    it("mounts the scene in FULL_3D and hides the image only once it is ready", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Experience3DView sceneConfig={sceneConfig()} />,
      );
      const root = container.firstElementChild;
      const image = screen.getByAltText("Produto em destaque");

      expect(screen.getByTestId("scene")).toHaveAttribute(
        "data-mode",
        "FULL_3D",
      );
      expect(root).toHaveAttribute("data-experience-mode", "FALLBACK_2D");
      expect(image).toHaveClass("opacity-100");

      await user.click(screen.getByText("ready"));

      expect(root).toHaveAttribute("data-experience-mode", "FULL_3D");
      expect(image).toHaveClass("opacity-0");
      expect(image).toBeInTheDocument();
    });

    it("mounts the scene in REDUCED_3D with prefers-reduced-motion", () => {
      detectors.reducedMotion.mockReturnValue(true);

      render(<Experience3DView sceneConfig={sceneConfig()} />);

      expect(screen.getByTestId("scene")).toHaveAttribute(
        "data-mode",
        "REDUCED_3D",
      );
    });

    it("never mounts the scene when WebGL is unsupported", () => {
      detectors.webgl.mockReturnValue(false);

      render(<Experience3DView sceneConfig={sceneConfig()} />);

      expect(screen.queryByTestId("scene")).not.toBeInTheDocument();
      expect(screen.getByAltText("Produto em destaque")).toHaveClass(
        "opacity-100",
      );
    });

    it("never mounts the scene when the override forces FALLBACK_2D", () => {
      render(
        <Experience3DView
          sceneConfig={sceneConfig()}
          modeOverride="FALLBACK_2D"
        />,
      );

      expect(screen.queryByTestId("scene")).not.toBeInTheDocument();
      expect(scene.rendered).not.toHaveBeenCalled();
    });
  });

  describe("falling back to 2D", () => {
    it("drops the scene and shows the image again on webglcontextlost", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Experience3DView sceneConfig={sceneConfig()} />,
      );
      await user.click(screen.getByText("ready"));
      expect(screen.getByAltText("Produto em destaque")).toHaveClass(
        "opacity-0",
      );

      await user.click(screen.getByText("context lost"));

      expect(screen.queryByTestId("scene")).not.toBeInTheDocument();
      expect(screen.getByAltText("Produto em destaque")).toHaveClass(
        "opacity-100",
      );
      expect(container.firstElementChild).toHaveAttribute(
        "data-experience-mode",
        "FALLBACK_2D",
      );
    });

    it("falls back to 2D when the scene (or its lazy chunk) throws", () => {
      scene.crashOnRender = true;

      const { container } = render(
        <Experience3DView sceneConfig={sceneConfig()} />,
      );

      expect(screen.queryByTestId("scene")).not.toBeInTheDocument();
      expect(screen.getByAltText("Produto em destaque")).toHaveClass(
        "opacity-100",
      );
      expect(container.firstElementChild).toHaveAttribute(
        "data-experience-mode",
        "FALLBACK_2D",
      );
    });

    it("does not mount a scene for an invalid preset config", () => {
      render(
        <Experience3DView
          sceneConfig={sceneConfig({ config: { shape: "cube" } })}
        />,
      );

      expect(screen.queryByTestId("scene")).not.toBeInTheDocument();
      expect(scene.rendered).not.toHaveBeenCalled();
      expect(screen.getByAltText("Produto em destaque")).toBeInTheDocument();
    });

    it("does not mount a scene for an unregistered preset", () => {
      render(
        <Experience3DView
          sceneConfig={sceneConfig({
            presetKey: "scroll-parallax",
            config: {},
          })}
        />,
      );

      expect(screen.queryByTestId("scene")).not.toBeInTheDocument();
      expect(screen.getByAltText("Produto em destaque")).toBeInTheDocument();
    });
  });

  it("applies the className to the wrapper so the consumer controls sizing", () => {
    const { container } = render(
      <Experience3DView
        sceneConfig={sceneConfig()}
        className="aspect-video w-full"
      />,
    );

    expect(container.firstElementChild).toHaveClass("aspect-video", "w-full");
  });
});
