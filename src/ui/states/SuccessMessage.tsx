interface SuccessMessageProps {
  title: string;
  description?: string;
}

/** Confirmation feedback shown after a successful action. */
export function SuccessMessage({ title, description }: SuccessMessageProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-sm"
    >
      <p className="font-medium text-emerald-300">{title}</p>
      {description ? (
        <p className="text-emerald-200/80">{description}</p>
      ) : null}
    </div>
  );
}
