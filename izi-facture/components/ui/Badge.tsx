import React from 'react';
import { InvoiceStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/utils/format';

interface BadgeProps {
  status: InvoiceStatus;
  isLate?: boolean;
  className?: string;
}

export function Badge({ status, isLate, className = '' }: BadgeProps) {
  // Si la facture est marquée ou détectée en retard, on applique le style "en_retard"
  const activeStatus: InvoiceStatus = isLate || status === 'en_retard' ? 'en_retard' : status;
  const config = STATUS_CONFIG[activeStatus] || STATUS_CONFIG.brouillon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
