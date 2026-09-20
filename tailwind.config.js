/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  /**
   * `class` et non `media` : le thème suit le système par défaut, mais
   * l'utilisateur peut le forcer depuis la barre du haut. Avec `media`, ce
   * choix serait impossible. C'est `ThemeProvider` qui pose la classe `dark`.
   */
  darkMode: 'class',

  theme: {
    extend: {
      /**
       * Les couleurs pointent vers les variables de `global.css`, jamais vers
       * un hexadécimal. Le format `rgb(... / <alpha-value>)` est ce qui rend
       * `bg-primary/10` fonctionnel : Tailwind injecte l'opacité à la place du
       * marqueur. Avec `var(--x)` seul, toutes les variantes `/10` seraient
       * inertes.
       */
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--color-surface-raised) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',

        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',

        border: 'rgb(var(--color-border) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',

        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
          soft: 'rgb(var(--color-primary-soft) / <alpha-value>)',
        },

        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          soft: 'rgb(var(--color-success-soft) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          soft: 'rgb(var(--color-warning-soft) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          hover: 'rgb(var(--color-danger-hover) / <alpha-value>)',
          soft: 'rgb(var(--color-danger-soft) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          soft: 'rgb(var(--color-info-soft) / <alpha-value>)',
        },

        /** Séries de graphiques — voir l'avertissement dans `global.css`. */
        chart: {
          1: 'rgb(var(--color-chart-1) / <alpha-value>)',
          2: 'rgb(var(--color-chart-2) / <alpha-value>)',
          3: 'rgb(var(--color-chart-3) / <alpha-value>)',
          4: 'rgb(var(--color-chart-4) / <alpha-value>)',
          5: 'rgb(var(--color-chart-5) / <alpha-value>)',
          6: 'rgb(var(--color-chart-6) / <alpha-value>)',
          7: 'rgb(var(--color-chart-7) / <alpha-value>)',
          8: 'rgb(var(--color-chart-8) / <alpha-value>)',
        },
      },

      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },

      /** Gabarit de l'application : utilisé par `AppLayout` et `Sidebar`. */
      spacing: {
        sidebar: '16rem',
        'sidebar-collapsed': '4.5rem',
        topbar: '3.5rem',
      },

      borderRadius: {
        card: '0.75rem',
      },

      /**
       * Ombres discrètes : une carte se détache par son trait (`border`), pas
       * par une ombre portée — qui, sur fond sombre, ne se voit de toute façon
       * pas.
       */
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        popover: '0 10px 30px -12px rgb(0 0 0 / 0.25)',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 150ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
      },
    },
  },

  plugins: [],
};
