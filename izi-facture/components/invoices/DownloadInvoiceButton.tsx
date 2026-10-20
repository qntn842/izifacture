'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { downloadInvoicePdf } from '@/lib/utils/invoice-pdf';
import { CompanySettings, Invoice } from '@/types';

interface DownloadInvoiceButtonProps {
  invoice: Invoice;
  company: CompanySettings;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  className?: string;
  /** Texte du bouton ; sur téléphone, `compactLabel` le remplace s'il est fourni */
  label?: string;
  compactLabel?: string;
}

/** Bouton qui télécharge la facture en PDF (A4). */
export function DownloadInvoiceButton({
  invoice,
  company,
  variant = 'secondary',
  size = 'md',
  className = '',
  label = 'Télécharger',
  compactLabel,
}: DownloadInvoiceButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoice, company);
    } catch (e) {
      console.error('Erreur génération PDF', e);
      alert('Le téléchargement a échoué. Veuillez réessayer.');
    } finally {
      setIsDownloading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
      icon={
        isDownloading ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <Download className={iconSize} />
        )
      }
    >
      {isDownloading ? (
        'Génération…'
      ) : compactLabel ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{compactLabel}</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}
