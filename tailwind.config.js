/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'hero-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.25)' },
        },
        'slide-in-top': {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        'hero-scroll': 'hero-scroll 18s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-in-top': 'slide-in-top 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      colors: {
        // Luxe Gold & Super Black color system
        brand: {
          primary: '#C9A227',
          primaryLight: '#E8C547',
          primaryDark: '#9A7B1A',
          primarySoft: '#F7F0DC',
          primaryMuted: 'rgba(201, 162, 39, 0.15)',
          secondary: '#3B82F6',
          dark: '#050504',
          darkMuted: '#0A0908',
          black: '#000000',
          light: '#FDFCFA',
          card: '#FFFFFF',
          cardMuted: '#FAF9F7',
        },
        'brand-border': '#E8E4DD',
        'brand-border-subtle': '#F0EDE8',
        'brand-border-strong': '#D1CCC2',
        'brand-surface-muted': '#FAF9F7',
        text: {
          primary: '#1A1814',
          secondary: '#4A4640',
          muted: '#7A756B',
          inverted: '#FDFCFA',
        },
        accent: {
          success: '#2D7A4F',
          warning: '#C9860A',
          error: '#C23D3D',
          info: '#2563EB',
          lime: '#84CC16',
          pink: '#EC4899',
          amber: '#FBBF24',
        },
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
      },
      fontFamily: {
        elegant: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        modern: ['DM Sans', 'sans-serif'],
        display: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(26, 24, 20, 0.04)',
        'card-sm': '0 2px 8px rgba(26, 24, 20, 0.06)',
        'card-md': '0 4px 16px rgba(26, 24, 20, 0.08)',
        'card-lg': '0 8px 32px rgba(26, 24, 20, 0.1)',
        'card-xl': '0 16px 48px rgba(26, 24, 20, 0.12)',
        'glow': '0 0 24px rgba(212, 175, 55, 0.15)',
        'glow-lg': '0 0 40px rgba(212, 175, 55, 0.2)',
        'inner-sm': 'inset 0 1px 2px rgba(26, 24, 20, 0.06)',
      },
      backgroundImage: {
        'gradient-elegant': 'linear-gradient(145deg, var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(26, 24, 20, 0.05))',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
