"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertSitePageSectionAction } from "@/modules/design/actions";
import {
  initialUpsertSitePageSectionActionState,
  type SitePageRecord,
} from "@/modules/design/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface SitePageSectionFormProps {
  pages: SitePageRecord[];
}

export function SitePageSectionForm({ pages }: SitePageSectionFormProps) {
  const [state, formAction] = useActionState(
    upsertSitePageSectionAction,
    initialUpsertSitePageSectionActionState,
  );

  const errors = state.status === "error" ? state.errors : {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">Adicionar/atualizar seção</h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar a seção"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar a seção"
          description={state.reason}
        />
      ) : null}

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="section-pageId">
          Página *
        </label>
        <select
          id="section-pageId"
          name="pageId"
          required
          className={inputClassName}
          aria-invalid={Boolean(errors.pageId)}
          aria-describedby={errors.pageId ? "section-pageId-error" : undefined}
        >
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
        {errors.pageId ? (
          <p id="section-pageId-error" className={errorClassName}>
            {errors.pageId}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="section-sectionKey">
          Identificador da seção *
        </label>
        <input
          id="section-sectionKey"
          name="sectionKey"
          type="text"
          placeholder="Ex.: hero"
          className={inputClassName}
          aria-invalid={Boolean(errors.sectionKey)}
          aria-describedby={
            errors.sectionKey ? "section-sectionKey-error" : undefined
          }
        />
        <p className="text-xs text-foreground/50">
          Reenviar o mesmo identificador dentro da mesma página atualiza a seção
          em vez de criar uma nova.
        </p>
        {errors.sectionKey ? (
          <p id="section-sectionKey-error" className={errorClassName}>
            {errors.sectionKey}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="section-name">
          Nome da seção *
        </label>
        <input
          id="section-name"
          name="name"
          type="text"
          className={inputClassName}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "section-name-error" : undefined}
        />
        {errors.name ? (
          <p id="section-name-error" className={errorClassName}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="section-objective">
          Objetivo da seção
        </label>
        <textarea
          id="section-objective"
          name="objective"
          rows={2}
          className={inputClassName}
          aria-invalid={Boolean(errors.objective)}
          aria-describedby={
            errors.objective ? "section-objective-error" : undefined
          }
        />
        {errors.objective ? (
          <p id="section-objective-error" className={errorClassName}>
            {errors.objective}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="section-ctaReference">
          CTA priorizado nesta seção
        </label>
        <input
          id="section-ctaReference"
          name="ctaReference"
          type="text"
          placeholder="Ex.: Peça agora"
          className={inputClassName}
          aria-invalid={Boolean(errors.ctaReference)}
          aria-describedby={
            errors.ctaReference ? "section-ctaReference-error" : undefined
          }
        />
        {errors.ctaReference ? (
          <p id="section-ctaReference-error" className={errorClassName}>
            {errors.ctaReference}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="section-position">
          Ordem na página
        </label>
        <input
          id="section-position"
          name="position"
          type="number"
          min={1}
          placeholder="Deixe em branco para adicionar ao final"
          className={inputClassName}
          aria-invalid={Boolean(errors.position)}
          aria-describedby={
            errors.position ? "section-position-error" : undefined
          }
        />
        {errors.position ? (
          <p id="section-position-error" className={errorClassName}>
            {errors.position}
          </p>
        ) : null}
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
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
      {pending ? "Salvando..." : "Salvar seção"}
    </button>
  );
}
