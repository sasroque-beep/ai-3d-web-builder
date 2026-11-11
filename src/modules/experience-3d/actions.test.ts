import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/modules/design/service", () => ({
  designService: {
    getSectionById: vi.fn(),
    getPageById: vi.fn(),
  },
}));
vi.mock("@/modules/experience-3d/service", () => ({
  experience3DService: { upsertSceneConfig: vi.fn() },
}));

import { designService } from "@/modules/design/service";
import { upsertExperience3DSceneConfigAction } from "@/modules/experience-3d/actions";
import { experience3DService } from "@/modules/experience-3d/service";
import { initialUpsertExperience3DSceneConfigActionState } from "@/modules/experience-3d/types";

function formData(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  const fields: Record<string, string> = {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    shape: "torus-knot",
    primaryColor: "#123456",
    accentColor: "#abcdef",
    motionIntensity: "0.7",
    particleCount: "80",
    fallback2dImageUrl: "/fallback.svg",
    fallback2dImageAlt: "Forma abstrata",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("upsertExperience3DSceneConfigAction", () => {
  beforeEach(() => {
    vi.mocked(designService.getSectionById).mockResolvedValue(undefined);
    vi.mocked(experience3DService.upsertSceneConfig).mockReset();
  });

  it("coerces numeric fields to numbers", async () => {
    vi.mocked(experience3DService.upsertSceneConfig).mockResolvedValue({
      success: false,
      ineligible: true,
      reason: "x",
    });

    await upsertExperience3DSceneConfigAction(
      initialUpsertExperience3DSceneConfigActionState,
      formData(),
    );

    const input = vi.mocked(experience3DService.upsertSceneConfig).mock
      .calls[0]?.[0];
    expect(input?.config).toMatchObject({
      motionIntensity: 0.7,
      particleCount: 80,
    });
  });

  it("leaves empty numeric fields out so the preset default applies, instead of persisting 0", async () => {
    vi.mocked(experience3DService.upsertSceneConfig).mockResolvedValue({
      success: false,
      ineligible: true,
      reason: "x",
    });

    await upsertExperience3DSceneConfigAction(
      initialUpsertExperience3DSceneConfigActionState,
      formData({ motionIntensity: "", particleCount: "  " }),
    );

    const input = vi.mocked(experience3DService.upsertSceneConfig).mock
      .calls[0]?.[0];
    expect(input?.config).not.toHaveProperty("motionIntensity");
    expect(input?.config).not.toHaveProperty("particleCount");
  });

  it("echoes the submitted values back on a validation error", async () => {
    vi.mocked(experience3DService.upsertSceneConfig).mockResolvedValue({
      success: false,
      errors: { fallback2d: "obrigatório" },
    });

    const state = await upsertExperience3DSceneConfigAction(
      initialUpsertExperience3DSceneConfigActionState,
      formData({ fallback2dImageAlt: "" }),
    );

    expect(state).toEqual({
      status: "error",
      errors: { fallback2d: "obrigatório" },
      values: expect.objectContaining({
        shape: "torus-knot",
        particleCount: "80",
        fallback2dImageAlt: "",
      }),
    });
  });
});
