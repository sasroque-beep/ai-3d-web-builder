"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertDiagnosisAction } from "@/modules/research/diagnosis/actions";
import {
  DIGITAL_MATURITY_LABELS,
  DIGITAL_MATURITY_LEVELS,
  type DiagnosisFieldErrors,
  type DiagnosisRecord,
  initialUpsertDiagnosisActionState,
} from "@/modules/research/diagnosis/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: string;
  label: string;
  errors: DiagnosisFieldErrors;
  defaultValue?: string | null;
}

function Field({ name, label, errors, defaultValue }: FieldProps) {
  const error = errors[name as keyof DiagnosisFieldErrors];
  const describedBy = error ? `${name}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue ?? undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        rows={3}
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
      {pending ? "Salvando..." : "Salvar diagnóstico"}
    </button>
  );
}

interface DiagnosisFormProps {
  companyId: string;
  diagnosis: DiagnosisRecord | null;
}

export function DiagnosisForm({ companyId, diagnosis }: DiagnosisFormProps) {
  const [state, formAction] = useActionState(
    upsertDiagnosisAction,
    initialUpsertDiagnosisActionState,
  );

  const errors: DiagnosisFieldErrors =
    state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">
        {diagnosis ? "Atualizar diagnóstico" : "Criar diagnóstico"}
      </h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar o diagnóstico"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar o diagnóstico"
          description={state.reason}
        />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <Field
        name="summary"
        label="Resumo do negócio"
        errors={errors}
        defaultValue={values?.summary ?? diagnosis?.summary}
      />
      <Field
        name="niche"
        label="Nicho"
        errors={errors}
        defaultValue={values?.niche ?? diagnosis?.niche}
      />
      <Field
        name="valueProposition"
        label="Proposta de valor"
        errors={errors}
        defaultValue={values?.valueProposition ?? diagnosis?.valueProposition}
      />
      <Field
        name="differentiators"
        label="Diferenciais competitivos"
        errors={errors}
        defaultValue={values?.differentiators ?? diagnosis?.differentiators}
      />
      <Field
        name="strengths"
        label="Pontos fortes (um por linha)"
        errors={errors}
        defaultValue={values?.strengths ?? diagnosis?.strengths}
      />
      <Field
        name="weaknesses"
        label="Pontos fracos (um por linha)"
        errors={errors}
        defaultValue={values?.weaknesses ?? diagnosis?.weaknesses}
      />
      <Field
        name="opportunities"
        label="Oportunidades (uma por linha)"
        errors={errors}
        defaultValue={values?.opportunities ?? diagnosis?.opportunities}
      />
      <Field
        name="risksOrGaps"
        label="Riscos ou lacunas (um por linha)"
        errors={errors}
        defaultValue={values?.risksOrGaps ?? diagnosis?.risksOrGaps}
      />
      <Field
        name="marketingOpportunities"
        label="Oportunidades de marketing"
        errors={errors}
        defaultValue={
          values?.marketingOpportunities ?? diagnosis?.marketingOpportunities
        }
      />
      <Field
        name="conversionOpportunities"
        label="Oportunidades de conversão"
        errors={errors}
        defaultValue={
          values?.conversionOpportunities ?? diagnosis?.conversionOpportunities
        }
      />

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="digitalMaturity">
          Maturidade digital
        </label>
        <select
          id="digitalMaturity"
          name="digitalMaturity"
          defaultValue={
            values?.digitalMaturity ?? diagnosis?.digitalMaturity ?? ""
          }
          className={inputClassName}
          aria-invalid={Boolean(errors.digitalMaturity)}
          aria-describedby={
            errors.digitalMaturity ? "digitalMaturity-error" : undefined
          }
        >
          <option value="">Não avaliado</option>
          {DIGITAL_MATURITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {DIGITAL_MATURITY_LABELS[level]}
            </option>
          ))}
        </select>
        {errors.digitalMaturity ? (
          <p id="digitalMaturity-error" className={errorClassName}>
            {errors.digitalMaturity}
          </p>
        ) : null}
      </div>

      <Field
        name="recommendations"
        label="Recomendações iniciais (uma por linha)"
        errors={errors}
        defaultValue={values?.recommendations ?? diagnosis?.recommendations}
      />

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
