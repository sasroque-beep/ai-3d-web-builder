interface SpinnerProps {
  label?: string;
  className?: string;
}

/** Inline loading indicator for pending actions (e.g. form submission). */
export function Spinner({
  label = "Carregando...",
  className = "",
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[var(--color-accent)]"
      />
      <span className="text-sm text-foreground/70">{label}</span>
    </span>
  );
}
