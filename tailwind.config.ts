import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8eaf2',
          100: '#c5cbdd',
          200: '#a0abc9',
          300: '#7a8bb5',
          400: '#5a71a6',
          500: '#3a5797',  // Primary navy
          600: '#344f8a',
          700: '#2b4479',
          800: '#233968',
          900: '#1a1d2e',  // Background navy
          950: '#13151f',
        },
        accent: {
          DEFAULT: '#5b7cff',  // Primary accent
          hover: '#7590ff',
          light: '#99acff',
        },
        card: {
          DEFAULT: '#252837',  // Card background
          hover: '#2d3347',
        }
      }
    },
  },
  plugins: [],
};

export default config;
