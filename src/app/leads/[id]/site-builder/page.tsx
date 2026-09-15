import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SitePreviewViewer } from "@/app/leads/[id]/site-builder/SitePreviewViewer";
import { copyService } from "@/modules/copy/service";
import type { SectionCopyRecord } from "@/modules/copy/types";
import { crmService } from "@/modules/crm/service";
import { designService } from "@/modules/design/service";
import type { SitePageSectionRecord } from "@/modules/design/types";
import {
  buildSitePreview,
  checkPreviewEligibility,
} from "@/modules/site-builder/service";
import { EmptyState } from "@/ui/states";

interface SiteBuilderPageProps {
  params: Promise<{ id: string }>;
}

// The preview depends on data that changes continuously across several
// earlier steps; never serve this route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SiteBuilderPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company
      ? `Preview do site — ${company.name}`
      : "Empresa não encontrada",
  };
}

export default async function SiteBuilderPage({
  params,
}: SiteBuilderPageProps) {
  const { id } = await params;

  const [company, pages] = await Promise.all([
    crmService.getCompanyById(id),
    designService.listPages(id),
  ]);

  if (!company) {
    notFound();
  }

  const eligibility = checkPreviewEligibility(pages);

  if (!eligibility.eligible) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
            Preview do site
          </p>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
        </div>

        <EmptyState
          title="Dados insuficientes para gerar o preview"
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

  const sectionsByPage = new Map<string, SitePageSectionRecord[]>(
    await Promise.all(
      pages.map(
        async (page) =>
          [page.id, await designService.listSections(page.id)] as const,
      ),
    ),
  );
  const allSections = [...sectionsByPage.values()].flat();

  const copyBySection = new Map<string, SectionCopyRecord | undefined>(
    await Promise.all(
      allSections.map(
        async (section) =>
          [section.id, await copyService.getSectionCopy(section.id)] as const,
      ),
    ),
  );

  const theme = await designService.getTheme(id);

  const preview = buildSitePreview({
    company: { id: company.id, name: company.name },
    pages,
    sectionsByPage,
    copyBySection,
    theme,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Preview do site
        </p>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
      </div>

      <SitePreviewViewer preview={preview} />

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
