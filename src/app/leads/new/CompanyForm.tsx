"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createCompanyAction } from "@/modules/crm/actions";
import type { FieldErrors } from "@/modules/crm/types";
import { initialCreateCompanyActionState } from "@/modules/crm/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: string;
  label: string;
  errors: FieldErrors;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
}

function Field({
  name,
  label,
  errors,
  defaultValue,
  required,
  type = "text",
  textarea,
}: FieldProps) {
  const error = errors[name as keyof FieldErrors];
  const describedBy = error ? `${name}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label className={labelClassName} htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          rows={3}
          className={inputClassName}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={inputClassName}
        />
      )}
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
      {pending ? "Salvando..." : "Salvar empresa"}
    </button>
  );
}

export function CompanyForm() {
  const [state, formAction] = useActionState(
    createCompanyAction,
    initialCreateCompanyActionState,
  );

  const errors = state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {state.status === "error" ? (
        <ErrorState
          title="Não foi possível salvar a empresa"
          description="Corrija os campos destacados abaixo e tente novamente."
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="name"
          label="Nome da empresa"
          errors={errors}
          defaultValue={values?.name}
          required
        />
        <Field
          name="segment"
          label="Segmento/nicho"
          errors={errors}
          defaultValue={values?.segment}
          required
        />

        <div className="flex flex-col gap-1">
          <label className={labelClassName} htmlFor="relationshipType">
            Relação com a agência *
          </label>
          <select
            id="relationshipType"
            name="relationshipType"
            defaultValue={values?.relationshipType ?? "lead"}
            required
            className={inputClassName}
            aria-invalid={Boolean(errors.relationshipType)}
            aria-describedby={
              errors.relationshipType ? "relationshipType-error" : undefined
            }
          >
            <option value="lead">Lead (prospecção)</option>
            <option value="client">Cliente</option>
          </select>
          {errors.relationshipType ? (
            <p id="relationshipType-error" className={errorClassName}>
              {errors.relationshipType}
            </p>
          ) : null}
        </div>

        <Field
          name="city"
          label="Cidade"
          errors={errors}
          defaultValue={values?.city}
        />
        <Field
          name="state"
          label="UF"
          errors={errors}
          defaultValue={values?.state}
        />
        <Field
          name="website"
          label="Site atual"
          type="url"
          errors={errors}
          defaultValue={values?.website}
        />
        <Field
          name="socialMedia"
          label="Instagram ou rede social principal"
          errors={errors}
          defaultValue={values?.socialMedia}
        />
        <Field
          name="phone"
          label="Telefone/WhatsApp"
          errors={errors}
          defaultValue={values?.phone}
        />
        <Field
          name="email"
          label="E-mail"
          type="email"
          errors={errors}
          defaultValue={values?.email}
        />
      </div>

      <Field
        name="address"
        label="Endereço"
        errors={errors}
        defaultValue={values?.address}
      />
      <Field
        name="description"
        label="Descrição do negócio"
        errors={errors}
        defaultValue={values?.description}
        textarea
      />
      <Field
        name="mainProducts"
        label="Produtos ou serviços principais"
        errors={errors}
        defaultValue={values?.mainProducts}
        textarea
      />
      <Field
        name="targetAudience"
        label="Público-alvo"
        errors={errors}
        defaultValue={values?.targetAudience}
        textarea
      />
      <Field
        name="mainGoal"
        label="Objetivo principal do projeto"
        errors={errors}
        defaultValue={values?.mainGoal}
        textarea
      />
      <Field
        name="notes"
        label="Observações adicionais"
        errors={errors}
        defaultValue={values?.notes}
        textarea
      />

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
