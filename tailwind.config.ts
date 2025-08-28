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
        // The Rollup Brand Colors
        'brand-blue': '#3264FF',
        'brand-orange': '#F59E0B', 
        'brand-red': '#EF4444',
        
        // Dark Mode (Default)
        'bg': '#0B0F1A',
        'bg-elev': '#111827',
        'ink': '#F3F6FF',
        'ink-muted': '#9CA3AF',
        'line': '#1F2937',
        'chip-stroke': '#E5E7EB',
        'input-bg': '#0E1526',
        'input-stroke': '#24304D',
        'cta-text': '#FFFFFF',
        
        // Light Mode
        'bg-light': '#F4F3EF',
        'bg-elev-light': '#FFFFFF',
        'ink-light': '#0B0F1A',
        'ink-muted-light': '#4B5563',
        'line-light': '#E5E7EB',
        'chip-stroke-light': '#111111',
      },
      fontFamily: {
        'sans': ['ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
        'geist-mono': ['Geist Mono', 'monospace'],
        'record-laser': ['Record Laser', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'base': '12px',
        'pill': '9999px', 
        'control': '10px',
        'sidebar-active': '14px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,.10)',
        'md': '0 8px 24px rgba(0,0,0,.16)',
        'pop': '0 8px 0 0 #0A0E1A inset',
        'newsletter-card': '0 10px 0 #0A0E1A',
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
      spacing: {
        '18': '4.5rem', // 72px
      },
    },
  },
  plugins: [],
}
export default config