/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD633',
          light: '#FFEA80',
          dark: '#1E1B04'
        }
      },
      fontFamily: {
        display: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        card: '0 20px 40px rgba(255, 173, 0, 0.25)'
      }
    }
  },
  plugins: [],
};
