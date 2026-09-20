import type { ExperienceRuntimeMode } from "@/lib/capability";

export type PresetConfigParseResult<TConfig> =
  | { success: true; config: TConfig }
  | { success: false; error: string };

/**
 * Renderer-free description of a preset: its key and how to validate and
 * normalize its `config`. Kept apart from the R3F scene so the registry —
 * and anything that validates configs, including server code — never pulls
 * Three.js/R3F/Drei into its module graph.
 */
export interface Experience3DPresetDefinition<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> {
  key: string;
  label: string;
  /** Applies defaults and rejects anything outside the preset's contract. */
  parseConfig(config: unknown): PresetConfigParseResult<TConfig>;
}

/** The only modes in which a preset scene is mounted at all. */
export type Experience3DSceneMode = Exclude<
  ExperienceRuntimeMode,
  "FALLBACK_2D"
>;

/** Props every preset scene component receives from `Experience3DView`. */
export interface Experience3DSceneProps<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Already validated and normalized by the preset's `parseConfig`. */
  config: TConfig;
  mode: Experience3DSceneMode;
  /** The WebGL context exists — the 2D fallback can step back visually. */
  onReady: () => void;
  /** The context was lost or rendering failed — fall back to 2D. */
  onRuntimeFailure: () => void;
}
