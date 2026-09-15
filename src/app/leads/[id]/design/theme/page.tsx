import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteThemeForm } from "@/app/leads/[id]/design/theme/SiteThemeForm";
import { crmService } from "@/modules/crm/service";
import { checkThemeEligibility, designService } from "@/modules/design/service";
import {
  COLOR_MODE_LABELS,
  SPACING_DENSITY_LABELS,
} from "@/modules/design/types";
import { EmptyState } from "@/ui/states";

interface ThemePageProps {
  params: Promise<{ id: string }>;
}

// The theme and the page architecture it depends on change continuously;
// never serve this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ThemePageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company ? `Tema visual — ${company.name}` : "Empresa não encontrada",
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { id } = await params;

  const [company, pages] = await Promise.all([
    crmService.getCompanyById(id),
    designService.listPages(id),
  ]);

  if (!company) {
    notFound();
  }

  const eligibility = checkThemeEligibility(pages);
  const theme = eligibility.eligible
    ? await designService.getTheme(id)
    : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Tema visual e diretrizes de design
        </p>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
      </div>

      {!eligibility.eligible ? (
        <EmptyState
          title="Dados insuficientes para configurar o tema visual"
          description={eligibility.reason}
          action={
            <Link
              href={`/leads/${id}/design`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Definir arquitetura de páginas
            </Link>
          }
        />
      ) : (
        <>
          {theme ? (
            <section className="flex flex-col gap-3 rounded-lg border border-white/10 px-4 py-4">
              <h2 className="text-lg font-semibold">Tema atual</h2>
              {theme.visualStyle ? (
                <p className="text-sm">
                  <span className="text-foreground/50">Estilo visual: </span>
                  {theme.visualStyle}
                </p>
              ) : null}
              {theme.colorModePreference ? (
                <p className="text-sm">
                  <span className="text-foreground/50">Modo de cor: </span>
                  {COLOR_MODE_LABELS[theme.colorModePreference]}
                </p>
              ) : null}
              {theme.spacingDensity ? (
                <p className="text-sm">
                  <span className="text-foreground/50">
                    Densidade de espaçamento:{" "}
                  </span>
                  {SPACING_DENSITY_LABELS[theme.spacingDensity]}
                </p>
              ) : null}
            </section>
          ) : (
            <EmptyState
              title="Nenhum tema definido ainda"
              description="Preencha o formulário abaixo para definir o tema visual do site desta empresa."
            />
          )}

          <SiteThemeForm companyId={id} theme={theme ?? null} />
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
