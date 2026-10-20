'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthError, AuthField, authErrorMessage, authInputClassName } from '@/components/auth/AuthFields';
import { createClient } from '@/lib/supabase/client';
import { ResendConfirmationButton } from '@/components/auth/ResendConfirmationButton';

export default function ConnexionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnconfirmed(false);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(authErrorMessage(signInError));
      setIsUnconfirmed(signInError.code === 'email_not_confirmed');
      setIsSubmitting(false);
      return;
    }

    // Retour à la page demandée avant la connexion (ajoutée par proxy.ts), sinon le tableau de bord
    const suite = new URLSearchParams(window.location.search).get('suite');
    const destination = suite && suite.startsWith('/') && !suite.startsWith('//') ? suite : '/tableau-de-bord';
    window.location.assign(destination);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Connexion</h1>
        <p className="text-sm text-slate-500 mt-1">Accédez à votre espace de facturation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message si l'utilisateur arrive d'un lien de confirmation expiré */}
        <Suspense fallback={null}>
          <LinkErrorNotice />
        </Suspense>
        <AuthError message={error} />
        {isUnconfirmed && <ResendConfirmationButton email={email} />}

        <AuthField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@entreprise.ci"
            className={authInputClassName}
          />
        </AuthField>

        <AuthField label="Mot de passe" htmlFor="password">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className={`${authInputClassName} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </AuthField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={isSubmitting}
          icon={<LogIn className="w-4 h-4" />}
        >
          Se connecter
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6 pt-5 border-t border-slate-100">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-semibold text-blue-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}

/**
 * Messages liés au lien de confirmation par email (?confirme=1 ou ?erreur=lien).
 * Dans un Suspense : exigence de Next 16 pour useSearchParams.
 */
function LinkErrorNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get('confirme') === '1') {
    return (
      <div
        role="status"
        className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-sm text-emerald-700 font-medium"
      >
        Votre adresse email est confirmée. Connectez-vous pour accéder à votre espace.
      </div>
    );
  }
  if (searchParams.get('erreur') !== 'lien') return null;
  return (
    <AuthError message="Ce lien de confirmation a expiré ou a déjà été utilisé. Connectez-vous, ou demandez un nouvel email." />
  );
}
