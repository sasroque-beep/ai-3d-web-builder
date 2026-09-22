// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { type ReactNode, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HERO_SHOWCASE_DEFAULTS,
  type HeroShowcaseConfig,
} from "@/modules/experience-3d/presets/hero-showcase/config";

/**
 * jsdom has no WebGL context, so R3F's <Canvas> can't really render here
 * (same constraint as SmokeTestScene.test.tsx). The mock records the props
 * the scene passes to <Canvas> and exposes a fake WebGL canvas element, which
 * is enough to prove the FULL_3D/REDUCED_3D behaviour and the context-loss
 * wiring; real rendering is left to manual validation of the dev route.
 */
const canvas = vi.hoisted(() => ({
  domElement: undefined as unknown as HTMLCanvasElement,
}));

vi.mock("@react-three/fiber", async () => {
  const { useEffect } = await import("react");

  return {
    Canvas: ({
      children,
      frameloop,
      dpr,
      onCreated,
    }: {
      children: ReactNode;
      frameloop: string;
      dpr: unknown;
      onCreated: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
    }) => {
      // Like the real R3F, `onCreated` fires after mount (once the renderer
      // exists), never during render — so the scene is free to set state
      // from it. It also re-fires on every (Strict Mode) re-mount.
      useEffect(() => {
        onCreated({ gl: { domElement: canvas.domElement } });
      }, []);

      return (
        <div
          data-testid="r3f-canvas"
          data-frameloop={frameloop}
          data-dpr={JSON.stringify(dpr)}
        >
          {children}
        </div>
      );
    },
    useFrame: () => {},
  };
});

vi.mock("@react-three/drei", () => ({
  Float: ({ children }: { children: ReactNode }) => (
    <div data-testid="drei-float">{children}</div>
  ),
}));

import {
  createParticlePositions,
  HeroShowcaseScene,
} from "@/modules/experience-3d/presets/hero-showcase/HeroShowcaseScene";

function config(overrides: Partial<HeroShowcaseConfig> = {}) {
  return { ...HERO_SHOWCASE_DEFAULTS, ...overrides };
}

