// Mostrado na hora ao trocar de página no painel, enquanto o servidor responde.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-5" aria-busy="true" aria-label="Carregando">
      <div className="h-9 w-2/3 rounded-xl bg-muted/60" />
      <div className="h-4 w-full max-w-xl rounded-lg bg-muted/40" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-36 rounded-3xl bg-muted/40" />
        <div className="h-36 rounded-3xl bg-muted/40" />
      </div>
      <div className="h-48 rounded-3xl bg-muted/30" />
    </div>
  );
}
