import type { Metadata } from "next";

import { SmokeTestCanvas } from "@/app/dev/experience-3d-smoke-test/SmokeTestCanvas";

export const metadata: Metadata = {
  title: "Smoke test — Experience 3D",
};

/**
 * Isolated dev-only route for Issue #24: validates React Three Fiber +
 * Drei render correctly under Next.js App Router/React 19, without wiring
 * anything into site-builder, design or persistence. Not linked from any
 * product navigation.
 */
export default function Experience3DSmokeTestPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Dev / smoke test
        </p>
        <h1 className="text-3xl font-bold">Experience 3D — fundação técnica</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Rota isolada da Issue #24. Valida React Three Fiber + Drei sobre
          Three.js, sem integração com o site-builder.
        </p>
      </div>

      <SmokeTestCanvas />
    </main>
  );
}
