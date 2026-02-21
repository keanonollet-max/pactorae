/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)', /* Deep professional navy */
          foreground: 'var(--color-primary-foreground)' /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* Lighter navy */
          foreground: 'var(--color-secondary-foreground)' /* white */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* Warm copper */
          foreground: 'var(--color-accent-foreground)' /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* slate-100 */
          foreground: 'var(--color-muted-foreground)' /* slate-500 */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* Pure white */
          foreground: 'var(--color-card-foreground)' /* Rich charcoal */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white */
          foreground: 'var(--color-popover-foreground)' /* Rich charcoal */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* emerald-600 */
          foreground: 'var(--color-success-foreground)' /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* amber-600 */
          foreground: 'var(--color-warning-foreground)' /* white */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-600 */
          foreground: 'var(--color-error-foreground)' /* white */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-600 */
          foreground: 'var(--color-destructive-foreground)' /* white */
        }
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      fontFamily: {
        heading: ['Crimson Text', 'serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Nunito Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '1.2' }],
        'h2': ['1.875rem', { lineHeight: '1.25' }],
        'h3': ['1.5rem', { lineHeight: '1.3' }],
        'h4': ['1.25rem', { lineHeight: '1.4' }],
        'h5': ['1.125rem', { lineHeight: '1.5' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.4' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      maxWidth: {
        'prose': '70ch'
      },
      transitionDuration: {
        '250': '250ms'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        }
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      zIndex: {
        '100': '100',
        '200': '200',
        '300': '300'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ]
}