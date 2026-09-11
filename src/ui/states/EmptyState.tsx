import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shown when a collection has no items yet, with a clear next action. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-white/10 px-6 py-12 text-center">
      <p className="text-lg font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-foreground/70">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
