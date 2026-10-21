/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        primaryDark: "#000000",
        primaryMid: "#262626",
        secondary: "#111111",
        tertiary: "#FAFAFA",
        cream: "#FAFAFA",
        cream2: "#F5F5F5",
        ink: "#111111",
        muted: "#737373",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        ui: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        accent: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        price: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}

