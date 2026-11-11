export interface Experience3DFallback2D {
  imageUrl: string;
  imageAlt: string;
}

/**
 * presetKey/config/fallback2d already arrive structured — unlike the
 * FormInput shape used by simpler modules, `config` is inherently a JSON
 * object, never text a user types into a single field.
 */
export interface Experience3DSceneConfigInput {
  sectionId: string;
  presetKey: string;
  config: unknown;
  fallback2d: {
    imageUrl: string;
    imageAlt: string;
  };
  generatedBy?: "manual" | "ai";
}

export type Experience3DSceneConfigFieldErrors = Partial<
  Record<"sectionId" | "presetKey" | "config" | "fallback2d", string>
>;

export interface Experience3DSceneConfig {
  sectionId: string;
  presetKey: string;
  config: Record<string, unknown>;
  fallback2d: Experience3DFallback2D;
  generatedBy: "manual" | "ai";
}

export type Experience3DEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };

/**
 * Raw string values as they arrive from an HTML form submission (Issue
 * #48). Shaped around the `hero-showcase` preset's fields specifically —
 * the only registered preset today (Issue #37) — rather than a generic
 * "config blob" field, so the form can offer real inputs (a shape picker,
 * color pickers, sliders) instead of a raw JSON textarea. Generalizing
 * this once a second preset exists is deliberately deferred (mirrors how
 * `presetKey` itself stays a free slug instead of a closed enum).
 */
export interface Experience3DSceneConfigFormInput {
  sectionId: string;
  presetKey: string;
  shape: string;
  primaryColor: string;
  accentColor: string;
  motionIntensity: string;
  particleCount: string;
  fallback2dImageUrl: string;
  fallback2dImageAlt: string;
}

export type UpsertExperience3DSceneConfigActionState =
  | { status: "idle" }
  | { status: "error"; errors: Experience3DSceneConfigFieldErrors }
  | { status: "ineligible"; reason: string };

export const initialUpsertExperience3DSceneConfigActionState: UpsertExperience3DSceneConfigActionState =
  {
    status: "idle",
  };
