// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/copy/actions", () => ({
  upsertSectionCopyAction: vi.fn(),
}));

import { SectionCopyForm } from "@/app/leads/[id]/copy/SectionCopyForm";
import { upsertSectionCopyAction } from "@/modules/copy/actions";
import type { UpsertSectionCopyActionState } from "@/modules/copy/types";

const pages = [
  {
    id: "page-1",
    companyId: "company-1",
    slug: "pagina-inicial",
    name: "Página inicial",
    objective: null,
    journeyStage: null,
    position: 1,
    generatedBy: "manual" as const,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const sectionsByPage = new Map([
  [
    "page-1",
    [
      {
        id: "section-1",
        pageId: "page-1",
        sectionKey: "hero",
        name: "Hero",
        objective: null,
        ctaReference: null,
        position: 1,
        generatedBy: "manual" as const,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  ],
]);

describe("SectionCopyForm", () => {
  it("renders the fields and the section options", () => {
    render(<SectionCopyForm pages={pages} sectionsByPage={sectionsByPage} />);

    expect(screen.getByLabelText("Seção *")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Página inicial — Hero" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título/headline")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar conteúdo" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertSectionCopyAction).mockResolvedValue({
      status: "error",
      errors: { sectionId: "Seção não informada." },
    });

    const user = userEvent.setup();
    render(<SectionCopyForm pages={pages} sectionsByPage={sectionsByPage} />);
    await user.click(screen.getByRole("button", { name: "Salvar conteúdo" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o conteúdo",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertSectionCopyAction).mockResolvedValue({
      status: "ineligible",
      reason: "Seção não encontrada.",
    });

    const user = userEvent.setup();
    render(<SectionCopyForm pages={pages} sectionsByPage={sectionsByPage} />);
    await user.click(screen.getByRole("button", { name: "Salvar conteúdo" }));

    expect(
      await screen.findByText("Seção não encontrada."),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertSectionCopyActionState) => void = () =>
      undefined;
    vi.mocked(upsertSectionCopyAction).mockImplementation(
      () =>
        new Promise<UpsertSectionCopyActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<SectionCopyForm pages={pages} sectionsByPage={sectionsByPage} />);
    await user.click(screen.getByRole("button", { name: "Salvar conteúdo" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
