"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { upsertSectionCopyAction } from "@/modules/copy/actions";
import {
  initialUpsertSectionCopyActionState,
  type SectionCopyFormInput,
} from "@/modules/copy/types";
import type { SectionPreviewCopy } from "@/modules/site-builder/types";
import { ErrorState } from "@/ui/states";

const inputClassName =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClassName = "text-sm font-medium text-foreground/90";
const errorClassName = "text-xs text-red-300";

interface FieldProps {
  name: keyof SectionCopyFormInput;
  label: string;
  defaultValue: string | null;
  errors: Partial<Record<keyof SectionCopyFormInput, string>>;
  rows?: number;
}

function Field({ name, label, defaultValue, errors, rows = 2 }: FieldProps) {
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

function SubmitButton({
  hasAttemptedSubmit,
}: {
  hasAttemptedSubmit: React.MutableRefObject<boolean>;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={() => {
        hasAttemptedSubmit.current = true;
      }}
      className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

interface SectionEditFormProps {
  sectionId: string;
  copy: SectionPreviewCopy | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function SectionEditForm({
  sectionId,
  copy,
  onSaved,
  onCancel,
}: SectionEditFormProps) {
  const [state, formAction] = useActionState(
    upsertSectionCopyAction,
    initialUpsertSectionCopyActionState,
  );
  const hasAttemptedSubmit = useRef(false);

  useEffect(() => {
    if (hasAttemptedSubmit.current && state.status === "idle") {
      hasAttemptedSubmit.current = false;
      onSaved();
    }
  }, [state, onSaved]);

  const errors = state.status === "error" ? state.errors : {};

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-white/10 p-4"
      noValidate
    >
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

      <input type="hidden" name="sectionId" value={sectionId} />
      {/*
        Preserved as-is: this form doesn't expose notes as an editable
        field (kept out of the Issue's field list), but must resend the
        existing value — omitting it would wipe it on every save, since
        the action upserts the whole record.
      */}
      <input type="hidden" name="notes" value={copy?.notes ?? ""} />

      <Field
        name="headline"
        label="Título/headline"
        defaultValue={copy?.headline ?? null}
        errors={errors}
      />
      <Field
        name="subheadline"
        label="Subtítulo ou texto de apoio"
        defaultValue={copy?.subheadline ?? null}
        errors={errors}
      />
      <Field
        name="body"
        label="Texto principal (corpo)"
        defaultValue={copy?.body ?? null}
        errors={errors}
        rows={3}
      />
      <Field
        name="ctaLabel"
        label="Texto do CTA exibido nessa seção"
        defaultValue={copy?.ctaLabel ?? null}
        errors={errors}
        rows={1}
      />
      <Field
        name="socialProofText"
        label="Prova social ou depoimento específico da seção"
        defaultValue={copy?.socialProofText ?? null}
        errors={errors}
      />

      <div className="flex gap-2">
        <SubmitButton hasAttemptedSubmit={hasAttemptedSubmit} />
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:border-white/30"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
