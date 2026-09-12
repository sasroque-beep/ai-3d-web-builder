"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertEnrichmentFieldAction } from "@/modules/research/actions";
import {
  ENRICHMENT_FIELD_KEYS,
  ENRICHMENT_FIELD_LABELS,
  type EnrichmentFieldErrors,
  initialUpsertEnrichmentFieldActionState,
} from "@/modules/research/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar informação"}
    </button>
  );
}

interface EnrichmentFieldFormProps {
  companyId: string;
}

export function EnrichmentFieldForm({ companyId }: EnrichmentFieldFormProps) {
  const [state, formAction] = useActionState(
    upsertEnrichmentFieldAction,
    initialUpsertEnrichmentFieldActionState,
  );

  const errors: EnrichmentFieldErrors =
    state.status === "error" ? state.errors : {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">Registrar informação</h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar a informação"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="fieldKey">
          Informação *
        </label>
        <select
          id="fieldKey"
          name="fieldKey"
          required
          className={inputClassName}
          aria-invalid={Boolean(errors.fieldKey)}
          aria-describedby={errors.fieldKey ? "fieldKey-error" : undefined}
        >
          {ENRICHMENT_FIELD_KEYS.map((key) => (
            <option key={key} value={key}>
              {ENRICHMENT_FIELD_LABELS[key]}
            </option>
          ))}
        </select>
        {errors.fieldKey ? (
          <p id="fieldKey-error" className={errorClassName}>
            {errors.fieldKey}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="status">
          Status *
        </label>
        <select
          id="status"
          name="status"
          required
          defaultValue="unverified"
          className={inputClassName}
          aria-invalid={Boolean(errors.status)}
          aria-describedby={errors.status ? "status-error" : undefined}
        >
          <option value="confirmed">Confirmado</option>
          <option value="unverified">Não verificado</option>
          <option value="missing">Ausente</option>
        </select>
        {errors.status ? (
          <p id="status-error" className={errorClassName}>
            {errors.status}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="value">
          Valor encontrado
        </label>
        <textarea
          id="value"
          name="value"
          rows={3}
          className={inputClassName}
          aria-invalid={Boolean(errors.value)}
          aria-describedby={errors.value ? "value-error" : undefined}
        />
        {errors.value ? (
          <p id="value-error" className={errorClassName}>
            {errors.value}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="source">
          Fonte
        </label>
        <input
          id="source"
          name="source"
          type="text"
          placeholder="Ex.: Google Maps, Instagram, site oficial"
          className={inputClassName}
          aria-invalid={Boolean(errors.source)}
          aria-describedby={errors.source ? "source-error" : undefined}
        />
        {errors.source ? (
          <p id="source-error" className={errorClassName}>
            {errors.source}
          </p>
        ) : null}
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
