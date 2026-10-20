'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, MailCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthError, AuthField, authErrorMessage, authInputClassName } from '@/components/auth/AuthFields';
import { ResendConfirmationButton } from '@/components/auth/ResendConfirmationButton';
import { createClient } from '@/lib/supabase/client';

const MIN_PASSWORD_LENGTH = 8;

export default function InscriptionPage() {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Lus par la base à l'inscription : création automatique de l'entreprise
        data: { company_name: companyName.trim(), full_name: fullName.trim() },
        // Page d'arrivée du lien de confirmation reçu par email
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (signUpError) {
      setError(authErrorMessage(signUpError));
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      // Confirmation par email activée dans Supabase
      setNeedsConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    window.location.assign('/tableau-de-bord');
  };

  if (needsConfirmation) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <MailCheck className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-5">Vérifiez votre email</h1>
        <p className="text-sm text-slate-500 mt-2">
          Un lien de confirmation a été envoyé à <span className="font-semibold text-slate-700">{email}</span>.
          Cliquez dessus pour activer votre compte.
        </p>
        <p className="text-xs text-slate-400 mt-3">Pensez à regarder dans vos spams.</p>
        <div className="mt-6 pt-5 border-t border-slate-100">
          <ResendConfirmationButton email={email} />
        </div>
        <Link
          href="/connexion"
          className="inline-block mt-6 text-sm font-semibold text-blue-600 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Créer un compte</h1>
        <p className="text-sm text-slate-500 mt-1">Commencez à facturer en FCFA en quelques minutes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />

        <AuthField label="Nom de l'entreprise" htmlFor="company" hint="Modifiable ensuite dans les Paramètres">
          <input
            id="company"
            type="text"
            autoComplete="organization"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ex : Studio Créatif Horizon"
            className={authInputClassName}
          />
        </AuthField>

        <AuthField label="Votre nom" htmlFor="fullname">
          <input
            id="fullname"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ex : Amadou Diallo"
            className={authInputClassName}
          />
        </AuthField>

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

        <AuthField label="Mot de passe" htmlFor="password" hint={`Au moins ${MIN_PASSWORD_LENGTH} caractères`}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choisissez un mot de passe"
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
          icon={<UserPlus className="w-4 h-4" />}
        >
          Créer mon compte
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6 pt-5 border-t border-slate-100">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
