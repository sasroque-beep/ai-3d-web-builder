// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/crm/actions", () => ({
  createCompanyAction: vi.fn(),
}));

import { CompanyForm } from "@/app/leads/new/CompanyForm";
import { createCompanyAction } from "@/modules/crm/actions";
import type { CreateCompanyActionState } from "@/modules/crm/types";

const emptyValues = {
  name: "",
  segment: "",
  relationshipType: "lead",
  city: "",
  state: "",
  website: "",
  socialMedia: "",
  phone: "",
  email: "",
  address: "",
  description: "",
  mainProducts: "",
  targetAudience: "",
  mainGoal: "",
  notes: "",
};

describe("CompanyForm", () => {
  it("renders the required fields", () => {
    render(<CompanyForm />);

    expect(screen.getByLabelText(/Nome da empresa/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Segmento\/nicho/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar empresa" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(createCompanyAction).mockResolvedValue({
      status: "error",
      errors: { name: "Informe o nome da empresa." },
      values: { ...emptyValues, segment: "Alimentação" },
    });

    const user = userEvent.setup();
    render(<CompanyForm />);
    await user.click(screen.getByRole("button", { name: "Salvar empresa" }));

    expect(
      await screen.findByText("Informe o nome da empresa."),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar a empresa",
    );
  });

  it("shows a pending state while the action is running", async () => {
    let resolveAction: (value: CreateCompanyActionState) => void = () =>
      undefined;
    vi.mocked(createCompanyAction).mockImplementation(
      () =>
        new Promise<CreateCompanyActionState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const user = userEvent.setup();
    render(<CompanyForm />);
    await user.click(screen.getByRole("button", { name: "Salvar empresa" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });
});
