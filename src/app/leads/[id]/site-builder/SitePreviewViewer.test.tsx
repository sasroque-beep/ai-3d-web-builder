// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/copy/actions", () => ({
  upsertSectionCopyAction: vi.fn(),
}));

vi.mock("@/modules/experience-3d/actions", () => ({
  upsertExperience3DSceneConfigAction: vi.fn(),
}));

// Renders the real 3D runtime (R3F/Three.js) — irrelevant here, this suite
// only asserts *whether* the preview mounts it for a section, never how it
// renders. A minimal stand-in keeps this test independent of WebGL/jsdom
// limitations (same reasoning as the mocks in `Experience3DView.test.tsx`).
vi.mock("@/modules/experience-3d/Experience3DView", () => ({
  Experience3DView: ({
    sceneConfig,
  }: {
    sceneConfig: { presetKey: string };
  }) => (
    <div
      data-testid="experience-3d-view"
      data-preset-key={sceneConfig.presetKey}
    />
  ),
}));

import { SitePreviewViewer } from "@/app/leads/[id]/site-builder/SitePreviewViewer";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";
import type { SitePreview } from "@/modules/site-builder/types";

function basePreview(overrides: Partial<SitePreview> = {}): SitePreview {
  return {
    companyId: "company-1",
    companyName: "Padaria do Bairro",
    theme: null,
    pages: [
      {
        id: "page-1",
        slug: "pagina-inicial",
        name: "Página inicial",
        objective: "Apresentar a padaria e gerar pedidos.",
        journeyStage: "discovery",
        position: 1,
        sections: [
          {
            id: "section-1",
            sectionKey: "hero",
            position: 1,
            heading: "Pão fresco todos os dias",
            subheading: "Direto do forno para a sua mesa.",
            body: "Produzimos nosso pão artesanal diariamente.",
            ctaLabel: "Peça agora",
            socialProofText: null,
            hasContent: true,
            copy: {
              headline: "Pão fresco todos os dias",
              subheadline: "Direto do forno para a sua mesa.",
              body: "Produzimos nosso pão artesanal diariamente.",
              ctaLabel: "Peça agora",
              socialProofText: null,
              notes: null,
            },
            experience3d: null,
          },
        ],
      },
      {
        id: "page-2",
        slug: "contato",
        name: "Contato",
        objective: null,
        journeyStage: "conversion",
        position: 2,
        sections: [
          {
            id: "section-2",
            sectionKey: "formulario",
            position: 1,
            heading: "Formulário",
            subheading: null,
            body: null,
            ctaLabel: null,
            socialProofText: null,
            hasContent: false,
            copy: null,
            experience3d: null,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function experience3d(
  overrides: Partial<Experience3DSceneConfig> = {},
): Experience3DSceneConfig {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: { shape: "icosahedron" },
    fallback2d: {
      imageUrl: "/fallback.svg",
      imageAlt: "Forma geométrica abstrata",
    },
    generatedBy: "manual",
    ...overrides,
  };
}

/** Replaces the first section's 3D experience in an otherwise-default preview. */
function previewWithSectionExperience(
  config: Experience3DSceneConfig | null,
): SitePreview {
  const preview = basePreview();
  const [firstPage, ...restPages] = preview.pages;
  if (!firstPage) throw new Error("expected a first page");
  const [firstSection, ...restSections] = firstPage.sections;
  if (!firstSection) throw new Error("expected a first section");

  return {
    ...preview,
    pages: [
      {
        ...firstPage,
        sections: [{ ...firstSection, experience3d: config }, ...restSections],
      },
      ...restPages,
    ],
  };
}

describe("SitePreviewViewer", () => {
  it("renders the first page's sections by default", () => {
    render(<SitePreviewViewer preview={basePreview()} />);

    expect(
      screen.getByRole("heading", { name: "Pão fresco todos os dias" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Peça agora")).toBeInTheDocument();
  });

  it("switches pages when a different tab is clicked", async () => {
    const user = userEvent.setup();
    render(<SitePreviewViewer preview={basePreview()} />);

    await user.click(screen.getByRole("tab", { name: "Contato" }));

    expect(
      screen.getByRole("heading", { name: "Formulário" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Conteúdo ainda não definido para esta seção."),
    ).toBeInTheDocument();
  });

  it("shows an empty state for a page with no sections yet", async () => {
    const user = userEvent.setup();
    render(
      <SitePreviewViewer
        preview={basePreview({
          pages: [
            ...basePreview().pages,
            {
              id: "page-3",
              slug: "sobre",
              name: "Sobre",
              objective: null,
              journeyStage: null,
              position: 3,
              sections: [],
            },
          ],
        })}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Sobre" }));

    expect(
      screen.getByText("Nenhuma seção cadastrada ainda para esta página."),
    ).toBeInTheDocument();
  });

  it("applies the company theme as CSS custom properties on the container", () => {
    const { container } = render(
      <SitePreviewViewer
        preview={basePreview({
          theme: {
            primaryColor: "#8B5E3C",
            secondaryColor: null,
            accentColor: "#D97706",
            backgroundColor: null,
            headingFont: "Fraunces",
            bodyFont: null,
            colorModePreference: "light",
            spacingDensity: "spacious",
          },
        })}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--preview-primary")).toBe("#8B5E3C");
    expect(wrapper.style.getPropertyValue("--preview-accent")).toBe("#D97706");
    expect(wrapper.style.getPropertyValue("--preview-secondary")).toBe("");
  });

  it("switches a section into edit mode and back", async () => {
    const user = userEvent.setup();
    render(<SitePreviewViewer preview={basePreview()} />);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText("Título/headline")).toHaveValue(
      "Pão fresco todos os dias",
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(
      screen.getByRole("heading", { name: "Pão fresco todos os dias" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Título/headline")).not.toBeInTheDocument();
  });

  it("does not mount a 3D experience for a section that has none configured", () => {
    render(<SitePreviewViewer preview={basePreview()} />);

    expect(screen.queryByTestId("experience-3d-view")).not.toBeInTheDocument();
  });

  it("mounts the section's 3D experience when one is configured", () => {
    render(
      <SitePreviewViewer
        preview={previewWithSectionExperience(experience3d())}
      />,
    );

    const scene = screen.getByTestId("experience-3d-view");
    expect(scene).toBeInTheDocument();
    expect(scene).toHaveAttribute("data-preset-key", "hero-showcase");
  });

  it("labels the 3D button 'Configurar 3D' for a section without a 3D experience", () => {
    render(<SitePreviewViewer preview={basePreview()} />);
    expect(
      screen.getByRole("button", { name: "Configurar 3D" }),
    ).toBeInTheDocument();
  });

  it("labels the 3D button 'Editar 3D' for a section that already has one", () => {
    render(
      <SitePreviewViewer
        preview={previewWithSectionExperience(experience3d())}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Editar 3D" }),
    ).toBeInTheDocument();
  });

  it("switches a section into 3D edit mode and back", async () => {
    const user = userEvent.setup();
    render(
      <SitePreviewViewer
        preview={previewWithSectionExperience(experience3d())}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar 3D" }));
    expect(screen.getByLabelText("Forma")).toHaveValue("icosahedron");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(
      screen.getByRole("heading", { name: "Pão fresco todos os dias" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Forma")).not.toBeInTheDocument();
  });

  it("shows only one edit form at a time for a section (content and 3D are mutually exclusive)", async () => {
    const user = userEvent.setup();
    render(
      <SitePreviewViewer
        preview={previewWithSectionExperience(experience3d())}
      />,
    );

    // Editing content replaces the whole section view, including the "Editar
    // 3D" button — there's no way to have both forms, or a form and the
    // other button, on screen at once for the same section.
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Título/headline")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar 3D" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Forma")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Editar 3D" }));
    expect(screen.getByLabelText("Forma")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Título/headline")).not.toBeInTheDocument();
  });

  it("exits edit mode when switching to a different page", async () => {
    const user = userEvent.setup();
    render(<SitePreviewViewer preview={basePreview()} />);

    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Título/headline")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Contato" }));
    await user.click(screen.getByRole("tab", { name: "Página inicial" }));

    expect(screen.queryByLabelText("Título/headline")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pão fresco todos os dias" }),
    ).toBeInTheDocument();
  });
});
