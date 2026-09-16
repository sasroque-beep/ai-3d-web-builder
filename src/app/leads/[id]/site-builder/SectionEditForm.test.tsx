// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/copy/actions", () => ({
  upsertSectionCopyAction: vi.fn(),
}));

import { SectionEditForm } from "@/app/leads/[id]/site-builder/SectionEditForm";
import { upsertSectionCopyAction } from "@/modules/copy/actions";
import type { UpsertSectionCopyActionState } from "@/modules/copy/types";

describe("SectionEditForm", () => {
  it("prefills the fields from the section's existing content", () => {
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={{
          headline: "Pão fresco todos os dias",
          subheadline: "Direto do forno.",
          body: "Corpo do texto.",
          ctaLabel: "Peça agora",
          socialProofText: "500 clientes satisfeitos.",
          notes: "Nota interna.",
        }}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Título/headline")).toHaveValue(
      "Pão fresco todos os dias",
    );
    expect(
      screen.getByLabelText("Texto do CTA exibido nessa seção"),
    ).toHaveValue("Peça agora");
  });

  it("renders empty fields when the section has no content yet", () => {
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Título/headline")).toHaveValue("");
  });

  it("calls onCancel when the cancel button is clicked, without submitting", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={null}
        onSaved={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(upsertSectionCopyAction).not.toHaveBeenCalled();
  });

  it("shows validation errors returned by the action", async () => {
    vi.mocked(upsertSectionCopyAction).mockResolvedValue({
      status: "error",
      errors: { headline: "Informe o título." },
    });

    const user = userEvent.setup();
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

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
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

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
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={null}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Salvando...",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "idle" });
  });

  it("calls onSaved after a successful save", async () => {
    vi.mocked(upsertSectionCopyAction).mockResolvedValue({ status: "idle" });
    const onSaved = vi.fn();

    const user = userEvent.setup();
    render(
      <SectionEditForm
        sectionId="section-1"
        copy={null}
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await vi.waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });
});
