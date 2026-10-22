export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-muted">{children}</p>}
    </header>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="panel p-8 text-center text-muted">{children}</div>;
}
