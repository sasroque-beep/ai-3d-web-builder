import type { Metadata } from "next";

import { HeroShowcaseDemo } from "@/app/dev/experience-3d-hero-showcase/HeroShowcaseDemo";

export const metadata: Metadata = {
  title: "Hero Showcase — Experience 3D",
};

/**
 * Isolated dev-only route for Issue #37: exercises the first real preset
 * and the runtime (mode decision, lazy 3D layer, 2D fallback) without any
 * integration with site-builder, design or persistence. Not linked from any
 * product navigation.
 */
export default function Experience3DHeroShowcasePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Dev / preset
        </p>
        <h1 className="text-3xl font-bold">Experience 3D — Hero Showcase</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Rota isolada da Issue #37. Primeiro preset procedural, com runtime
          FULL_3D / REDUCED_3D / FALLBACK_2D e fallback 2D sempre presente.
        </p>
      </div>

      <HeroShowcaseDemo />
    </main>
  );
}
