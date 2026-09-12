import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StrategyForm } from "@/app/leads/[id]/strategy/StrategyForm";
import { crmService } from "@/modules/crm/service";
import { diagnosisService } from "@/modules/research/diagnosis/service";
import {
  checkStrategyEligibility,
  strategyService,
} from "@/modules/strategy/service";
import { JOURNEY_FIELDS } from "@/modules/strategy/types";
import { EmptyState } from "@/ui/states";

interface StrategyPageProps {
  params: Promise<{ id: string }>;
}

// The strategy and the diagnosis it depends on change continuously; never
// serve this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: StrategyPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company ? `Estratégia — ${company.name}` : "Empresa não encontrada",
  };
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { id } = await params;

  // Diagnosis and strategy don't depend on the company record, so they run
  // concurrently with it instead of waiting in series.
  const [company, diagnosis, strategy] = await Promise.all([
    crmService.getCompanyById(id),
    diagnosisService.getDiagnosis(id),
    strategyService.getStrategy(id),
  ]);

  if (!company) {
    notFound();
  }

  const eligibility = checkStrategyEligibility(diagnosis);
  // Eligibility gates creating/updating a strategy, never viewing one that
  // already exists: the diagnosis it depends on can be removed later, and
  // that must not hide a previously saved strategy.
  const showContext = Boolean(strategy) || eligibility.eligible;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Estratégia de marketing e conversão
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
            {company.targetAudience ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Público-alvo cadastrado
                </dt>
                <dd className="text-sm">{company.targetAudience}</dd>
              </div>
            ) : null}
            {diagnosis?.summary ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Resumo do diagnóstico
                </dt>
                <dd className="text-sm">{diagnosis.summary}</dd>
              </div>
            ) : null}
            {diagnosis?.valueProposition ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Proposta de valor do diagnóstico
                </dt>
                <dd className="text-sm">{diagnosis.valueProposition}</dd>
              </div>
            ) : null}
            {diagnosis?.differentiators ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Diferenciais do diagnóstico
                </dt>
                <dd className="text-sm">{diagnosis.differentiators}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {strategy ? (
        <section className="flex flex-col gap-4 rounded-lg border border-white/10 px-4 py-4">
          <h2 className="text-lg font-semibold">Estratégia atual</h2>
          {strategy.marketingObjective ? (
            <p className="text-sm">
              <span className="text-foreground/50">
                Objetivo de marketing:{" "}
              </span>
              {strategy.marketingObjective}
            </p>
          ) : null}
          {strategy.conversionObjective ? (
            <p className="text-sm">
              <span className="text-foreground/50">
                Objetivo de conversão:{" "}
              </span>
              {strategy.conversionObjective}
            </p>
          ) : null}
          <div>
            <h3 className="text-sm font-medium">Jornada do cliente</h3>
            <dl className="mt-2 grid gap-3 sm:grid-cols-2">
              {JOURNEY_FIELDS.map(([field, label]) =>
                strategy[field] ? (
                  <div key={field}>
                    <dt className="text-xs uppercase tracking-wide text-foreground/50">
                      {label}
                    </dt>
                    <dd className="text-sm">{strategy[field]}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </div>
        </section>
      ) : eligibility.eligible ? (
        <EmptyState
          title="Nenhuma estratégia gerada ainda"
          description="Preencha o formulário abaixo para criar a primeira estratégia desta empresa."
        />
      ) : null}

      {!eligibility.eligible ? (
        <EmptyState
          title={
            strategy
              ? "Dados insuficientes para atualizar a estratégia"
              : "Dados insuficientes para gerar a estratégia"
          }
          description={eligibility.reason}
          action={
            <Link
              href={`/leads/${id}/diagnosis`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Gerar diagnóstico estratégico
            </Link>
          }
        />
      ) : (
        <StrategyForm companyId={id} strategy={strategy ?? null} />
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
