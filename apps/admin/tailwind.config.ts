import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ed5d0f',
          hover: '#c94b0b',
        },
        atg: {
          surface: '#0b0f1a',
          elevated: '#12182a',
          border: '#2a3348',
          muted: '#8b95a8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
