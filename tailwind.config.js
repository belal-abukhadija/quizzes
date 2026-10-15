/** @type {import('tailwindcss').Config} */

// The slate scale is re-pointed at the graphite neutrals of the shared
// Workbench design (src/styles/wb.css), so existing slate-* and dark:slate-*
// classes land on the same tones as Belal's other tools.
const graphite = {
  50: '#eceef0',
  100: '#e2e5e9',
  200: '#d6dade',
  300: '#c2c7cd',
  400: '#80868e',
  500: '#646a72',
  600: '#525860',
  700: '#31363c',
  800: '#262a2f',
  900: '#1d2024',
  950: '#141619',
};

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: graphite,
        accent: {
          DEFAULT: 'var(--wb-accent)',
          hover: 'var(--wb-accent-hover)',
          ink: 'var(--wb-accent-ink)',
          wash: 'var(--wb-accent-wash)',
        },
        ok: { DEFAULT: 'var(--wb-ok)', wash: 'var(--wb-ok-wash)' },
        danger: { DEFAULT: 'var(--wb-danger)', wash: 'var(--wb-danger-wash)' },
      },
      fontFamily: {
        sans: ['var(--wb-font)'],
      },
      maxWidth: {
        page: '44rem',
      },
    },
  },
  plugins: [],
};
