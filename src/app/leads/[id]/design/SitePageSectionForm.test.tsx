// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/design/actions", () => ({
  upsertSitePageSectionAction: vi.fn(),
}));

import { SitePageSectionForm } from "@/app/leads/[id]/design/SitePageSectionForm";
import { upsertSitePageSectionAction } from "@/modules/design/actions";
import type { UpsertSitePageSectionActionState } from "@/modules/design/types";

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

describe("SitePageSectionForm", () => {
  it("renders the fields and the page options", () => {
    render(<SitePageSectionForm pages={pages} />);

    expect(screen.getByLabelText("Página *")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Página inicial" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Identificador da seção *"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar seção" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertSitePageSectionAction).mockResolvedValue({
      status: "error",
      errors: { sectionKey: "Informe um identificador para a seção." },
    });

    const user = userEvent.setup();
    render(<SitePageSectionForm pages={pages} />);
    await user.click(screen.getByRole("button", { name: "Salvar seção" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar a seção",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertSitePageSectionAction).mockResolvedValue({
      status: "ineligible",
      reason: "Página não encontrada.",
    });

    const user = userEvent.setup();
    render(<SitePageSectionForm pages={pages} />);
    await user.click(screen.getByRole("button", { name: "Salvar seção" }));

    expect(
      await screen.findByText("Página não encontrada."),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertSitePageSectionActionState) => void = () =>
      undefined;
    vi.mocked(upsertSitePageSectionAction).mockImplementation(
      () =>
        new Promise<UpsertSitePageSectionActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<SitePageSectionForm pages={pages} />);
    await user.click(screen.getByRole("button", { name: "Salvar seção" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
