import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#006145',
        'brand-light-green': '#096',
        'brand-red': '#e7000b',
        'brand-purple': '#615fff',
        'brand-yellow': '#ffe020',
        'grey': '#262626',
      },
      fontFamily: {
        'geist-mono': ['Geist Mono', 'monospace'],
        'record-laser': ['Record Laser', 'Arial', 'sans-serif'],
      },
      animation: {
        'scroll': 'scroll 50s linear infinite',
        'marquee': 'marquee-scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - 3rem))' }
        },
        'marquee-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config