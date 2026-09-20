"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Canvas3DErrorBoundaryProps {
  /** Called once when the wrapped 3D subtree (or its lazy chunk) throws. */
  onError: (error: Error) => void;
  children: ReactNode;
}

interface Canvas3DErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render crashes and lazy-chunk load failures of the 3D layer.
 * Renders nothing on failure — the 2D fallback is always already in the
 * DOM beneath it, so there is nothing to swap in.
 */
export class Canvas3DErrorBoundary extends Component<
  Canvas3DErrorBoundaryProps,
  Canvas3DErrorBoundaryState
> {
  override state: Canvas3DErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): Canvas3DErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}
