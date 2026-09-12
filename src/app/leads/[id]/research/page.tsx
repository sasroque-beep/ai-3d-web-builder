import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnrichmentFieldForm } from "@/app/leads/[id]/research/EnrichmentFieldForm";
import { crmService } from "@/modules/crm/service";
import { researchService } from "@/modules/research/service";
import {
  ENRICHMENT_FIELD_LABELS,
  type EnrichmentStatus,
} from "@/modules/research/types";

interface ResearchPageProps {
  params: Promise<{ id: string }>;
}

// Enrichment fields are updated continuously by the operator; never serve
// this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<EnrichmentStatus, string> = {
  confirmed: "Confirmado",
  unverified: "Não verificado",
  missing: "Ausente",
};

export async function generateMetadata({
  params,
}: ResearchPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company
      ? `Enriquecimento — ${company.name}`
      : "Empresa não encontrada",
  };
}

export default async function ResearchPage({ params }: ResearchPageProps) {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);

  if (!company) {
    notFound();
  }

  const overview = await researchService.getEnrichmentOverview(id);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Enriquecimento de dados
        </p>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {overview.map((field) => (
          <li
            key={field.fieldKey}
            className="flex flex-col gap-1 rounded-lg border border-white/10 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">
                {ENRICHMENT_FIELD_LABELS[field.fieldKey]}
              </span>
              <span className="text-xs uppercase tracking-wide text-foreground/50">
                {STATUS_LABELS[field.status]}
              </span>
            </div>
            {field.value ? <p className="text-sm">{field.value}</p> : null}
            {field.source ? (
              <p className="text-xs text-foreground/50">
                Fonte: {field.source}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <EnrichmentFieldForm companyId={id} />

      <div>
        <Link
          href={`/leads/${id}`}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          Voltar para a empresa
        </Link>
      </div>
    </main>
  );
}
