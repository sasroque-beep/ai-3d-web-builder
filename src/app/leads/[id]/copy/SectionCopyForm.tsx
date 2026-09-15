"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertSectionCopyAction } from "@/modules/copy/actions";
import {
  initialUpsertSectionCopyActionState,
  type SectionCopyFormInput,
} from "@/modules/copy/types";
import type {
  SitePageRecord,
  SitePageSectionRecord,
} from "@/modules/design/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: keyof SectionCopyFormInput;
  label: string;
  errors: Partial<Record<keyof SectionCopyFormInput, string>>;
  rows?: number;
}

function Field({ name, label, errors, rows = 3 }: FieldProps) {
  const error = errors[name];
  const describedBy = error ? `${name}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        rows={rows}
        className={inputClassName}
      />
      {error ? (
        <p id={describedBy} className={errorClassName}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar conteúdo"}
    </button>
  );
}

interface SectionCopyFormProps {
  pages: SitePageRecord[];
  sectionsByPage: Map<string, SitePageSectionRecord[]>;
}

export function SectionCopyForm({
  pages,
  sectionsByPage,
}: SectionCopyFormProps) {
  const [state, formAction] = useActionState(
    upsertSectionCopyAction,
    initialUpsertSectionCopyActionState,
  );

  const errors = state.status === "error" ? state.errors : {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">Adicionar/atualizar conteúdo</h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar o conteúdo"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar o conteúdo"
          description={state.reason}
        />
      ) : null}

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="sectionId">
          Seção *
        </label>
        <select
          id="sectionId"
          name="sectionId"
          required
          className={inputClassName}
          aria-invalid={Boolean(errors.sectionId)}
          aria-describedby={errors.sectionId ? "sectionId-error" : undefined}
        >
          {pages.map((page) =>
            (sectionsByPage.get(page.id) ?? []).map((section) => (
              <option key={section.id} value={section.id}>
                {page.name} — {section.name}
              </option>
            )),
          )}
        </select>
        {errors.sectionId ? (
          <p id="sectionId-error" className={errorClassName}>
            {errors.sectionId}
          </p>
        ) : null}
      </div>

      <Field name="headline" label="Título/headline" errors={errors} rows={2} />
      <Field
        name="subheadline"
        label="Subtítulo ou texto de apoio"
        errors={errors}
        rows={2}
      />
      <Field name="body" label="Texto principal (corpo)" errors={errors} />
      <Field
        name="ctaLabel"
        label="Texto do CTA exibido nessa seção"
        errors={errors}
        rows={1}
      />
      <Field
        name="socialProofText"
        label="Prova social ou depoimento específico da seção"
        errors={errors}
        rows={2}
      />
      <Field
        name="notes"
        label="Observações sobre o conteúdo"
        errors={errors}
        rows={2}
      />

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
