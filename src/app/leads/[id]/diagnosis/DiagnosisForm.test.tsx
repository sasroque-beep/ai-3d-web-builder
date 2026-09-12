// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/research/diagnosis/actions", () => ({
  upsertDiagnosisAction: vi.fn(),
}));

import { DiagnosisForm } from "@/app/leads/[id]/diagnosis/DiagnosisForm";
import { upsertDiagnosisAction } from "@/modules/research/diagnosis/actions";
import type { UpsertDiagnosisActionState } from "@/modules/research/diagnosis/types";

describe("DiagnosisForm", () => {
  it("renders the fields for a new diagnosis", () => {
    render(<DiagnosisForm companyId="company-1" diagnosis={null} />);

    expect(screen.getByText("Criar diagnóstico")).toBeInTheDocument();
    expect(screen.getByLabelText("Resumo do negócio")).toBeInTheDocument();
    expect(screen.getByLabelText("Maturidade digital")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar diagnóstico" }),
    ).toBeInTheDocument();
  });

  it("prefills the form with the existing diagnosis", () => {
    render(
      <DiagnosisForm
        companyId="company-1"
        diagnosis={{
          id: "diagnosis-1",
          companyId: "company-1",
          summary: "Padaria de bairro com forte presença local.",
          niche: null,
          valueProposition: null,
          differentiators: null,
          strengths: null,
          weaknesses: null,
          opportunities: null,
          risksOrGaps: null,
          marketingOpportunities: null,
          conversionOpportunities: null,
          digitalMaturity: "basic",
          recommendations: null,
          generatedBy: "manual",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Atualizar diagnóstico")).toBeInTheDocument();
    expect(screen.getByLabelText("Resumo do negócio")).toHaveValue(
      "Padaria de bairro com forte presença local.",
    );
    expect(screen.getByLabelText("Maturidade digital")).toHaveValue("basic");
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertDiagnosisAction).mockResolvedValue({
      status: "error",
      errors: {
        digitalMaturity: "Selecione um nível de maturidade digital válido.",
      },
      values: {
        companyId: "company-1",
        summary: "",
        niche: "",
        valueProposition: "",
        differentiators: "",
        strengths: "",
        weaknesses: "",
        opportunities: "",
        risksOrGaps: "",
        marketingOpportunities: "",
        conversionOpportunities: "",
        digitalMaturity: "invalid",
        recommendations: "",
      },
    });

    const user = userEvent.setup();
    render(<DiagnosisForm companyId="company-1" diagnosis={null} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar diagnóstico" }),
    );

    expect(
      await screen.findByText(
        "Selecione um nível de maturidade digital válido.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o diagnóstico",
    );
  });

  it("shows the ineligibility reason returned by the action", async () => {
    vi.mocked(upsertDiagnosisAction).mockResolvedValue({
      status: "ineligible",
      reason:
        "Confirme ao menos uma informação de enriquecimento antes de gerar o diagnóstico.",
    });

    const user = userEvent.setup();
    render(<DiagnosisForm companyId="company-1" diagnosis={null} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar diagnóstico" }),
    );

    expect(
      await screen.findByText(
        "Confirme ao menos uma informação de enriquecimento antes de gerar o diagnóstico.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertDiagnosisActionState) => void = () =>
      undefined;
    vi.mocked(upsertDiagnosisAction).mockImplementation(
      () =>
        new Promise<UpsertDiagnosisActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<DiagnosisForm companyId="company-1" diagnosis={null} />);
    await user.click(
      screen.getByRole("button", { name: "Salvar diagnóstico" }),
    );

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
