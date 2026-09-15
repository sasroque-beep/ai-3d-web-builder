import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SitePageForm } from "@/app/leads/[id]/design/SitePageForm";
import { SitePageSectionForm } from "@/app/leads/[id]/design/SitePageSectionForm";
import { crmService } from "@/modules/crm/service";
import {
  checkPageArchitectureEligibility,
  designService,
} from "@/modules/design/service";
import {
  JOURNEY_STAGE_LABELS,
  type SitePageRecord,
  type SitePageSectionRecord,
} from "@/modules/design/types";
import { sitePlanningService } from "@/modules/site-planning/service";
import { EmptyState } from "@/ui/states";

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

// The page architecture and the site plan it depends on change
// continuously; never serve this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: DesignPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company
      ? `Arquitetura de páginas — ${company.name}`
      : "Empresa não encontrada",
  };
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { id } = await params;

  const [company, sitePlan] = await Promise.all([
    crmService.getCompanyById(id),
    sitePlanningService.getSitePlan(id),
  ]);

  if (!company) {
    notFound();
  }

  const eligibility = checkPageArchitectureEligibility(sitePlan);
  const pages: SitePageRecord[] = eligibility.eligible
    ? await designService.listPages(id)
    : [];
  const sectionsByPage = new Map<string, SitePageSectionRecord[]>(
    await Promise.all(
      pages.map(
        async (page) =>
          [page.id, await designService.listSections(page.id)] as const,
      ),
    ),
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Arquitetura de páginas
        </p>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
      </div>

      {!eligibility.eligible ? (
        <EmptyState
          title="Dados insuficientes para definir a arquitetura de páginas"
          description={eligibility.reason}
          action={
            <Link
              href={`/leads/${id}/site-planning`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Criar planejamento estratégico do site
            </Link>
          }
        />
      ) : (
        <>
          {pages.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground/50">
                        Página {page.position} · /{page.slug}
                      </p>
                      <h2 className="text-lg font-semibold">{page.name}</h2>
                    </div>
                    {page.journeyStage ? (
                      <span className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-foreground/70">
                        {JOURNEY_STAGE_LABELS[page.journeyStage]}
                      </span>
                    ) : null}
                  </div>
                  {page.objective ? (
                    <p className="text-sm text-foreground/70">
                      {page.objective}
                    </p>
                  ) : null}

                  {(sectionsByPage.get(page.id)?.length ?? 0) > 0 ? (
                    <ul className="flex flex-col gap-2 border-t border-white/10 pt-3">
                      {sectionsByPage.get(page.id)?.map((section) => (
                        <li key={section.id} className="text-sm">
                          <span className="text-foreground/50">
                            {section.position}.{" "}
                          </span>
                          <span className="font-medium">{section.name}</span>
                          {section.objective ? (
                            <span className="text-foreground/70">
                              {" "}
                              — {section.objective}
                            </span>
                          ) : null}
                          {section.ctaReference ? (
                            <span className="text-foreground/50">
                              {" "}
                              (CTA: {section.ctaReference})
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-foreground/50">
                      Nenhuma seção cadastrada ainda.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nenhuma página cadastrada ainda"
              description="Preencha o formulário abaixo para criar a primeira página do site desta empresa."
            />
          )}

          <SitePageForm companyId={id} />

          {pages.length > 0 ? <SitePageSectionForm pages={pages} /> : null}
        </>
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
