import type { Metadata } from "next";
import Link from "next/link";

import { crmService } from "@/modules/crm/service";
import { EmptyState } from "@/ui/states";

export const metadata: Metadata = {
  title: "Empresas e leads",
};

// Always reflect the latest data — companies are created continuously via
// the registration form and must never be served from a stale build-time
// snapshot.
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const companies = await crmService.listCompanies();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Empresas e leads</h1>
        <Link
          href="/leads/new"
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Cadastrar empresa
        </Link>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa cadastrada ainda"
          description="Cadastre a primeira empresa ou lead para começar."
          action={
            <Link
              href="/leads/new"
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Cadastrar empresa
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {companies.map((company) => (
            <li key={company.id}>
              <Link
                href={`/leads/${company.id}`}
                className="flex flex-col gap-1 rounded-lg border border-white/10 px-4 py-3 transition-colors hover:border-white/30"
              >
                <span className="font-medium">{company.name}</span>
                <span className="text-sm text-foreground/70">
                  {company.segment} ·{" "}
                  {company.relationshipType === "client" ? "Cliente" : "Lead"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
