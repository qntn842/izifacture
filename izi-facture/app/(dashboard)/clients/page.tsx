'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { useData } from '@/lib/context/DataContext';
import { Client } from '@/types';
import { formatFCFA, formatDateFR } from '@/lib/utils/format';
import {
  UserPlus,
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Plus,
  X,
  Building2,
  ArrowUpRight,
  Receipt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, invoices, updateClient, deleteClient } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Défilement horizontal du tableau (format téléphone)
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = tableScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollTable = (direction: 'left' | 'right') => {
    const el = tableScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  // Form states for Add / Edit
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Open add modal
  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (client: Client) => {
    setActionError(null);
    setEditingClient(client);
    setName(client.name || '');
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setAddress(client.address || '');
  };

  // Enregistrement en cours / erreur des fenêtres Modifier et Supprimer
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Submit Edit Client
  const handleSaveEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !name.trim() || isBusy) return;

    setIsBusy(true);
    setActionError(null);
    try {
      await updateClient(editingClient.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setEditingClient(null);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!clientToDelete || isBusy) return;

    setIsBusy(true);
    setActionError(null);
    try {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Overall totals
  const totalBilledAllClients = clients.reduce(
    (sum, c) => sum + (c.total_billed || 0),
    0
  );

  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-purple-600 to-pink-600',
    'from-cyan-600 to-blue-600',
  ];

  return (
    <>
      <Header
        title="Clients"
        subtitle="Répertoire, coordonnées et historique de facturation de vos clients"
        actions={
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            <span className="hidden sm:inline">Nouveau client</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total clients
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {clients.length}
            </div>
            <p className="text-xs text-slate-500 mt-2">Clients actifs enregistrés</p>
          </div>

          <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total cumulé facturé
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1 font-mono">
              {formatFCFA(totalBilledAllClients)}
            </div>
            <p className="text-xs text-slate-500 mt-2">Sur l'ensemble du portefeuille</p>
          </div>

          <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Factures émises
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {invoices.length}
            </div>
            <p className="text-xs text-slate-500 mt-2">Assignées aux clients actifs</p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client par nom, email, téléphone ou ville..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddModal}
            >
              Ajouter un client
            </Button>
          </div>
        </div>

        {/* Clients Table Container */}
        <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Format téléphone : barre de défilement horizontal */}
          <div className="md:hidden flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-surface">
            <span className="text-[11px] font-medium text-slate-500">
              Glissez pour voir toutes les colonnes
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => scrollTable('left')}
                disabled={!canScrollLeft}
                className="p-1.5 rounded-lg border border-slate-200/80 bg-surface text-slate-600 shadow-xs active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTable('right')}
                disabled={!canScrollRight}
                className="p-1.5 rounded-lg border border-slate-200/80 bg-surface text-slate-600 shadow-xs active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                aria-label="Défiler vers la droite"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={tableScrollRef}
            onScroll={updateScrollButtons}
            className="overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-3.5 px-5 sm:px-6">Client</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Adresse</th>
                  <th className="py-3.5 px-4 text-center">Factures</th>
                  <th className="py-3.5 px-4 text-right">Total facturé</th>
                  <th className="py-3.5 px-5 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, idx) => {
                    const clientInvoicesCount = invoices.filter(
                      (inv) => inv.client_id === client.id
                    ).length;
                    const clientTotalBilled = invoices
                      .filter((inv) => inv.client_id === client.id)
                      .reduce((sum, inv) => sum + (inv.total || 0), 0);

                    const gradient = colors[idx % colors.length];

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-default"
                      >
                        {/* Client Avatar & Name */}
                        <td className="py-4 px-5 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gradient} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {client.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {client.name}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Ajouté le {formatDateFR(client.created_at)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact (Email + Phone) */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                          <div className="space-y-0.5">
                            {client.email ? (
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{client.email}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pas d'email</span>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Address */}
                        <td className="py-4 px-4 text-xs text-slate-600 max-w-xs">
                          {client.address ? (
                            <div className="flex items-start gap-1.5 line-clamp-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>{client.address}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Invoices Count */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <FileText className="w-3 h-3" />
                            {clientInvoicesCount}
                          </span>
                        </td>

                        {/* Total Billed */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                            {formatFCFA(clientTotalBilled || client.total_billed || 0)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(client)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Modifier les coordonnées du client"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null);
                                setClientToDelete(client);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer ce client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Aucun client trouvé</h4>
                        <p className="text-xs text-slate-500">
                          {searchQuery
                            ? `Aucun client ne correspond à "${searchQuery}".`
                            : "Commencez par ajouter votre premier client pour émettre des factures."}
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<UserPlus className="w-4 h-4" />}
                          onClick={handleOpenAddModal}
                        >
                          Ajouter un client
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Ajouter un nouveau client */}
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}

      {/* Modal: Modifier un client existant */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingClient(null)}
          />
          <div className="relative bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-6 space-y-5 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Modifier les coordonnées
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingClient.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom complet ou Entreprise <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-surface border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {actionError && (
                <p role="alert" className="text-sm text-rose-600 font-medium">
                  {actionError}
                </p>
              )}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setEditingClient(null)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="md" loading={isBusy}>
                  Mettre à jour
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmation de suppression */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setClientToDelete(null)}
          />
          <div className="relative bg-surface rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Supprimer le client {clientToDelete.name} ?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement ce client de votre répertoire ? Ses factures sont conservées. Cette action est irréversible.
              </p>
            </div>

            {actionError && (
                <p role="alert" className="text-sm text-rose-600 font-medium">
                  {actionError}
                </p>
              )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setClientToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleConfirmDelete}
                loading={isBusy}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
