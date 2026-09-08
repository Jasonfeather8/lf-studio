import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#0a5c4e] hover:bg-[#07473b] dark:bg-primary-fixed dark:hover:bg-primary-fixed-dim text-white dark:text-neutral-900 shadow-md',
    secondary: 'bg-white dark:bg-neutral-900 border border-[#e6ebe9] dark:border-neutral-800 hover:bg-[#f4f7f6] dark:hover:bg-neutral-800 text-[#0a5c4e] dark:text-primary-fixed-dim',
    danger: 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    icon: 'p-2 rounded-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && (
        <span className={`flex items-center justify-center shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} [&>svg]:w-full [&>svg]:h-full`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
