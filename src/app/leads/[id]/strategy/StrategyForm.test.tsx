// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/strategy/actions", () => ({
  upsertStrategyAction: vi.fn(),
}));

import { StrategyForm } from "@/app/leads/[id]/strategy/StrategyForm";
import { upsertStrategyAction } from "@/modules/strategy/actions";
import type { UpsertStrategyActionState } from "@/modules/strategy/types";

describe("StrategyForm", () => {
  it("renders the fields for a new strategy", () => {
    render(<StrategyForm companyId="company-1" strategy={null} />);

    expect(screen.getByText("Criar estratégia")).toBeInTheDocument();
    expect(screen.getByLabelText("Objetivo de marketing")).toBeInTheDocument();
    expect(screen.getByLabelText("Descoberta")).toBeInTheDocument();
    expect(screen.getByLabelText("Pós-conversão")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar estratégia" }),
    ).toBeInTheDocument();
  });

  it("prefills the form with the existing strategy", () => {
    render(
      <StrategyForm
        companyId="company-1"
        strategy={{
          id: "strategy-1",
          companyId: "company-1",
          marketingObjective: "Aumentar reconhecimento de marca.",
          conversionObjective: null,
          targetAudience: null,
          painPoints: null,
          desires: null,
          valueProposition: null,
          differentiators: null,
          objections: null,
          salesArguments: null,
          communicationTone: null,
          mainOffer: null,
          desiredConversionActions: null,
          ctas: null,
          journeyDiscovery: "Anúncio local no Instagram",
          journeyConsideration: null,
          journeyDecision: null,
          journeyConversion: null,
          journeyPostConversion: null,
          generatedBy: "manual",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Atualizar estratégia")).toBeInTheDocument();
    expect(screen.getByLabelText("Objetivo de marketing")).toHaveValue(
      "Aumentar reconhecimento de marca.",
    );
    expect(screen.getByLabelText("Descoberta")).toHaveValue(
      "Anúncio local no Instagram",
    );
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertStrategyAction).mockResolvedValue({
      status: "error",
      errors: {
        companyId: "Empresa não informada.",
      },
      values: {
        companyId: "",
        marketingObjective: "",
        conversionObjective: "",
        targetAudience: "",
        painPoints: "",
        desires: "",
        valueProposition: "",
        differentiators: "",
        objections: "",
        salesArguments: "",
        communicationTone: "",
        mainOffer: "",
        desiredConversionActions: "",
        ctas: "",
        journeyDiscovery: "",
        journeyConsideration: "",
        journeyDecision: "",
        journeyConversion: "",
        journeyPostConversion: "",
      },
    });

    const user = userEvent.setup();
    render(<StrategyForm companyId="company-1" strategy={null} />);
    await user.click(screen.getByRole("button", { name: "Salvar estratégia" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar a estratégia",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertStrategyAction).mockResolvedValue({
      status: "ineligible",
      reason:
        "Gere o diagnóstico estratégico da empresa antes de criar a estratégia de marketing e conversão.",
    });

    const user = userEvent.setup();
    render(<StrategyForm companyId="company-1" strategy={null} />);
    await user.click(screen.getByRole("button", { name: "Salvar estratégia" }));

    expect(
      await screen.findByText(
        "Gere o diagnóstico estratégico da empresa antes de criar a estratégia de marketing e conversão.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertStrategyActionState) => void = () =>
      undefined;
    vi.mocked(upsertStrategyAction).mockImplementation(
      () =>
        new Promise<UpsertStrategyActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<StrategyForm companyId="company-1" strategy={null} />);
    await user.click(screen.getByRole("button", { name: "Salvar estratégia" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
