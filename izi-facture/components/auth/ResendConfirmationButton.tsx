'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { authErrorMessage } from '@/components/auth/AuthFields';

/** Renvoie l'email de confirmation d'inscription à l'adresse indiquée */
export function ResendConfirmationButton({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email.trim() || status === 'sending') return;
    setStatus('sending');
    setMessage(null);
    const { error } = await createClient().auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) {
      setStatus('error');
      setMessage(authErrorMessage(error));
      return;
    }
    setStatus('sent');
    setMessage('Email renvoyé. Pensez à vérifier vos spams.');
  };

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={handleResend}
        disabled={status === 'sending'}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${status === 'sending' ? 'animate-spin' : ''}`} />
        Renvoyer l&apos;email de confirmation
      </button>
      {message && (
        <p className={`text-xs mt-1.5 ${status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
