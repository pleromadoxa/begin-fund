export default function Loading() {
  return (
    <main className="min-h-[100svh] bg-cream flex items-center justify-center px-5">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
        <p className="mt-5 text-[0.7rem] uppercase tracking-[0.28em] text-muted">Loading…</p>
      </div>
    </main>
  );
}
