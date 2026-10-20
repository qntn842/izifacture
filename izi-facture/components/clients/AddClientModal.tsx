'use client';

import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useData } from '@/lib/context/DataContext';
import { Client } from '@/types';

interface AddClientModalProps {
  onClose: () => void;
  onCreated?: (client: Client) => void;
}

const inputClassName =
  'w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

/**
 * Modal d'ajout d'un nouveau client.
 * À afficher conditionnellement : {open && <AddClientModal ... />} (le formulaire repart vide à chaque ouverture).
 */
export function AddClientModal({ onClose, onCreated }: AddClientModalProps) {
  const { addClient } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!name.trim()) {
      setError('Veuillez renseigner le nom du client.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const newClient = await addClient({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      onCreated?.(newClient);
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-6 space-y-5 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Ajouter un nouveau client
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Coordonnées professionnelles du client
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div
              role="alert"
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-sm text-rose-700 font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom complet ou Entreprise <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ivoire Consulting SARL"
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@ivoire-consulting.ci"
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Numéro de Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Adresse physique (Ville, Quartier, Pays)
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Cocody Angré 8e Tranche, Abidjan, Côte d'Ivoire"
              className={`${inputClassName} resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Enregistrer le client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
