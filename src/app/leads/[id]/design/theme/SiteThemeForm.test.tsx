// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/design/actions", () => ({
  upsertSiteThemeAction: vi.fn(),
}));

import { SiteThemeForm } from "@/app/leads/[id]/design/theme/SiteThemeForm";
import { upsertSiteThemeAction } from "@/modules/design/actions";
import type { UpsertSiteThemeActionState } from "@/modules/design/types";

describe("SiteThemeForm", () => {
  it("renders the fields for a new theme", () => {
    render(<SiteThemeForm companyId="company-1" theme={null} />);

    expect(screen.getByText("Criar tema")).toBeInTheDocument();
    expect(screen.getByLabelText("Cor primária")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Preferência de modo de cor"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar tema" }),
    ).toBeInTheDocument();
  });

  it("prefills the form with the existing theme", () => {
    render(
      <SiteThemeForm
        companyId="company-1"
        theme={{
          id: "theme-1",
          companyId: "company-1",
          primaryColor: "#8B5E3C",
          secondaryColor: null,
          accentColor: null,
          backgroundColor: null,
          headingFont: null,
          bodyFont: null,
          visualStyle: null,
          colorModePreference: "light",
          spacingDensity: null,
          ctaVisualGuidelines: null,
          visualReferences: null,
          accessibilityRequirements: null,
          notes: null,
          generatedBy: "manual",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Atualizar tema")).toBeInTheDocument();
    expect(screen.getByLabelText("Cor primária")).toHaveValue("#8B5E3C");
    expect(screen.getByLabelText("Preferência de modo de cor")).toHaveValue(
      "light",
    );
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertSiteThemeAction).mockResolvedValue({
      status: "error",
      errors: { colorModePreference: "Selecione um modo de cor válido." },
    });

    const user = userEvent.setup();
    render(<SiteThemeForm companyId="company-1" theme={null} />);
    await user.click(screen.getByRole("button", { name: "Salvar tema" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o tema",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertSiteThemeAction).mockResolvedValue({
      status: "ineligible",
      reason:
        "Defina a arquitetura de páginas da empresa antes de configurar o tema visual do site.",
    });

    const user = userEvent.setup();
    render(<SiteThemeForm companyId="company-1" theme={null} />);
    await user.click(screen.getByRole("button", { name: "Salvar tema" }));

    expect(
      await screen.findByText(
        "Defina a arquitetura de páginas da empresa antes de configurar o tema visual do site.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertSiteThemeActionState) => void = () =>
      undefined;
    vi.mocked(upsertSiteThemeAction).mockImplementation(
      () =>
        new Promise<UpsertSiteThemeActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<SiteThemeForm companyId="company-1" theme={null} />);
    await user.click(screen.getByRole("button", { name: "Salvar tema" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
