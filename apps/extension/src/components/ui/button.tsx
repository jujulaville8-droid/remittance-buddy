import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
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
          'bg-[hsl(var(--coral))] text-white rounded-md shadow-level-1 hover:shadow-level-2 hover:brightness-105 focus-visible:ring-[hsl(var(--coral))]': variant === 'primary',
          'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-md shadow-level-1 hover:shadow-level-2 hover:bg-[hsl(var(--border))] focus-visible:ring-[hsl(var(--coral))]': variant === 'secondary',
          'text-[hsl(var(--foreground))] rounded-md hover:bg-[hsl(var(--muted))] focus-visible:ring-[hsl(var(--coral))]': variant === 'ghost',
          'bg-[hsl(var(--teal))] text-white rounded-md shadow-level-1 hover:shadow-level-2 hover:brightness-105 focus-visible:ring-[hsl(var(--teal))]': variant === 'accent',
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
