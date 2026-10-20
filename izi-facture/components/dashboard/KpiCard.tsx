import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  };
  iconBgColor?: string;
  iconColor?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
}: KpiCardProps) {
  const badgeStyles = {
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
  }[badge?.variant || 'neutral'];

  return (
    <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] p-5 hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {value}
          </div>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor} shadow-2xs`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] border ${badgeStyles}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
