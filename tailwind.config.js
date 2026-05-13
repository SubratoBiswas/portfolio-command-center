/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0E0E0C',
          soft: '#1F1F1B',
          muted: '#6B6864',
          subtle: '#94918C',
        },
        paper: {
          DEFAULT: '#FAFAF7',
          raised: '#FFFFFF',
          sunken: '#F3F2EE',
        },
        line: {
          DEFAULT: '#E7E5E0',
          strong: '#D4D1CB',
          subtle: '#EFEDE8',
        },
        brand: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        warn: {
          DEFAULT: '#B45309',
          bg: '#FEF3C7',
        },
        crit: {
          DEFAULT: '#BE123C',
          bg: '#FFE4E6',
        },
        ok: {
          DEFAULT: '#047857',
          bg: '#D1FAE5',
        },
        info: {
          DEFAULT: '#4338CA',
          bg: '#E0E7FF',
        },
      },
      borderRadius: {
        xs: '3px',
        sm: '5px',
        md: '7px',
        lg: '10px',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(14,14,12,0.04), 0 1px 2px 0 rgba(14,14,12,0.05)',
        raised: '0 4px 12px -2px rgba(14,14,12,0.06), 0 2px 4px -2px rgba(14,14,12,0.04)',
        pop: '0 12px 28px -8px rgba(14,14,12,0.12), 0 4px 10px -4px rgba(14,14,12,0.08)',
      },
    },
  },
  plugins: [],
};
