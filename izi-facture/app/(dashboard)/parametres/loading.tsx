export default function Loading() {
  return (
    <>
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="min-h-[40px] flex items-center">
          <div className="h-5 w-32 rounded-lg bg-slate-200/70 animate-pulse" />
        </div>
      </div>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <div className="w-full lg:w-60 h-11 lg:h-44 rounded-xl bg-slate-200/50 animate-pulse" />
          <div className="flex-1 w-full max-w-3xl space-y-6">
            <div className="h-72 bg-surface rounded-2xl border border-slate-200/80 animate-pulse" />
            <div className="h-44 bg-surface rounded-2xl border border-slate-200/80 animate-pulse" />
          </div>
        </div>
      </main>
    </>
  );
}
