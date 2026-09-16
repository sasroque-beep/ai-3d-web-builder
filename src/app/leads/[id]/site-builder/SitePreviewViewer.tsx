"use client";

import { useState } from "react";

import { SectionEditForm } from "@/app/leads/[id]/site-builder/SectionEditForm";
import type {
  PagePreview,
  SitePreview,
  SitePreviewTheme,
} from "@/modules/site-builder/types";

const SPACING_GAP_CLASSES: Record<
  NonNullable<SitePreviewTheme["spacingDensity"]>,
  string
> = {
  compact: "gap-3",
  comfortable: "gap-5",
  spacious: "gap-8",
};

function themeStyle(theme: SitePreviewTheme | null): Record<string, string> {
  if (!theme) return {};

  const style: Record<string, string> = {};
  if (theme.primaryColor) style["--preview-primary"] = theme.primaryColor;
  if (theme.secondaryColor) style["--preview-secondary"] = theme.secondaryColor;
  if (theme.accentColor) style["--preview-accent"] = theme.accentColor;
  if (theme.backgroundColor)
    style["--preview-background"] = theme.backgroundColor;
  if (theme.headingFont) style["--preview-heading-font"] = theme.headingFont;
  if (theme.bodyFont) style["--preview-body-font"] = theme.bodyFont;
  return style;
}

interface SitePreviewViewerProps {
  preview: SitePreview;
}

export function SitePreviewViewer({ preview }: SitePreviewViewerProps) {
  const [selectedPageId, setSelectedPageId] = useState<string>(
    preview.pages[0]?.id ?? "",
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const selectedPage: PagePreview | undefined = preview.pages.find(
    (page) => page.id === selectedPageId,
  );

  function selectPage(pageId: string) {
    setSelectedPageId(pageId);
    setEditingSectionId(null);
  }

  const gapClass = preview.theme?.spacingDensity
    ? SPACING_GAP_CLASSES[preview.theme.spacingDensity]
    : SPACING_GAP_CLASSES.comfortable;

  return (
    <div
      style={themeStyle(preview.theme)}
      className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[color:var(--preview-background,transparent)] p-4"
    >
      <div role="tablist" className="flex flex-wrap gap-2">
        {preview.pages.map((page) => (
          <button
            key={page.id}
            type="button"
            role="tab"
            aria-selected={page.id === selectedPageId}
            onClick={() => selectPage(page.id)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              page.id === selectedPageId
                ? "border-[color:var(--preview-accent,var(--color-accent))] text-[color:var(--preview-accent,var(--color-accent))]"
                : "border-white/15 text-foreground/70 hover:border-white/30"
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>

      {selectedPage ? (
        <div className={`flex flex-col ${gapClass}`}>
          {selectedPage.objective ? (
            <p className="text-sm text-foreground/60">
              {selectedPage.objective}
            </p>
          ) : null}

          {selectedPage.sections.length === 0 ? (
            <p className="text-sm text-foreground/50">
              Nenhuma seção cadastrada ainda para esta página.
            </p>
          ) : (
            selectedPage.sections.map((section) =>
              section.id === editingSectionId ? (
                <SectionEditForm
                  key={section.id}
                  sectionId={section.id}
                  copy={section.copy}
                  onSaved={() => setEditingSectionId(null)}
                  onCancel={() => setEditingSectionId(null)}
                />
              ) : (
                <section
                  key={section.id}
                  data-has-content={section.hasContent}
                  className="flex flex-col gap-2 rounded-md border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2
                      style={{
                        fontFamily: "var(--preview-heading-font, inherit)",
                        color: "var(--preview-primary, var(--color-accent))",
                      }}
                      className="text-xl font-semibold"
                    >
                      {section.heading}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(section.id)}
                      className="shrink-0 rounded-md border border-white/15 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:border-white/30"
                    >
                      Editar
                    </button>
                  </div>
                  {section.subheading ? (
                    <p className="text-sm text-foreground/70">
                      {section.subheading}
                    </p>
                  ) : null}
                  {section.body ? (
                    <p
                      style={{
                        fontFamily: "var(--preview-body-font, inherit)",
                      }}
                      className="text-sm"
                    >
                      {section.body}
                    </p>
                  ) : null}
                  {section.socialProofText ? (
                    <p className="text-xs text-foreground/50">
                      {section.socialProofText}
                    </p>
                  ) : null}
                  {section.ctaLabel ? (
                    <span
                      style={{
                        backgroundColor:
                          "var(--preview-accent, var(--color-accent))",
                      }}
                      className="w-fit rounded-md px-4 py-2 text-sm font-medium text-white"
                    >
                      {section.ctaLabel}
                    </span>
                  ) : null}
                  {!section.hasContent ? (
                    <p className="text-xs text-foreground/40">
                      Conteúdo ainda não definido para esta seção.
                    </p>
                  ) : null}
                </section>
              ),
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
