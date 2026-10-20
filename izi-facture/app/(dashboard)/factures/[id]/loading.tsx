/**
 * Chargement de /factures/[id] (et /modifier).
 * Requis par Next 16 : la page lit le numéro de facture dans l'adresse (useParams),
 * ce fichier crée la zone <Suspense> qui l'entoure.
 */
export default function Loading() {
  return (
    <>
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="min-h-[40px] flex items-center">
          <div className="h-5 w-48 rounded-lg bg-slate-200/70 animate-pulse" />
        </div>
      </div>

      <main className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        <div className="h-24 bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] animate-pulse" />
        <div className="h-[560px] bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] animate-pulse" />
      </main>
    </>
  );
}
