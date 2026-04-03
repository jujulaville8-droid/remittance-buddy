import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'flex h-10 w-full rounded-sm border border-[hsl(var(--border))]',
        'bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium',
        'placeholder:text-[hsl(var(--muted-foreground))] placeholder:font-normal',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--coral))] focus-visible:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
