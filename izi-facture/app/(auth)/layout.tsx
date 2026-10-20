import React from 'react';

/** Mise en page des pages publiques (connexion, inscription) : carte centrée avec le logo */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-page px-4 py-10">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <span className="font-extrabold text-sm tracking-tight">IF</span>
        </div>
        <div>
          <span className="font-bold text-slate-900 text-lg tracking-tight leading-none block">
            IZI FACTURE
          </span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">
            Édition Afrique
          </span>
        </div>
      </div>

      <div className="w-full max-w-md bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        {children}
      </div>

      <p className="text-[11px] text-slate-400 mt-6 text-center">
        Facturation simple en FCFA pour les entrepreneurs africains
      </p>
    </div>
  );
}
