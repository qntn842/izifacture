import React from 'react';

export const authInputClassName =
  'w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

export function AuthField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-sm text-rose-700 font-medium"
    >
      {message}
    </div>
  );
}

/** Traduit les erreurs de Supabase Auth en messages clairs */
export function authErrorMessage(error: { message?: string; code?: string } | null): string {
  const message = error?.message?.toLowerCase() ?? '';
  const code = error?.code ?? '';
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return 'Un compte existe déjà avec cet email. Connectez-vous.';
  }
  if (code === 'weak_password' || message.includes('password should be')) {
    return 'Mot de passe trop faible : au moins 8 caractères.';
  }
  if (code === 'email_address_invalid' || message.includes('invalid email') || message.includes('is invalid')) {
    return 'Adresse email invalide.';
  }
  if (code === 'email_not_confirmed') {
    return 'Confirmez votre adresse email avant de vous connecter.';
  }
  if (code === 'over_email_send_rate_limit') {
    return "Trop d'emails envoyés récemment. Réessayez dans une heure.";
  }
  if (code === 'over_request_rate_limit' || message.includes('rate limit')) {
    return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
  }
  if (code === 'email_address_not_authorized' || message.includes('not authorized')) {
    return "Impossible d'envoyer l'email de confirmation à cette adresse pour le moment.";
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}
