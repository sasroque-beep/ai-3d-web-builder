import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SitePlanForm } from "@/app/leads/[id]/site-planning/SitePlanForm";
import { crmService } from "@/modules/crm/service";
import {
  checkSitePlanningEligibility,
  sitePlanningService,
} from "@/modules/site-planning/service";
import { strategyService } from "@/modules/strategy/service";
import { EmptyState } from "@/ui/states";

interface SitePlanningPageProps {
  params: Promise<{ id: string }>;
}

// The site plan and the strategy it depends on change continuously; never
// serve this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SitePlanningPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company
      ? `Planejamento do site — ${company.name}`
      : "Empresa não encontrada",
  };
}

export default async function SitePlanningPage({
  params,
}: SitePlanningPageProps) {
  const { id } = await params;

  // Strategy and the site plan don't depend on the company record, so they
  // run concurrently with it instead of waiting in series.
  const [company, strategy, sitePlan] = await Promise.all([
    crmService.getCompanyById(id),
    strategyService.getStrategy(id),
    sitePlanningService.getSitePlan(id),
  ]);

  if (!company) {
    notFound();
  }

  const eligibility = checkSitePlanningEligibility(strategy);
  // Eligibility gates creating/updating a site plan, never viewing one that
  // already exists: the strategy it depends on can be removed later, and
  // that must not hide a previously saved plan.
  const showContext = Boolean(sitePlan) || eligibility.eligible;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Planejamento estratégico do site
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
            {strategy?.valueProposition ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Proposta de valor da estratégia
                </dt>
                <dd className="text-sm">{strategy.valueProposition}</dd>
              </div>
            ) : null}
            {strategy?.mainOffer ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Oferta principal da estratégia
                </dt>
                <dd className="text-sm">{strategy.mainOffer}</dd>
              </div>
            ) : null}
            {strategy?.targetAudience ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Público-alvo da estratégia
                </dt>
                <dd className="text-sm">{strategy.targetAudience}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {sitePlan ? (
        <section className="flex flex-col gap-4 rounded-lg border border-white/10 px-4 py-4">
          <h2 className="text-lg font-semibold">Planejamento atual</h2>
          {sitePlan.mainGoal ? (
            <p className="text-sm">
              <span className="text-foreground/50">
                Objetivo principal do site:{" "}
              </span>
              {sitePlan.mainGoal}
            </p>
          ) : null}
          {sitePlan.conversionGoal ? (
            <p className="text-sm">
              <span className="text-foreground/50">
                Objetivo principal de conversão:{" "}
              </span>
              {sitePlan.conversionGoal}
            </p>
          ) : null}
          {sitePlan.primaryCta ? (
            <p className="text-sm">
              <span className="text-foreground/50">CTA principal: </span>
              {sitePlan.primaryCta}
            </p>
          ) : null}
        </section>
      ) : eligibility.eligible ? (
        <EmptyState
          title="Nenhum planejamento gerado ainda"
          description="Preencha o formulário abaixo para criar o primeiro planejamento estratégico do site desta empresa."
        />
      ) : null}

      {!eligibility.eligible ? (
        <EmptyState
          title={
            sitePlan
              ? "Dados insuficientes para atualizar o planejamento"
              : "Dados insuficientes para gerar o planejamento"
          }
          description={eligibility.reason}
          action={
            <Link
              href={`/leads/${id}/strategy`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Criar estratégia de marketing e conversão
            </Link>
          }
        />
      ) : (
        <SitePlanForm companyId={id} sitePlan={sitePlan ?? null} />
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
