/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        dark: {
          bg: '#0f1923',
          sidebar: '#1a2e3b',
          card: '#1f3447',
          border: '#2d4a5f',
        },
        water: {
          DEFAULT: '#00b4d8',
          dark: '#0096b4',
          light: '#48cae4',
          muted: '#7eb8cc',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a5f',
        },
      },
    },
  },
  plugins: [],
}
