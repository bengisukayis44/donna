export default function Loading() {
  return (
    <main aria-busy="true">
      <div className="aspect-[3/4] w-full animate-pulse bg-placeholder/60" />
      <div className="space-y-4 px-4 pt-4">
        <div className="h-6 w-24 rounded-full bg-sand" />
        <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-sand/70" />
        <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-sand/70" />
      </div>
    </main>
  );
}