describe("hero-showcase/HeroShowcaseScene", () => {
  beforeEach(() => {
    canvas.domElement = document.createElement("canvas");
    // R3F intrinsics (<mesh>, <bufferAttribute>…) are unknown DOM tags here.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("animates continuously in FULL_3D: always-on frameloop, Float and particles", () => {
    const { container } = render(
      <HeroShowcaseScene
        config={config({ motionIntensity: 0.6, particleCount: 30 })}
        mode="FULL_3D"
        onReady={vi.fn()}
        onRuntimeFailure={vi.fn()}
      />,
    );

    const root = screen.getByTestId("r3f-canvas");
    expect(root).toHaveAttribute("data-frameloop", "always");
    expect(root).toHaveAttribute("data-dpr", "[1,2]");
    expect(screen.getByTestId("drei-float")).toBeInTheDocument();
    expect(container.querySelector("points")).not.toBeNull();
  });

  it("renders a single static frame in REDUCED_3D: demand frameloop, DPR 1, no float, no particles", () => {
    const { container } = render(
      <HeroShowcaseScene
        config={config({ motionIntensity: 1, particleCount: 120 })}
        mode="REDUCED_3D"
        onReady={vi.fn()}
        onRuntimeFailure={vi.fn()}
      />,
    );

    const root = screen.getByTestId("r3f-canvas");
    expect(root).toHaveAttribute("data-frameloop", "demand");
    expect(root).toHaveAttribute("data-dpr", "1");
    expect(screen.queryByTestId("drei-float")).not.toBeInTheDocument();
    expect(container.querySelector("points")).toBeNull();
    expect(container.querySelector("mesh")).not.toBeNull();
  });

  it("stops the render loop in FULL_3D when motionIntensity is 0", () => {
    render(
      <HeroShowcaseScene
        config={config({ motionIntensity: 0 })}
        mode="FULL_3D"
        onReady={vi.fn()}
        onRuntimeFailure={vi.fn()}
      />,
    );

    expect(screen.getByTestId("r3f-canvas")).toHaveAttribute(
      "data-frameloop",
      "demand",
    );
    expect(screen.queryByTestId("drei-float")).not.toBeInTheDocument();
  });

  it("omits particles when particleCount is 0", () => {
    const { container } = render(
      <HeroShowcaseScene
        config={config({ particleCount: 0 })}
        mode="FULL_3D"
        onReady={vi.fn()}
        onRuntimeFailure={vi.fn()}
      />,
    );

    expect(container.querySelector("points")).toBeNull();
  });

  it("reports ready once the WebGL context exists", () => {
    const onReady = vi.fn();

    render(
      <HeroShowcaseScene
        config={config()}
        mode="FULL_3D"
        onReady={onReady}
        onRuntimeFailure={vi.fn()}
      />,
    );

    expect(onReady).toHaveBeenCalled();
  });

  it("reports a runtime failure and prevents default on webglcontextlost", () => {
    const onRuntimeFailure = vi.fn();
    render(
      <HeroShowcaseScene
        config={config()}
        mode="FULL_3D"
        onReady={vi.fn()}
        onRuntimeFailure={onRuntimeFailure}
      />,
    );
    expect(onRuntimeFailure).not.toHaveBeenCalled();

    const event = new Event("webglcontextlost", { cancelable: true });
    canvas.domElement.dispatchEvent(event);

    expect(onRuntimeFailure).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  describe("webglcontextlost after the scene is discarded (Issue #42)", () => {
    // R3F calls `gl.forceContextLoss()` ~500 ms *after* unmounting a Canvas,
    // which fires `webglcontextlost` on a canvas that is already gone. That
    // is the application discarding the scene, not a WebGL failure.
    it("does not report a runtime failure when it is unmounted on purpose", () => {
      const onRuntimeFailure = vi.fn();
      const { unmount } = render(
        <HeroShowcaseScene
          config={config()}
          mode="FULL_3D"
          onReady={vi.fn()}
          onRuntimeFailure={onRuntimeFailure}
        />,
      );

      unmount();
      canvas.domElement.dispatchEvent(
        new Event("webglcontextlost", { cancelable: true }),
      );

      expect(onRuntimeFailure).not.toHaveBeenCalled();
    });

    it("still reports a real loss exactly once under React Strict Mode", () => {
      const onRuntimeFailure = vi.fn();
      render(
        <StrictMode>
          <HeroShowcaseScene
            config={config()}
            mode="FULL_3D"
            onReady={vi.fn()}
            onRuntimeFailure={onRuntimeFailure}
          />
        </StrictMode>,
      );

      canvas.domElement.dispatchEvent(
        new Event("webglcontextlost", { cancelable: true }),
      );

      // Strict Mode mounts, unmounts and re-mounts: the listener must be
      // neither lost for good (0 calls) nor leaked by the first mount (2).
      expect(onRuntimeFailure).toHaveBeenCalledTimes(1);
    });

    it("does not leak listeners when the scene is mounted and discarded repeatedly", () => {
      const onRuntimeFailure = vi.fn();

      for (let i = 0; i < 3; i++) {
        const { unmount } = render(
          <HeroShowcaseScene
            config={config()}
            mode="FULL_3D"
            onReady={vi.fn()}
            onRuntimeFailure={onRuntimeFailure}
          />,
        );
        unmount();
      }
      canvas.domElement.dispatchEvent(
        new Event("webglcontextlost", { cancelable: true }),
      );

      expect(onRuntimeFailure).not.toHaveBeenCalled();
    });
  });

  it.each(["icosahedron", "torus-knot", "octahedron"] as const)(
    "renders the %s geometry",
    (shape) => {
      const { container } = render(
        <HeroShowcaseScene
          config={config({ shape })}
          mode="REDUCED_3D"
          onReady={vi.fn()}
          onRuntimeFailure={vi.fn()}
        />,
      );

      const geometry = {
        icosahedron: "icosahedrongeometry",
        "torus-knot": "torusknotgeometry",
        octahedron: "octahedrongeometry",
      }[shape];
      expect(container.querySelector(geometry)).not.toBeNull();
    },
  );
});

describe("hero-showcase/createParticlePositions", () => {
  it("returns 3 floats per particle", () => {
    expect(createParticlePositions(25)).toHaveLength(75);
    expect(createParticlePositions(0)).toHaveLength(0);
  });

  it("is deterministic across calls", () => {
    expect(createParticlePositions(40)).toEqual(createParticlePositions(40));
  });

  it("keeps every particle on the shell around the hero shape", () => {
    const positions = createParticlePositions(120);

    for (let i = 0; i < positions.length; i += 3) {
      const radius = Math.hypot(
        positions[i] ?? 0,
        positions[i + 1] ?? 0,
        positions[i + 2] ?? 0,
      );
      expect(radius).toBeGreaterThanOrEqual(2.39);
      expect(radius).toBeLessThanOrEqual(3.61);
    }
  });
});
