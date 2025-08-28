/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          start: 'var(--color-primary-start)',
          end: 'var(--color-primary-end)',
        },
        cta: 'var(--color-cta)',
        'text-primary': 'var(--color-text-primary)',
        'bg-light': 'var(--color-bg-light)',
        'accent-light': 'var(--color-accent-light)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'Roboto', 'Open Sans', 'sans-serif'],
        secondary: ['Wix Madefor Text', 'Inter', 'Roboto', 'Open Sans', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.75rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '96': '24rem',
      },
      animation: {
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
    },
  },
  plugins: [],
}

