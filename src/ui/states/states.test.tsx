// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/ui/states/EmptyState";
import { ErrorState } from "@/ui/states/ErrorState";
import { Skeleton } from "@/ui/states/Skeleton";
import { Spinner } from "@/ui/states/Spinner";
import { SuccessMessage } from "@/ui/states/SuccessMessage";

describe("ui/states primitives", () => {
  it("Skeleton renders as a hidden presentational placeholder", () => {
    render(<Skeleton className="h-4 w-full" />);

    expect(
      screen.getByRole("presentation", { hidden: true }),
    ).toBeInTheDocument();
  });

  it("Spinner announces its label via role=status", () => {
    render(<Spinner label="Salvando..." />);

    expect(screen.getByRole("status")).toHaveTextContent("Salvando...");
  });

  it("EmptyState renders title, description and action", () => {
    render(
      <EmptyState
        title="Nenhuma empresa cadastrada"
        description="Cadastre a primeira empresa/lead."
        action={<button type="button">Cadastrar</button>}
      />,
    );

    expect(screen.getByText("Nenhuma empresa cadastrada")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cadastrar" }),
    ).toBeInTheDocument();
  });

  it("ErrorState renders as an alert", () => {
    render(
      <ErrorState title="Falha ao salvar" description="Tente novamente." />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Falha ao salvar");
  });

  it("SuccessMessage renders as a status message", () => {
    render(<SuccessMessage title="Empresa cadastrada com sucesso" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Empresa cadastrada com sucesso",
    );
  });
});
