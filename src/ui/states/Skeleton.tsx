interface SkeletonProps {
  className?: string;
}

/** Content placeholder shown while data is loading. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-white/10 ${className}`}
    />
  );
}
