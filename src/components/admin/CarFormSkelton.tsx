export function CarFormSkeleton() {
  return (
    <div className="grid gap-7 animate-pulse">
      {/* Vehicle details */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="h-7 w-48 rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-100" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index}>
              <div className="mb-2 h-3 w-20 rounded bg-slate-200" />
              <div className="h-11 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
          <div className="h-28 w-full rounded-xl bg-slate-100" />
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="h-7 w-64 rounded-lg bg-slate-200" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>

      {/* Finance / service / condition */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="h-7 w-72 rounded-lg bg-slate-200" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index}>
              <div className="mb-2 h-3 w-28 rounded bg-slate-200" />
              <div className="h-11 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="h-7 w-24 rounded-lg bg-slate-200" />
        <div className="mt-6 h-48 rounded-3xl bg-slate-100" />
      </section>

      {/* Save bar */}
      <div className="h-16 rounded-2xl bg-slate-100" />
    </div>
  );
}
