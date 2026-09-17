// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/design/actions", () => ({
  upsertSitePageAction: vi.fn(),
}));

import { SitePageForm } from "@/app/leads/[id]/design/SitePageForm";
import { upsertSitePageAction } from "@/modules/design/actions";
import type { UpsertSitePageActionState } from "@/modules/design/types";

describe("SitePageForm", () => {
  it("renders the fields for a new page", () => {
    render(<SitePageForm companyId="company-1" />);

    expect(
      screen.getByLabelText("Identificador da página *"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da página *")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Etapa da jornada do cliente"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar página" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertSitePageAction).mockResolvedValue({
      status: "error",
      errors: { slug: "Informe um identificador para a página." },
    });

    const user = userEvent.setup();
    render(<SitePageForm companyId="company-1" />);
    await user.click(screen.getByRole("button", { name: "Salvar página" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar a página",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertSitePageAction).mockResolvedValue({
      status: "ineligible",
      reason:
        "Crie o planejamento estratégico do site da empresa antes de definir a arquitetura de páginas.",
    });

    const user = userEvent.setup();
    render(<SitePageForm companyId="company-1" />);
    await user.click(screen.getByRole("button", { name: "Salvar página" }));

    expect(
      await screen.findByText(
        "Crie o planejamento estratégico do site da empresa antes de definir a arquitetura de páginas.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertSitePageActionState) => void = () =>
      undefined;
    vi.mocked(upsertSitePageAction).mockImplementation(
      () =>
        new Promise<UpsertSitePageActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<SitePageForm companyId="company-1" />);
    await user.click(screen.getByRole("button", { name: "Salvar página" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
