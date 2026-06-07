/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          teal: {
            DEFAULT: '#14b8a6', // Pale Teal
            dark: '#0d9488',
            light: '#99f6e4',
          },
          blue: {
            DEFAULT: '#3b82f6', // Soft Blue
            dark: '#2563eb',
            light: '#dbeafe',
          },
          green: {
            DEFAULT: '#15803d', // Medical Green
            dark: '#166534',
            light: '#dcfce7',
          },
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          900: '#0f172a',
          950: '#09090b',
        },
        status: {
          success: {
            fill: '#ecfdf5',
            border: '#10b981',
            text: '#065f46',
          },
          warning: {
            fill: '#fffbeb',
            border: '#f59e0b',
            text: '#92400e',
          },
          error: {
            fill: '#fef2f2',
            border: '#ef4444',
            text: '#991b1b',
          },
          info: {
            fill: '#f0f9ff',
            border: '#0284c7',
            text: '#075985',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        button: '6px',
      }
    },
  },
  plugins: [],
}
