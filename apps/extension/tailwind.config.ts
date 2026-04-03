import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'level-1': '0 1px 2px rgba(28,25,23,0.05)',
        'level-2': '0 4px 12px rgba(28,25,23,0.08)',
        'level-3': '0 8px 24px rgba(28,25,23,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
