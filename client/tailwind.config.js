/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coordinated MediGuide Palette
        teal: {
          deep: '#075E54',
          DEFAULT: '#075E54',
        },
        forest: {
          deep: '#145747',
          dark: '#0B3D32',
          DEFAULT: '#145747',
        },
        emerald: {
          accent: '#159A76',
          DEFAULT: '#159A76',
        },
        mint: {
          soft: '#DDF3E9',
          DEFAULT: '#DDF3E9',
        },
        sage: {
          pale: '#EDF4EF',
          DEFAULT: '#EDF4EF',
        },
        charcoal: {
          dark: '#202824',
          secondary: '#596760',
          DEFAULT: '#202824',
        },
        border: {
          subtle: '#DCE6DF',
          DEFAULT: '#DCE6DF',
        },
        ivory: {
          warm: '#FAFAF7',
          DEFAULT: '#FAFAF7',
        },
        brand: {
          50: '#F0F9F5',
          100: '#DDF3E9', // Soft mint
          200: '#C2E8D7',
          300: '#92D5B7',
          400: '#4AB78F',
          500: '#159A76', // Fresh emerald accent
          600: '#145747', // Forest green
          700: '#075E54', // Deep teal
          800: '#0B3D32', // Dark evergreen
          900: '#052A22',
          950: '#021813',
        },
        warm: {
          25: '#FDFCF9',
          50: '#FAFAF7', // Warm white
          100: '#EDF4EF', // Pale sage
          200: '#DCE6DF', // Subtle borders
          300: '#CCD8D0',
          400: '#A4B5A9',
          500: '#7B8E81',
          600: '#596760', // Secondary text
          700: '#404C46',
          800: '#2C3430',
          900: '#202824', // Dark charcoal
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(32, 40, 36, 0.04)',
        'card': '0 2px 5px 0 rgba(32, 40, 36, 0.04), 0 1px 2px -1px rgba(32, 40, 36, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(7, 94, 84, 0.12), 0 3px 8px -2px rgba(7, 94, 84, 0.06)',
        'panel': '0 4px 20px -2px rgba(7, 94, 84, 0.08)',
        'brand': '0 4px 14px 0 rgba(21, 154, 118, 0.25)',
      }
    },
  },
  plugins: [],
}
