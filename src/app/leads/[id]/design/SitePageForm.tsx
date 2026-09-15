"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertSitePageAction } from "@/modules/design/actions";
import {
  initialUpsertSitePageActionState,
  JOURNEY_STAGE_KEYS,
  JOURNEY_STAGE_LABELS,
} from "@/modules/design/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface SitePageFormProps {
  companyId: string;
}

export function SitePageForm({ companyId }: SitePageFormProps) {
  const [state, formAction] = useActionState(
    upsertSitePageAction,
    initialUpsertSitePageActionState,
  );

  const errors = state.status === "error" ? state.errors : {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">Adicionar/atualizar página</h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar a página"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar a página"
          description={state.reason}
        />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="slug">
          Identificador da página *
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder="Ex.: pagina-inicial"
          className={inputClassName}
          aria-invalid={Boolean(errors.slug)}
          aria-describedby={errors.slug ? "slug-error" : undefined}
        />
        <p className="text-xs text-foreground/50">
          Reenviar o mesmo identificador atualiza a página em vez de criar uma
          nova.
        </p>
        {errors.slug ? (
          <p id="slug-error" className={errorClassName}>
            {errors.slug}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="name">
          Nome da página *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={inputClassName}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name ? (
          <p id="name-error" className={errorClassName}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="objective">
          Objetivo da página
        </label>
        <textarea
          id="objective"
          name="objective"
          rows={2}
          className={inputClassName}
          aria-invalid={Boolean(errors.objective)}
          aria-describedby={errors.objective ? "objective-error" : undefined}
        />
        {errors.objective ? (
          <p id="objective-error" className={errorClassName}>
            {errors.objective}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="journeyStage">
          Etapa da jornada do cliente
        </label>
        <select
          id="journeyStage"
          name="journeyStage"
          defaultValue=""
          className={inputClassName}
          aria-invalid={Boolean(errors.journeyStage)}
          aria-describedby={
            errors.journeyStage ? "journeyStage-error" : undefined
          }
        >
          <option value="">Não definida</option>
          {JOURNEY_STAGE_KEYS.map((key) => (
            <option key={key} value={key}>
              {JOURNEY_STAGE_LABELS[key]}
            </option>
          ))}
        </select>
        {errors.journeyStage ? (
          <p id="journeyStage-error" className={errorClassName}>
            {errors.journeyStage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="position">
          Ordem na navegação
        </label>
        <input
          id="position"
          name="position"
          type="number"
          min={1}
          placeholder="Deixe em branco para adicionar ao final"
          className={inputClassName}
          aria-invalid={Boolean(errors.position)}
          aria-describedby={errors.position ? "position-error" : undefined}
        />
        {errors.position ? (
          <p id="position-error" className={errorClassName}>
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
      {pending ? "Salvando..." : "Salvar página"}
    </button>
  );
}
