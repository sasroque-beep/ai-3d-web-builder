import { heroShowcasePreset } from "@/modules/experience-3d/presets/hero-showcase/config";
import type { Experience3DPresetDefinition } from "@/modules/experience-3d/presets/types";

export type PresetConfigOutcome =
  | { kind: "unregistered" }
  | { kind: "valid"; config: Record<string, unknown> }
  | { kind: "invalid"; error: string };

/**
 * Not an enum: `presetKey` stays a free slug in the persisted contract
 * (Issue #30). The registry only answers "is there a definition for this
 * key, and is this config valid for it?" — an unregistered key is reported,
 * not rejected, so persisted data written before a preset existed (or for
 * one that is later removed) never becomes unreadable.
 */
export function createPresetRegistry(
  definitions: readonly Experience3DPresetDefinition[],
) {
  const byKey = new Map<string, Experience3DPresetDefinition>();

  for (const definition of definitions) {
    if (byKey.has(definition.key)) {
      throw new Error(`Preset 3D duplicado no registry: "${definition.key}".`);
    }
    byKey.set(definition.key, definition);
  }

  return {
    has(presetKey: string): boolean {
      return byKey.has(presetKey);
    },

    keys(): string[] {
      return [...byKey.keys()];
    },

    parseConfig(presetKey: string, config: unknown): PresetConfigOutcome {
      const definition = byKey.get(presetKey);
      if (!definition) return { kind: "unregistered" };

      const result = definition.parseConfig(config);
      return result.success
        ? { kind: "valid", config: result.config }
        : { kind: "invalid", error: result.error };
    },
  };
}

export type PresetRegistry = ReturnType<typeof createPresetRegistry>;

/** Adding a preset = one definition here + one renderer in `renderers.ts`. */
export const presetRegistry = createPresetRegistry([heroShowcasePreset]);
