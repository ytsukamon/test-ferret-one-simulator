/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#014385',
        accent: '#2EC4C8',
        surface: '#FFFFFF',
        'surface-soft': '#EAF2FA',
        muted: '#4382BB',
        border: '#D3D3D3',
        text: '#141414',
      },
    },
  },
  plugins: [],
}
