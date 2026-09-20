// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const detectors = vi.hoisted(() => ({
  webgl: vi.fn<() => boolean>(),
  reducedMotion: vi.fn<() => boolean>(),
  deviceTier: vi.fn<() => "low" | "unknown">(),
}));

vi.mock("@/lib/capability", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/capability")>()),
  detectWebglSupport: detectors.webgl,
  detectPrefersReducedMotion: detectors.reducedMotion,
  detectDeviceTier: detectors.deviceTier,
}));

import { useExperienceMode } from "@/modules/experience-3d/useExperienceMode";

let mediaListeners: Array<() => void> = [];

function installMatchMedia() {
  mediaListeners = [];
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({
      addEventListener: (_type: string, listener: () => void) => {
        mediaListeners.push(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        mediaListeners = mediaListeners.filter((item) => item !== listener);
      },
    }),
  });
}

describe("useExperienceMode", () => {
  beforeEach(() => {
    detectors.webgl.mockReturnValue(true);
    detectors.reducedMotion.mockReturnValue(false);
    detectors.deviceTier.mockReturnValue("unknown");
    installMatchMedia();
  });

  it("starts as FALLBACK_2D and unresolved on the server / first render", () => {
    function Probe() {
      const { mode, resolved } = useExperienceMode();
      return <span>{`${mode}|${resolved}`}</span>;
    }

    expect(renderToString(<Probe />)).toContain("FALLBACK_2D|false");
    expect(detectors.webgl).not.toHaveBeenCalled();
  });

  it("resolves FULL_3D after mount when WebGL is available", () => {
    const { result } = renderHook(() => useExperienceMode());

    expect(result.current.mode).toBe("FULL_3D");
    expect(result.current.resolved).toBe(true);
  });

  it("resolves FALLBACK_2D when WebGL is not supported", () => {
    detectors.webgl.mockReturnValue(false);

    const { result } = renderHook(() => useExperienceMode());

    expect(result.current.mode).toBe("FALLBACK_2D");
    expect(result.current.resolved).toBe(true);
  });

  it("resolves REDUCED_3D for prefers-reduced-motion", () => {
    detectors.reducedMotion.mockReturnValue(true);

    const { result } = renderHook(() => useExperienceMode());

    expect(result.current.mode).toBe("REDUCED_3D");
  });

  it("resolves REDUCED_3D for a reliably low-end device", () => {
    detectors.deviceTier.mockReturnValue("low");

    const { result } = renderHook(() => useExperienceMode());

    expect(result.current.mode).toBe("REDUCED_3D");
  });

  it("forces FALLBACK_2D once a runtime failure is reported", () => {
    const { result } = renderHook(() => useExperienceMode());
    expect(result.current.mode).toBe("FULL_3D");

    act(() => result.current.reportRuntimeFailure());

    expect(result.current.mode).toBe("FALLBACK_2D");
  });

  it("keeps a stable reportRuntimeFailure across re-renders", () => {
    const { result, rerender } = renderHook(() => useExperienceMode());
    const first = result.current.reportRuntimeFailure;

    rerender();

    expect(result.current.reportRuntimeFailure).toBe(first);
  });

  it("lets an explicit override win, but only after mount", () => {
    const { result } = renderHook(() =>
      useExperienceMode({ modeOverride: "REDUCED_3D" }),
    );

    expect(result.current.mode).toBe("REDUCED_3D");
  });

  it("reacts when prefers-reduced-motion changes while mounted", () => {
    const { result } = renderHook(() => useExperienceMode());
    expect(result.current.mode).toBe("FULL_3D");

    detectors.reducedMotion.mockReturnValue(true);
    act(() => {
      for (const listener of mediaListeners) listener();
    });

    expect(result.current.mode).toBe("REDUCED_3D");
  });

  it("stops listening to prefers-reduced-motion on unmount", () => {
    const { unmount } = renderHook(() => useExperienceMode());
    expect(mediaListeners).toHaveLength(1);

    unmount();

    expect(mediaListeners).toHaveLength(0);
  });

  it("still resolves when matchMedia is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useExperienceMode());

    expect(result.current.mode).toBe("FULL_3D");
  });
});
