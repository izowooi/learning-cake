import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pending: '#9CA3AF',
        'in-progress': '#3B82F6',
        completed: '#22C55E',
        vacation: '#EAB308',
      },
    },
  },
  plugins: [],
};

export default config;
