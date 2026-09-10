export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
        Foundation
      </p>
      <h1 className="text-4xl font-bold sm:text-5xl">AI 3D Web Builder</h1>
      <p className="text-lg text-foreground/70">
        Initial project structure. Product modules are scaffolded under{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-base">src/</code>{" "}
        and will be implemented in dedicated issues.
      </p>
    </main>
  );
}
