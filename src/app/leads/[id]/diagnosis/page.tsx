import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiagnosisForm } from "@/app/leads/[id]/diagnosis/DiagnosisForm";
import { crmService } from "@/modules/crm/service";
import {
  checkDiagnosisEligibility,
  diagnosisService,
  listMissingEnrichment,
} from "@/modules/research/diagnosis/service";
import { DIGITAL_MATURITY_LABELS } from "@/modules/research/diagnosis/types";
import { researchService } from "@/modules/research/service";
import { EmptyState } from "@/ui/states";

interface DiagnosisPageProps {
  params: Promise<{ id: string }>;
}

// The diagnostic and the underlying enrichment data change continuously;
// never serve this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

const LIST_FIELDS = [
  ["strengths", "Pontos fortes"],
  ["weaknesses", "Pontos fracos"],
  ["opportunities", "Oportunidades"],
  ["risksOrGaps", "Riscos ou lacunas"],
  ["recommendations", "Recomendações iniciais"],
] as const;

function toListItems(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Disambiguates repeated lines so each gets a stable, unique React key. */
function withStableKeys(items: string[]): Array<{ text: string; key: string }> {
  const seen = new Map<string, number>();
  return items.map((text) => {
    const occurrence = seen.get(text) ?? 0;
    seen.set(text, occurrence + 1);
    return { text, key: occurrence === 0 ? text : `${text}-${occurrence}` };
  });
}

export async function generateMetadata({
  params,
}: DiagnosisPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company ? `Diagnóstico — ${company.name}` : "Empresa não encontrada",
  };
}

export default async function DiagnosisPage({ params }: DiagnosisPageProps) {
  const { id } = await params;

  // Overview and diagnosis don't depend on the company record, so they run
  // concurrently with it instead of waiting in series.
  const [company, overview, diagnosis] = await Promise.all([
    crmService.getCompanyById(id),
    researchService.getEnrichmentOverview(id),
    diagnosisService.getDiagnosis(id),
  ]);

  if (!company) {
    notFound();
  }

  const eligibility = checkDiagnosisEligibility(overview);
  const missingData = listMissingEnrichment(overview);
  // Eligibility gates creating/updating a diagnosis, never viewing one that
  // already exists: enrichment can regress after a diagnosis was created,
  // and that must not hide a previously saved record.
  const showContext = Boolean(diagnosis) || eligibility.eligible;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Diagnóstico estratégico
        </p>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
      </div>

      {showContext ? (
        <section className="flex flex-col gap-3 rounded-lg border border-white/10 px-4 py-4">
          <h2 className="text-lg font-semibold">Dados reaproveitados</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Segmento
              </dt>
              <dd className="text-sm">{company.segment}</dd>
            </div>
            {company.mainProducts ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Produtos e serviços
                </dt>
                <dd className="text-sm">{company.mainProducts}</dd>
              </div>
            ) : null}
            {company.targetAudience ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Público-alvo
                </dt>
                <dd className="text-sm">{company.targetAudience}</dd>
              </div>
            ) : null}
            {company.website || company.socialMedia ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Presença digital
                </dt>
                <dd className="text-sm">
                  {[company.website, company.socialMedia]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {showContext && missingData.length > 0 ? (
        <section className="flex flex-col gap-2 rounded-lg border border-white/10 px-4 py-4">
          <h2 className="text-lg font-semibold">
            Informações ainda não coletadas
          </h2>
          <ul className="list-inside list-disc text-sm text-foreground/70">
            {missingData.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {diagnosis ? (
        <section className="flex flex-col gap-4 rounded-lg border border-white/10 px-4 py-4">
          <h2 className="text-lg font-semibold">Diagnóstico atual</h2>
          {diagnosis.summary ? (
            <p className="text-sm">{diagnosis.summary}</p>
          ) : null}
          {diagnosis.digitalMaturity ? (
            <p className="text-sm">
              <span className="text-foreground/50">Maturidade digital: </span>
              {DIGITAL_MATURITY_LABELS[diagnosis.digitalMaturity]}
            </p>
          ) : null}
          {LIST_FIELDS.map(([field, label]) => {
            const items = toListItems(diagnosis[field]);
            if (items.length === 0) return null;
            return (
              <div key={field}>
                <h3 className="text-sm font-medium">{label}</h3>
                <ul className="list-inside list-disc text-sm text-foreground/70">
                  {withStableKeys(items).map(({ text, key }) => (
                    <li key={key}>{text}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ) : eligibility.eligible ? (
        <EmptyState
          title="Nenhum diagnóstico gerado ainda"
          description="Preencha o formulário abaixo para criar o primeiro diagnóstico desta empresa."
        />
      ) : null}

      {!eligibility.eligible ? (
        <EmptyState
          title={
            diagnosis
              ? "Dados insuficientes para atualizar o diagnóstico"
              : "Dados insuficientes para gerar o diagnóstico"
          }
          description={eligibility.reason}
          action={
            <Link
              href={`/leads/${id}/research`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Enriquecer dados da empresa
            </Link>
          }
        />
      ) : (
        <DiagnosisForm companyId={id} diagnosis={diagnosis ?? null} />
      )}

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
