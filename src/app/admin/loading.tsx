export default function AdminLoading() {
  return (
    <div aria-busy className="animate-pulse">
      <div className="h-3 w-24 bg-ink/10" />
      <div className="mt-4 h-12 w-80 max-w-full bg-ink/10" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 bg-ink/6" />
        ))}
      </div>
      <div className="mt-8 h-80 bg-ink/6" />
    </div>
  );
}
