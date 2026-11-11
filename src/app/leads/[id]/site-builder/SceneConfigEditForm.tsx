"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { upsertExperience3DSceneConfigAction } from "@/modules/experience-3d/actions";
import {
  HERO_SHOWCASE_DEFAULTS,
  HERO_SHOWCASE_MAX_PARTICLES,
  HERO_SHOWCASE_PRESET_KEY,
  HERO_SHOWCASE_SHAPES,
  type HeroShowcaseShape,
} from "@/modules/experience-3d/presets/hero-showcase/config";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";
import { initialUpsertExperience3DSceneConfigActionState } from "@/modules/experience-3d/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

function SubmitButton({
  hasAttemptedSubmit,
}: {
  hasAttemptedSubmit: React.MutableRefObject<boolean>;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={() => {
        hasAttemptedSubmit.current = true;
      }}
      className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

interface SceneConfigEditFormProps {
  sectionId: string;
  experience3d: Experience3DSceneConfig | null;
  onSaved: () => void;
  onCancel: () => void;
}

/**
 * Edits a section's 3D experience — only the `hero-showcase` preset's
 * fields today (Issue #37 is the only registered preset). Generalizing to
 * a preset picker is deferred until a second preset exists (Issue #48).
 * A persisted config's `config` blob is always already normalized by
 * `parseHeroShowcaseConfig` (Issue #37 — the service only ever persists
 * the preset-validated, defaulted config), so reading its fields directly
 * for prefill is safe; an unregistered/foreign preset's config falls back
 * to `HERO_SHOWCASE_DEFAULTS` instead of showing garbage.
 */
export function SceneConfigEditForm({
  sectionId,
  experience3d,
  onSaved,
  onCancel,
}: SceneConfigEditFormProps) {
  const [state, formAction] = useActionState(
    upsertExperience3DSceneConfigAction,
    initialUpsertExperience3DSceneConfigActionState,
  );
  const hasAttemptedSubmit = useRef(false);

  useEffect(() => {
    if (hasAttemptedSubmit.current && state.status === "idle") {
      hasAttemptedSubmit.current = false;
      onSaved();
    }
  }, [state, onSaved]);

  const errors = state.status === "error" ? state.errors : {};

  const isHeroShowcase =
    !experience3d || experience3d.presetKey === HERO_SHOWCASE_PRESET_KEY;
  const config = isHeroShowcase ? experience3d?.config : undefined;

  const shape =
    (config?.shape as HeroShowcaseShape | undefined) ??
    HERO_SHOWCASE_DEFAULTS.shape;
  const primaryColor =
    (config?.primaryColor as string | undefined) ??
    HERO_SHOWCASE_DEFAULTS.primaryColor;
  const accentColor =
    (config?.accentColor as string | undefined) ??
    HERO_SHOWCASE_DEFAULTS.accentColor;
  const motionIntensity =
    (config?.motionIntensity as number | undefined) ??
    HERO_SHOWCASE_DEFAULTS.motionIntensity;
  const particleCount =
    (config?.particleCount as number | undefined) ??
    HERO_SHOWCASE_DEFAULTS.particleCount;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-white/10 p-4"
      noValidate
    >
      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar a experiência 3D"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar a experiência 3D"
          description={state.reason}
        />
      ) : null}

      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="presetKey" value={HERO_SHOWCASE_PRESET_KEY} />

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="shape">
          Forma
        </label>
        <select
          id="shape"
          name="shape"
          defaultValue={shape}
          className={inputClassName}
        >
          {HERO_SHOWCASE_SHAPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label className={labelClassName} htmlFor="primaryColor">
            Cor primária
          </label>
          <input
            id="primaryColor"
            name="primaryColor"
            type="color"
            defaultValue={primaryColor}
            className={`${inputClassName} h-10 p-1`}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className={labelClassName} htmlFor="accentColor">
            Cor de destaque
          </label>
          <input
            id="accentColor"
            name="accentColor"
            type="color"
            defaultValue={accentColor}
            className={`${inputClassName} h-10 p-1`}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label className={labelClassName} htmlFor="motionIntensity">
            Intensidade do movimento (0 a 1)
          </label>
          <input
            id="motionIntensity"
            name="motionIntensity"
            type="number"
            min={0}
            max={1}
            step={0.1}
            defaultValue={motionIntensity}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className={labelClassName} htmlFor="particleCount">
            Quantidade de partículas (0 a {HERO_SHOWCASE_MAX_PARTICLES})
          </label>
          <input
            id="particleCount"
            name="particleCount"
            type="number"
            min={0}
            max={HERO_SHOWCASE_MAX_PARTICLES}
            step={1}
            defaultValue={particleCount}
            className={inputClassName}
          />
        </div>
      </div>

      {errors.config ? <p className={errorClassName}>{errors.config}</p> : null}

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="fallback2dImageUrl">
          Imagem de fallback (2D)
        </label>
        <input
          id="fallback2dImageUrl"
          name="fallback2dImageUrl"
          type="text"
          defaultValue={experience3d?.fallback2d.imageUrl ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="fallback2dImageAlt">
          Texto alternativo da imagem de fallback
        </label>
        <input
          id="fallback2dImageAlt"
          name="fallback2dImageAlt"
          type="text"
          defaultValue={experience3d?.fallback2d.imageAlt ?? ""}
          className={inputClassName}
        />
      </div>

      {errors.fallback2d ? (
        <p className={errorClassName}>{errors.fallback2d}</p>
      ) : null}

      <div className="flex gap-2">
        <SubmitButton hasAttemptedSubmit={hasAttemptedSubmit} />
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:border-white/30"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
