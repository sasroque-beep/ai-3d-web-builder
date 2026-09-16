// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/copy/actions", () => ({
  upsertSectionCopyAction: vi.fn(),
}));

import { SitePreviewViewer } from "@/app/leads/[id]/site-builder/SitePreviewViewer";
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
          },
        ],
      },
    ],
    ...overrides,
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
