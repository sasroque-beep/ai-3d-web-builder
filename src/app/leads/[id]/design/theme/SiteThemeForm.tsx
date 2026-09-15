"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { upsertSiteThemeAction } from "@/modules/design/actions";
import {
  COLOR_MODE_KEYS,
  COLOR_MODE_LABELS,
  initialUpsertSiteThemeActionState,
  type SiteThemeFieldErrors,
  type SiteThemeFormInput,
  type SiteThemeRecord,
  SPACING_DENSITY_KEYS,
  SPACING_DENSITY_LABELS,
} from "@/modules/design/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: keyof SiteThemeFormInput;
  label: string;
  errors: SiteThemeFieldErrors;
  defaultValue?: string | null;
  rows?: number;
}

function Field({ name, label, errors, defaultValue, rows = 2 }: FieldProps) {
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
      {pending ? "Salvando..." : "Salvar tema"}
    </button>
  );
}

interface SiteThemeFormProps {
  companyId: string;
  theme: SiteThemeRecord | null;
}

export function SiteThemeForm({ companyId, theme }: SiteThemeFormProps) {
  const [state, formAction] = useActionState(
    upsertSiteThemeAction,
    initialUpsertSiteThemeActionState,
  );

  const errors: SiteThemeFieldErrors =
    state.status === "error" ? state.errors : {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">
        {theme ? "Atualizar tema" : "Criar tema"}
      </h2>

      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar o tema"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      {state.status === "ineligible" ? (
        <ErrorState
          title="Não é possível salvar o tema"
          description={state.reason}
        />
      ) : null}

      <input type="hidden" name="companyId" value={companyId} />

      <Field
        name="primaryColor"
        label="Cor primária"
        errors={errors}
        defaultValue={theme?.primaryColor ?? null}
        rows={1}
      />
      <Field
        name="secondaryColor"
        label="Cor secundária"
        errors={errors}
        defaultValue={theme?.secondaryColor ?? null}
        rows={1}
      />
      <Field
        name="accentColor"
        label="Cor de destaque"
        errors={errors}
        defaultValue={theme?.accentColor ?? null}
        rows={1}
      />
      <Field
        name="backgroundColor"
        label="Cor de fundo"
        errors={errors}
        defaultValue={theme?.backgroundColor ?? null}
        rows={1}
      />
      <Field
        name="headingFont"
        label="Fonte principal (títulos)"
        errors={errors}
        defaultValue={theme?.headingFont ?? null}
        rows={1}
      />
      <Field
        name="bodyFont"
        label="Fonte de apoio (corpo de texto)"
        errors={errors}
        defaultValue={theme?.bodyFont ?? null}
        rows={1}
      />
      <Field
        name="visualStyle"
        label="Tom/estilo visual"
        errors={errors}
        defaultValue={theme?.visualStyle ?? null}
      />

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="colorModePreference">
          Preferência de modo de cor
        </label>
        <select
          id="colorModePreference"
          name="colorModePreference"
          defaultValue={theme?.colorModePreference ?? ""}
          className={inputClassName}
          aria-invalid={Boolean(errors.colorModePreference)}
          aria-describedby={
            errors.colorModePreference ? "colorModePreference-error" : undefined
          }
        >
          <option value="">Não definida</option>
          {COLOR_MODE_KEYS.map((key) => (
            <option key={key} value={key}>
              {COLOR_MODE_LABELS[key]}
            </option>
          ))}
        </select>
        {errors.colorModePreference ? (
          <p id="colorModePreference-error" className={errorClassName}>
            {errors.colorModePreference}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="spacingDensity">
          Densidade de espaçamento
        </label>
        <select
          id="spacingDensity"
          name="spacingDensity"
          defaultValue={theme?.spacingDensity ?? ""}
          className={inputClassName}
          aria-invalid={Boolean(errors.spacingDensity)}
          aria-describedby={
            errors.spacingDensity ? "spacingDensity-error" : undefined
          }
        >
          <option value="">Não definida</option>
          {SPACING_DENSITY_KEYS.map((key) => (
            <option key={key} value={key}>
              {SPACING_DENSITY_LABELS[key]}
            </option>
          ))}
        </select>
        {errors.spacingDensity ? (
          <p id="spacingDensity-error" className={errorClassName}>
            {errors.spacingDensity}
          </p>
        ) : null}
      </div>

      <Field
        name="ctaVisualGuidelines"
        label="Diretrizes visuais do CTA principal"
        errors={errors}
        defaultValue={theme?.ctaVisualGuidelines ?? null}
      />
      <Field
        name="visualReferences"
        label="Referências visuais/inspirações"
        errors={errors}
        defaultValue={theme?.visualReferences ?? null}
      />
      <Field
        name="accessibilityRequirements"
        label="Requisitos específicos de acessibilidade"
        errors={errors}
        defaultValue={theme?.accessibilityRequirements ?? null}
      />
      <Field
        name="notes"
        label="Observações gerais de design"
        errors={errors}
        defaultValue={theme?.notes ?? null}
      />

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
