import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ed5d0f',
          hover: '#c94b0b' // Darker shade for hover
        },
        secondary: {
          DEFAULT: '#199a45',
          hover: '#137a36'
        }
      }
    },
  },
  plugins: [],
};

export default config;
