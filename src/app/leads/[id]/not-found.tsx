import Link from "next/link";

import { ErrorState } from "@/ui/states";

export default function LeadNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <ErrorState
        title="Empresa não encontrada"
        description="O cadastro que você tentou abrir não existe ou foi removido."
      />
      <Link
        href="/leads"
        className="text-sm text-[var(--color-accent)] hover:underline"
      >
        Voltar para a lista de empresas
      </Link>
    </main>
  );
}
