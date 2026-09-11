import type { ReactNode } from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shown when an operation fails, with an accessible alert and recovery action. */
export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm"
    >
      <p className="font-medium text-red-300">{title}</p>
      {description ? <p className="text-red-200/80">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
