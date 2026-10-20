import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-3 rounded-xl gap-2.5 font-medium',
  }[size];

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-brand-hover active:bg-brand-active text-white shadow-xs hover:shadow-sm border border-transparent focus:ring-2 focus:ring-blue-500/20',
    secondary:
      'bg-surface hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-slate-300 focus:ring-2 focus:ring-slate-400/20',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-200 focus:ring-2 focus:ring-slate-300',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus:ring-2 focus:ring-rose-400/20',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
