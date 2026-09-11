import type { Metadata } from "next";

import { CompanyForm } from "@/app/leads/new/CompanyForm";

export const metadata: Metadata = {
  title: "Cadastrar empresa",
};

export default function NewLeadPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold">Cadastrar empresa/lead</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Nem todos os campos são obrigatórios. Preencha o que tiver disponível
          agora — o restante pode ser complementado depois.
        </p>
      </div>
      <CompanyForm />
    </main>
  );
}
