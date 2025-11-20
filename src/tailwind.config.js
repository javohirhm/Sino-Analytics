const colors = {
  background: '#0e1220',
  card: '#14192b',
  border: 'rgba(255,255,255,0.05)',
  text: 'rgba(255,255,255,0.85)',
  accent: {
    blue: '#3c83f6',
    purple: '#8c65f7',
    teal: '#2fd6c5',
    yellow: '#f6d26a',
    green: '#6edcc7',
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 30px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};

