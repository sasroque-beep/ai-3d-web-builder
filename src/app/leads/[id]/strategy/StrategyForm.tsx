"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertStrategyAction } from "@/modules/strategy/actions";
import {
  initialUpsertStrategyActionState,
  JOURNEY_FIELDS,
  type StrategyFieldErrors,
  type StrategyFormInput,
  type StrategyRecord,
} from "@/modules/strategy/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: keyof StrategyFormInput;
  label: string;
  errors: StrategyFieldErrors;
  defaultValue?: string | null;
  rows?: number;
}

function Field({ name, label, errors, defaultValue, rows = 3 }: FieldProps) {
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
        defaultValue={defaultValue ?? undefined}
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
      {pending ? "Salvando..." : "Salvar estratégia"}
    </button>
  );
}

interface StrategyFormProps {
  companyId: string;
  strategy: StrategyRecord | null;
}

export function StrategyForm({ companyId, strategy }: StrategyFormProps) {
  const [state, formAction] = useActionState(
    upsertStrategyAction,
    initialUpsertStrategyActionState,
  );

  const errors: StrategyFieldErrors =
    state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : undefined;

  function fieldValue(name: keyof StrategyFormInput): string | null {
    return values?.[name] ?? strategy?.[name] ?? null;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">
        {strategy ? "Atualizar estratégia" : "Criar estratégia"}
      </h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar a estratégia"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar a estratégia"
          description={state.reason}
        />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <Field
        name="marketingObjective"
        label="Objetivo de marketing"
        errors={errors}
        defaultValue={fieldValue("marketingObjective")}
      />
      <Field
        name="conversionObjective"
        label="Objetivo de conversão"
        errors={errors}
        defaultValue={fieldValue("conversionObjective")}
      />
      <Field
        name="targetAudience"
        label="Público-alvo"
        errors={errors}
        defaultValue={fieldValue("targetAudience")}
      />
      <Field
        name="painPoints"
        label="Dores do público (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("painPoints")}
      />
      <Field
        name="desires"
        label="Desejos do público (um por linha)"
        errors={errors}
        defaultValue={fieldValue("desires")}
      />
      <Field
        name="valueProposition"
        label="Proposta de valor"
        errors={errors}
        defaultValue={fieldValue("valueProposition")}
      />
      <Field
        name="differentiators"
        label="Diferenciais competitivos"
        errors={errors}
        defaultValue={fieldValue("differentiators")}
      />
      <Field
        name="objections"
        label="Principais objeções (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("objections")}
      />
      <Field
        name="salesArguments"
        label="Argumentos de venda (um por linha)"
        errors={errors}
        defaultValue={fieldValue("salesArguments")}
      />
      <Field
        name="communicationTone"
        label="Tom de comunicação"
        errors={errors}
        defaultValue={fieldValue("communicationTone")}
        rows={2}
      />
      <Field
        name="mainOffer"
        label="Oferta principal"
        errors={errors}
        defaultValue={fieldValue("mainOffer")}
      />
      <Field
        name="desiredConversionActions"
        label="Ações de conversão desejadas (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("desiredConversionActions")}
      />
      <Field
        name="ctas"
        label="CTAs principais (um por linha)"
        errors={errors}
        defaultValue={fieldValue("ctas")}
      />

      <fieldset className="flex flex-col gap-4 rounded-lg border border-white/10 px-4 py-4">
        <legend className="px-1 text-sm font-medium text-foreground/90">
          Jornada básica do cliente
        </legend>
        {JOURNEY_FIELDS.map(([name, label]) => (
          <Field
            key={name}
            name={name}
            label={label}
            errors={errors}
            defaultValue={fieldValue(name)}
            rows={2}
          />
        ))}
      </fieldset>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
