import type { Config } from 'tailwindcss';

/** Brand colours come from CSS variables that the app sets from the school's settings. */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: withAlpha('--brand'), dark: withAlpha('--brand-dark'), soft: withAlpha('--brand-soft') },
        accent: { DEFAULT: withAlpha('--accent'), soft: withAlpha('--accent-soft') },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
