export function DashboardContentSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F7FA] px-5 py-8 lg:pl-[288px] lg:pr-9 lg:py-10" aria-busy="true" aria-label="Ładowanie zawartości">
      <div className="mx-auto max-w-[1450px] animate-pulse">
        <div className="h-4 w-28 rounded bg-black/[0.06]" />
        <div className="mt-3 h-9 w-64 max-w-full rounded-xl bg-black/[0.08]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-32 rounded-2xl border border-black/[0.05] bg-white" />
          ))}
        </div>
        <div className="mt-5 h-72 rounded-2xl border border-black/[0.05] bg-white" />
      </div>
    </div>
  );
}
