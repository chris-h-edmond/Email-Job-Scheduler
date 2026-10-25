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
          DEFAULT: '#00A844',
          50: '#E6F4EA',
          100: '#CCEBDA',
          500: '#00A844',
          600: '#00963D',
        },
        scheduled: {
          bg: '#FFEBDB',
          border: '#F4A261',
          text: '#C2410C',
        },
        sent: {
          bg: '#F1F3F2',
          border: '#E5E7EB',
          text: '#374151',
        },
        failed: {
          bg: '#FEE2E2',
          border: '#FCA5A5',
          text: '#B91C1C',
        },
        callout: {
          bg: '#FFF8DC',
          border: '#FACC15',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        pixel: ['Pixelify Sans', 'monospace'],
      },
      borderRadius: {
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
