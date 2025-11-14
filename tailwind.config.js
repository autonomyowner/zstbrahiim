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
      },
      animation: {
        'hero-scroll': 'hero-scroll 18s linear infinite',
      },
      colors: {
        // Updated brand system inspired by the new mockups
        brand: {
          primary: '#FACC15',
          primaryDark: '#EAB308',
          secondary: '#3B82F6',
          dark: '#181711',
          darkMuted: '#1F1C12',
          light: '#F8F8F5',
          card: '#FFFFFF',
          cardMuted: '#F1EFE5',
        },
        'brand-border': '#E2E0D7',
        text: {
          primary: '#181711',
          secondary: '#4A4739',
          muted: '#6B6B5A',
          inverted: '#F8F8F5',
        },
        accent: {
          lime: '#84CC16',
          blue: '#2563EB',
          pink: '#EC4899',
          red: '#EF4444',
          amber: '#FBBF24',
        },
        // Keep existing kitchen palette for legacy components while the redesign rolls out
        kitchen: {
          white: {
            clean: '#FFFFFF',
            soft: '#F0F0F0',
          },
          black: {
            deep: '#181711',
            soft: '#1F1C12',
          },
          marble: {
            gray: '#C9C5B5',
            'gray-light': '#E3E0D3',
          },
          warm: {
            light: '#FCF9F1',
            'light-soft': '#F7F1DE',
          },
          footer: {
            dark: '#1B1A14',
          },
          lux: {
            'dark-green': {
              50: '#f7f7f1',
              100: '#ece9d7',
              200: '#d6d0b2',
              300: '#bcb088',
              400: '#a08d5c',
              500: '#7f6f42',
              600: '#5f5332',
              700: '#453b24',
              800: '#2c2517',
              900: '#19150d',
              950: '#0f0c08',
            },
          },
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        elegant: ['Playfair Display', 'serif'],
        modern: ['Inter', 'sans-serif'],
        artistic: ['Great Vibes', 'cursive'],
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1.25rem',
        xl: '2rem',
        '2xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        'card-sm': '0 5px 20px rgba(24, 23, 17, 0.06)',
        'card-md': '0 10px 30px rgba(24, 23, 17, 0.08)',
        'card-lg': '0 20px 45px rgba(24, 23, 17, 0.1)',
      },
      backgroundImage: {
        'gradient-elegant': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'gradient-brand':
          'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(24, 23, 17, 0.6))',
      },
    },
  },
  plugins: [],
} 