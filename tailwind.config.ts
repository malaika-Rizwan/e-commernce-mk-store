import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primaryAccent: '#EBBB69',
        cardBg: '#E6E2DE',
        pageBg: '#BEB9B4',
        darkBase: '#49474D',
        primary: {
          DEFAULT: '#EBBB69',
          foreground: '#ffffff',
          hover: '#d9a85a',
        },
        secondary: {
          DEFAULT: '#E6E2DE',
          foreground: '#49474D',
        },
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        danger: {
          DEFAULT: '#b91c1c',
          foreground: '#ffffff',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ring: '#EBBB69',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgb(0 0 0 / 0.08), 0 10px 20px -2px rgb(0 0 0 / 0.05)',
        'soft-lg': '0 10px 40px -10px rgb(0 0 0 / 0.12), 0 2px 10px -2px rgb(0 0 0 / 0.06)',
        'card-hover': '0 20px 50px -12px rgb(0 0 0 / 0.15)',
        'nav': '0 4px 14px 0 rgb(0 0 0 / 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
