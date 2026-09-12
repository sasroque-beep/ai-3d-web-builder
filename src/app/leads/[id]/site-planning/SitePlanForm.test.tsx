// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/site-planning/actions", () => ({
  upsertSitePlanAction: vi.fn(),
}));

import { SitePlanForm } from "@/app/leads/[id]/site-planning/SitePlanForm";
import { upsertSitePlanAction } from "@/modules/site-planning/actions";
import type { UpsertSitePlanActionState } from "@/modules/site-planning/types";

describe("SitePlanForm", () => {
  it("renders the fields for a new site plan", () => {
    render(<SitePlanForm companyId="company-1" sitePlan={null} />);

    expect(screen.getByText("Criar planejamento")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Objetivo principal do site"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("CTA principal")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar planejamento" }),
    ).toBeInTheDocument();
  });

  it("prefills the form with the existing site plan", () => {
    render(
      <SitePlanForm
        companyId="company-1"
        sitePlan={{
          id: "site-plan-1",
          companyId: "company-1",
          mainGoal: "Gerar agendamentos qualificados.",
          conversionGoal: null,
          priorityAudience: null,
          siteValueProposition: null,
          featuredOffer: null,
          primaryCta: "Peça agora",
          secondaryCtas: null,
          communicationPriorities: null,
          objectionsToAddress: null,
          socialProofNeeded: null,
          trustElements: null,
          requiredFeatures: null,
          requiredIntegrations: null,
          leadCaptureRequirements: null,
          contactRequirements: null,
          conversionRequirements: null,
          contentRequirements: null,
          visualRequirements: null,
          experience3dOpportunities: null,
          journeyStagesToSupport: null,
          strategicNotes: null,
          generatedBy: "manual",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Atualizar planejamento")).toBeInTheDocument();
    expect(screen.getByLabelText("Objetivo principal do site")).toHaveValue(
      "Gerar agendamentos qualificados.",
    );
    expect(screen.getByLabelText("CTA principal")).toHaveValue("Peça agora");
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertSitePlanAction).mockResolvedValue({
      status: "error",
      errors: {
        companyId: "Empresa não informada.",
      },
      values: {
        companyId: "",
        mainGoal: "",
        conversionGoal: "",
        priorityAudience: "",
        siteValueProposition: "",
        featuredOffer: "",
        primaryCta: "",
        secondaryCtas: "",
        communicationPriorities: "",
        objectionsToAddress: "",
        socialProofNeeded: "",
        trustElements: "",
        requiredFeatures: "",
        requiredIntegrations: "",
        leadCaptureRequirements: "",
        contactRequirements: "",
        conversionRequirements: "",
        contentRequirements: "",
        visualRequirements: "",
        experience3dOpportunities: "",
        journeyStagesToSupport: "",
        strategicNotes: "",
      },
    });

    const user = userEvent.setup();
    render(<SitePlanForm companyId="company-1" sitePlan={null} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar planejamento" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o planejamento",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertSitePlanAction).mockResolvedValue({
      status: "ineligible",
      reason:
        "Crie a estratégia de marketing e conversão da empresa antes de gerar o planejamento estratégico do site.",
    });

    const user = userEvent.setup();
    render(<SitePlanForm companyId="company-1" sitePlan={null} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar planejamento" }),
    );

    expect(
      await screen.findByText(
        "Crie a estratégia de marketing e conversão da empresa antes de gerar o planejamento estratégico do site.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertSitePlanActionState) => void = () =>
      undefined;
    vi.mocked(upsertSitePlanAction).mockImplementation(
      () =>
        new Promise<UpsertSitePlanActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<SitePlanForm companyId="company-1" sitePlan={null} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar planejamento" }),
    );

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
