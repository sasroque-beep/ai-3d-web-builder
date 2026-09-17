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
