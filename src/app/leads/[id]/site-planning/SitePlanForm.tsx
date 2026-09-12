"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertSitePlanAction } from "@/modules/site-planning/actions";
import {
  initialUpsertSitePlanActionState,
  type SitePlanFieldErrors,
  type SitePlanFormInput,
  type SitePlanRecord,
} from "@/modules/site-planning/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: keyof SitePlanFormInput;
  label: string;
  errors: SitePlanFieldErrors;
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
      {pending ? "Salvando..." : "Salvar planejamento"}
    </button>
  );
}

interface SitePlanFormProps {
  companyId: string;
  sitePlan: SitePlanRecord | null;
}

export function SitePlanForm({ companyId, sitePlan }: SitePlanFormProps) {
  const [state, formAction] = useActionState(
    upsertSitePlanAction,
    initialUpsertSitePlanActionState,
  );

  const errors: SitePlanFieldErrors =
    state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : undefined;

  function fieldValue(name: keyof SitePlanFormInput): string | null {
    return values?.[name] ?? sitePlan?.[name] ?? null;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">
        {sitePlan ? "Atualizar planejamento" : "Criar planejamento"}
      </h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar o planejamento"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar o planejamento"
          description={state.reason}
        />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <Field
        name="mainGoal"
        label="Objetivo principal do site"
        errors={errors}
        defaultValue={fieldValue("mainGoal")}
      />
      <Field
        name="conversionGoal"
        label="Objetivo principal de conversão"
        errors={errors}
        defaultValue={fieldValue("conversionGoal")}
      />
      <Field
        name="priorityAudience"
        label="Público prioritário"
        errors={errors}
        defaultValue={fieldValue("priorityAudience")}
      />
      <Field
        name="siteValueProposition"
        label="Proposta de valor aplicada ao site"
        errors={errors}
        defaultValue={fieldValue("siteValueProposition")}
      />
      <Field
        name="featuredOffer"
        label="Oferta/produto/serviço principal"
        errors={errors}
        defaultValue={fieldValue("featuredOffer")}
      />
      <Field
        name="primaryCta"
        label="CTA principal"
        errors={errors}
        defaultValue={fieldValue("primaryCta")}
        rows={2}
      />
      <Field
        name="secondaryCtas"
        label="CTAs secundários (um por linha)"
        errors={errors}
        defaultValue={fieldValue("secondaryCtas")}
      />
      <Field
        name="communicationPriorities"
        label="Prioridades de comunicação (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("communicationPriorities")}
      />
      <Field
        name="objectionsToAddress"
        label="Objeções que o site deverá responder (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("objectionsToAddress")}
      />
      <Field
        name="socialProofNeeded"
        label="Provas sociais necessárias (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("socialProofNeeded")}
      />
      <Field
        name="trustElements"
        label="Elementos de confiança (um por linha)"
        errors={errors}
        defaultValue={fieldValue("trustElements")}
      />
      <Field
        name="requiredFeatures"
        label="Funcionalidades necessárias (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("requiredFeatures")}
      />
      <Field
        name="requiredIntegrations"
        label="Integrações desejadas (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("requiredIntegrations")}
      />
      <Field
        name="leadCaptureRequirements"
        label="Requisitos de captação de leads"
        errors={errors}
        defaultValue={fieldValue("leadCaptureRequirements")}
      />
      <Field
        name="contactRequirements"
        label="Requisitos de contato"
        errors={errors}
        defaultValue={fieldValue("contactRequirements")}
      />
      <Field
        name="conversionRequirements"
        label="Requisitos de conversão"
        errors={errors}
        defaultValue={fieldValue("conversionRequirements")}
      />
      <Field
        name="contentRequirements"
        label="Requisitos de conteúdo"
        errors={errors}
        defaultValue={fieldValue("contentRequirements")}
      />
      <Field
        name="visualRequirements"
        label="Requisitos visuais"
        errors={errors}
        defaultValue={fieldValue("visualRequirements")}
      />
      <Field
        name="experience3dOpportunities"
        label="Oportunidades de experiência 3D"
        errors={errors}
        defaultValue={fieldValue("experience3dOpportunities")}
      />
      <Field
        name="journeyStagesToSupport"
        label="Etapas da jornada do cliente que o site deverá apoiar (uma por linha)"
        errors={errors}
        defaultValue={fieldValue("journeyStagesToSupport")}
      />
      <Field
        name="strategicNotes"
        label="Observações estratégicas"
        errors={errors}
        defaultValue={fieldValue("strategicNotes")}
      />

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
