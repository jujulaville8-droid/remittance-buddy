import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        'active:scale-[0.96]',
        {
          'bg-[hsl(var(--coral))] text-white rounded-2xl shadow-md shadow-[hsla(var(--coral),0.25)] hover:shadow-lg hover:shadow-[hsla(var(--coral),0.35)] hover:brightness-105 focus-visible:ring-[hsl(var(--coral))]': variant === 'primary',
          'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-2xl hover:bg-[hsl(var(--border))] focus-visible:ring-[hsl(var(--coral))]': variant === 'secondary',
          'text-[hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--muted))] focus-visible:ring-[hsl(var(--coral))]': variant === 'ghost',
        },
        {
          'h-8 px-4 text-xs': size === 'sm',
          'h-10 px-5 text-sm': size === 'md',
          'h-12 px-7 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
