"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/ui/states";

/**
 * @react-three/fiber's <Canvas> requires a real WebGL context and must
 * never run during SSR, so it's excluded from the server bundle and from
 * any route that doesn't render it (Issue #24 acceptance criteria).
 */
const SmokeTestScene = dynamic(
  () =>
    import("@/modules/experience-3d/SmokeTestScene").then(
      (mod) => mod.SmokeTestScene,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);

export function SmokeTestCanvas() {
  return (
    <div className="h-96 w-full overflow-hidden rounded-lg border border-white/10">
      <SmokeTestScene />
    </div>
  );
}
