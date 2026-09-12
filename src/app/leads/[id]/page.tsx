import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { crmService } from "@/modules/crm/service";
import type { CompanyRecord } from "@/modules/crm/types";
import { SuccessMessage } from "@/ui/states";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}

// A newly created company must be visible immediately; never serve this
// route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

const FIELD_LABELS: Array<[keyof CompanyRecord, string]> = [
  ["city", "Cidade"],
  ["state", "UF"],
  ["website", "Site atual"],
  ["socialMedia", "Instagram/rede social"],
  ["phone", "Telefone/WhatsApp"],
  ["email", "E-mail"],
  ["address", "Endereço"],
  ["description", "Descrição do negócio"],
  ["mainProducts", "Produtos ou serviços principais"],
  ["targetAudience", "Público-alvo"],
  ["mainGoal", "Objetivo principal do projeto"],
  ["notes", "Observações adicionais"],
];

export async function generateMetadata({
  params,
}: LeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return { title: company?.name ?? "Empresa não encontrada" };
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: LeadDetailPageProps) {
  const { id } = await params;
  const { created } = await searchParams;

  const company = await crmService.getCompanyById(id);

  if (!company) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      {created ? (
        <SuccessMessage
          title="Empresa cadastrada com sucesso"
          description="Você pode revisar as informações abaixo a qualquer momento."
        />
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
            {company.relationshipType === "client" ? "Cliente" : "Lead"}
          </p>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href={`/leads/${company.id}/research`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium transition-colors hover:border-white/30"
          >
            Enriquecer dados
          </Link>
          <Link
            href={`/leads/${company.id}/diagnosis`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium transition-colors hover:border-white/30"
          >
            Ver diagnóstico
          </Link>
          <Link
            href={`/leads/${company.id}/strategy`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium transition-colors hover:border-white/30"
          >
            Ver estratégia
          </Link>
          <Link
            href={`/leads/${company.id}/site-planning`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium transition-colors hover:border-white/30"
          >
            Ver planejamento do site
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {FIELD_LABELS.filter(([field]) => company[field]).map(
          ([field, label]) => (
            <div key={field} className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                {label}
              </dt>
              <dd className="text-sm">{company[field]}</dd>
            </div>
          ),
        )}
      </dl>

      <div>
        <Link
          href="/leads"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          Voltar para a lista de empresas
        </Link>
      </div>
    </main>
  );
}
