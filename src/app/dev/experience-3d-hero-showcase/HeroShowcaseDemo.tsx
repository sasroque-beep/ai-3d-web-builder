"use client";

import { useState } from "react";

import type { ExperienceRuntimeMode } from "@/lib/capability";
import { Experience3DView } from "@/modules/experience-3d/Experience3DView";
import {
  HERO_SHOWCASE_PRESET_KEY,
  HERO_SHOWCASE_SHAPES,
  type HeroShowcaseShape,
} from "@/modules/experience-3d/presets/hero-showcase/config";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";

type ModeChoice = "auto" | ExperienceRuntimeMode;

const MODE_CHOICES: { value: ModeChoice; label: string }[] = [
  { value: "auto", label: "Automático (capabilities reais)" },
  { value: "FULL_3D", label: "FULL_3D" },
  { value: "REDUCED_3D", label: "REDUCED_3D" },
  { value: "FALLBACK_2D", label: "FALLBACK_2D" },
];

const buttonClass = (active: boolean) =>
  `rounded-md border px-3 py-1.5 text-sm ${
    active
      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20"
      : "border-white/10 hover:border-white/30"
  }`;

/**
 * Manual validation harness for Issue #37 — not part of any product flow.
 * The override buttons feed `modeOverride` (the reserved policy override
 * from Issue #28) so every runtime mode can be seen without changing OS or
 * browser settings.
 */
export function HeroShowcaseDemo() {
  const [choice, setChoice] = useState<ModeChoice>("auto");
  const [shape, setShape] = useState<HeroShowcaseShape>("icosahedron");

  const sceneConfig: Experience3DSceneConfig = {
    sectionId: "dev-demo-section",
    presetKey: HERO_SHOWCASE_PRESET_KEY,
    config: { shape, motionIntensity: 0.6, particleCount: 60 },
    fallback2d: {
      imageUrl: "/dev/hero-showcase-fallback.svg",
      imageAlt: "Forma geométrica abstrata em roxo com anel ciano",
    },
    generatedBy: "manual",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="mb-1 text-sm text-foreground/70">Modo</legend>
          {MODE_CHOICES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={choice === option.value}
              className={buttonClass(choice === option.value)}
              onClick={() => setChoice(option.value)}
            >
              {option.label}
            </button>
          ))}
        </fieldset>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="mb-1 text-sm text-foreground/70">Forma</legend>
          {HERO_SHOWCASE_SHAPES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={shape === option}
              className={buttonClass(shape === option)}
              onClick={() => setShape(option)}
            >
              {option}
            </button>
          ))}
        </fieldset>
      </div>

      <Experience3DView
        sceneConfig={sceneConfig}
        className="aspect-video w-full rounded-lg border border-white/10"
        modeOverride={choice === "auto" ? null : choice}
      />

      <section className="flex flex-col items-start gap-2 rounded-lg border border-white/10 p-4">
        <h2 className="text-lg font-semibold">Conteúdo e CTA</h2>
        <p className="text-sm text-foreground/70">
          Este bloco é HTML comum, fora do componente 3D: continua idêntico e
          funcional em qualquer modo, inclusive sem WebGL.
        </p>
        <a
          href="#contato"
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium"
        >
          Falar com a equipe
        </a>
      </section>
    </div>
  );
}
