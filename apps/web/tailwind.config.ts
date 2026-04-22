import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        // Tool uses Inter everywhere (Wise-style). `display` = same
        // Inter at a heavier default weight so existing font-display
        // usages still visually feel like "headings" without carrying
        // the serif across every page.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Reserved for explicit editorial moments (Compare greeting italic).
        editorial: ['var(--font-heading)', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'level-1': '0 1px 2px rgba(28,25,23,0.05)',
        'level-2': '0 4px 12px rgba(28,25,23,0.08)',
        'level-3': '0 8px 24px rgba(28,25,23,0.12)',
        'level-4': '0 24px 48px -12px rgba(28,25,23,0.18)',
        'glow-coral': '0 16px 40px -12px hsla(221,83%,53%,0.45)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        coral: {
          DEFAULT: 'hsl(var(--coral))',
          light: 'hsl(var(--coral-light))',
        },
        teal: {
          DEFAULT: 'hsl(var(--teal))',
          light: 'hsl(var(--teal-light))',
        },
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          light: 'hsl(var(--gold-light))',
        },
      },
    },
  },
  plugins: [],
}

export default config
