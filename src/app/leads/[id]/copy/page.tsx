import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCopyForm } from "@/app/leads/[id]/copy/SectionCopyForm";
import { copyService } from "@/modules/copy/service";
import { crmService } from "@/modules/crm/service";
import { designService } from "@/modules/design/service";
import type {
  SitePageRecord,
  SitePageSectionRecord,
} from "@/modules/design/types";
import { EmptyState } from "@/ui/states";

interface CopyPageProps {
  params: Promise<{ id: string }>;
}

// Sections and their content are edited continuously; never serve this
// route from a stale build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CopyPageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await crmService.getCompanyById(id);
  return {
    title: company
      ? `Conteúdo das seções — ${company.name}`
      : "Empresa não encontrada",
  };
}

export default async function CopyPage({ params }: CopyPageProps) {
  const { id } = await params;

  const [company, pages] = await Promise.all([
    crmService.getCompanyById(id),
    designService.listPages(id),
  ]);

  if (!company) {
    notFound();
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

  const copyBySection = new Map(
    await Promise.all(
      allSections.map(
        async (section) =>
          [section.id, await copyService.getSectionCopy(section.id)] as const,
      ),
    ),
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Conteúdo das seções
        </p>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-foreground/70">{company.segment}</p>
      </div>

      {allSections.length === 0 ? (
        <EmptyState
          title="Nenhuma seção cadastrada ainda"
          description="Defina a arquitetura de páginas da empresa antes de registrar o conteúdo das seções."
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
          <ul className="flex flex-col gap-4">
            {pages.map((page) => (
              <PageSections
                key={page.id}
                page={page}
                sections={sectionsByPage.get(page.id) ?? []}
                copyBySection={copyBySection}
              />
            ))}
          </ul>

          <SectionCopyForm pages={pages} sectionsByPage={sectionsByPage} />
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

interface PageSectionsProps {
  page: SitePageRecord;
  sections: SitePageSectionRecord[];
  copyBySection: Map<
    string,
    Awaited<ReturnType<typeof copyService.getSectionCopy>>
  >;
}

function PageSections({ page, sections, copyBySection }: PageSectionsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-white/10 px-4 py-4">
      <h2 className="text-lg font-semibold">{page.name}</h2>
      <ul className="flex flex-col gap-3 border-t border-white/10 pt-3">
        {sections.map((section) => {
          const copy = copyBySection.get(section.id);
          return (
            <li key={section.id} className="text-sm">
              <p className="font-medium">{section.name}</p>
              {copy ? (
                <div className="mt-1 flex flex-col gap-1 text-foreground/70">
                  {copy.headline ? <p>{copy.headline}</p> : null}
                  {copy.subheadline ? <p>{copy.subheadline}</p> : null}
                  {copy.body ? <p>{copy.body}</p> : null}
                  {copy.ctaLabel ? (
                    <p className="text-foreground/50">CTA: {copy.ctaLabel}</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-1 text-foreground/50">
                  Nenhum conteúdo cadastrado ainda.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
