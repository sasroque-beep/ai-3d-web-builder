// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/experience-3d/actions", () => ({
  upsertExperience3DSceneConfigAction: vi.fn(),
}));

import { SceneConfigEditForm } from "@/app/leads/[id]/site-builder/SceneConfigEditForm";
import { upsertExperience3DSceneConfigAction } from "@/modules/experience-3d/actions";
import type {
  Experience3DSceneConfig,
  UpsertExperience3DSceneConfigActionState,
} from "@/modules/experience-3d/types";

function experience3d(
  overrides: Partial<Experience3DSceneConfig> = {},
): Experience3DSceneConfig {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: {
      shape: "torus-knot",
      primaryColor: "#123456",
      accentColor: "#abcdef",
      motionIntensity: 0.7,
      particleCount: 80,
    },
    fallback2d: {
      imageUrl: "/fallback.svg",
      imageAlt: "Forma geométrica abstrata",
    },
    generatedBy: "manual",
    ...overrides,
  };
}

describe("SceneConfigEditForm", () => {
  it("prefills the fields from the section's existing 3D experience", () => {
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={experience3d()}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Forma")).toHaveValue("torus-knot");
    expect(screen.getByLabelText("Cor primária")).toHaveValue("#123456");
    expect(screen.getByLabelText("Cor de destaque")).toHaveValue("#abcdef");
    expect(
      screen.getByLabelText("Intensidade do movimento (0 a 1)"),
    ).toHaveValue(0.7);
    expect(screen.getByLabelText(/Quantidade de partículas/)).toHaveValue(80);
    expect(screen.getByLabelText("Imagem de fallback (2D)")).toHaveValue(
      "/fallback.svg",
    );
  });

  it("renders the hero-showcase defaults when the section has no 3D experience yet", () => {
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Forma")).toHaveValue("icosahedron");
    expect(screen.getByLabelText("Imagem de fallback (2D)")).toHaveValue("");
  });

  it("calls onCancel when the cancel button is clicked, without submitting", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={null}
        onSaved={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(upsertExperience3DSceneConfigAction).not.toHaveBeenCalled();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertExperience3DSceneConfigAction).mockResolvedValue({
      status: "error",
      errors: { config: "Configuração do Hero Showcase inválida." },
    });

    const user = userEvent.setup();
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar a experiência 3D",
    );
    expect(
      await screen.findByText("Configuração do Hero Showcase inválida."),
    ).toBeInTheDocument();
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertExperience3DSceneConfigAction).mockResolvedValue({
      status: "ineligible",
      reason: "Seção não encontrada.",
    });

    const user = userEvent.setup();
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Seção não encontrada."),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (
      value: UpsertExperience3DSceneConfigActionState,
    ) => void = () => undefined;
    vi.mocked(upsertExperience3DSceneConfigAction).mockImplementation(
      () =>
        new Promise<UpsertExperience3DSceneConfigActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });

  it("calls onSaved after a successful save", async () => {
    vi.mocked(upsertExperience3DSceneConfigAction).mockResolvedValue({
      status: "idle",
    });
    const onSaved = vi.fn();

    const user = userEvent.setup();
    render(
      <SceneConfigEditForm
        sectionId="section-1"
        experience3d={null}
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });
});
