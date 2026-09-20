// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Canvas3DErrorBoundary } from "@/modules/experience-3d/Canvas3DErrorBoundary";

function Boom(): never {
  throw new Error("scene crashed");
}

describe("Canvas3DErrorBoundary", () => {
  beforeEach(() => {
    // React logs every caught render error; that noise is expected here.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders its children when nothing throws", () => {
    render(
      <Canvas3DErrorBoundary onError={vi.fn()}>
        <p>3D layer</p>
      </Canvas3DErrorBoundary>,
    );

    expect(screen.getByText("3D layer")).toBeInTheDocument();
  });

  it("renders nothing and reports the error once when a child throws", () => {
    const onError = vi.fn();

    const { container } = render(
      <Canvas3DErrorBoundary onError={onError}>
        <Boom />
      </Canvas3DErrorBoundary>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(onError).toHaveBeenCalledTimes(1);
    const [reported] = onError.mock.calls[0] ?? [];
    expect(reported).toBeInstanceOf(Error);
    expect(reported).toHaveProperty("message", "scene crashed");
  });
});
