// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/research/actions", () => ({
  upsertEnrichmentFieldAction: vi.fn(),
}));

import { EnrichmentFieldForm } from "@/app/leads/[id]/research/EnrichmentFieldForm";
import { upsertEnrichmentFieldAction } from "@/modules/research/actions";
import type { UpsertEnrichmentFieldActionState } from "@/modules/research/types";

describe("EnrichmentFieldForm", () => {
  it("renders the fields", () => {
    render(<EnrichmentFieldForm companyId="company-1" />);

    expect(screen.getByLabelText(/Informação \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status \*/)).toBeInTheDocument();
    expect(screen.getByLabelText("Valor encontrado")).toBeInTheDocument();
    expect(screen.getByLabelText("Fonte")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar informação" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertEnrichmentFieldAction).mockResolvedValue({
      status: "error",
      errors: { value: "Informe o valor encontrado, ou marque como ausente." },
    });

    const user = userEvent.setup();
    render(<EnrichmentFieldForm companyId="company-1" />);
    await user.click(screen.getByRole("button", { name: "Salvar informação" }));

    expect(
      await screen.findByText(
        "Informe o valor encontrado, ou marque como ausente.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar a informação",
    );
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: UpsertEnrichmentFieldActionState) => void = () =>
      undefined;
    vi.mocked(upsertEnrichmentFieldAction).mockImplementation(
      () =>
        new Promise<UpsertEnrichmentFieldActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<EnrichmentFieldForm companyId="company-1" />);
    await user.click(screen.getByRole("button", { name: "Salvar informação" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
