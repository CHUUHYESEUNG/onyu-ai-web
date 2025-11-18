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
      },
      // 어르신 친화적 폰트 크기 확대 (Phase 1-1)
      // 기준: 본문 최소 18px, 버튼/라벨 20px 이상
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.5' }],   // 12px → 14px
        'sm': ['1rem', { lineHeight: '1.5' }],       // 14px → 16px
        'base': ['1.125rem', { lineHeight: '1.6' }], // 16px → 18px
        'lg': ['1.25rem', { lineHeight: '1.6' }],    // 18px → 20px
        'xl': ['1.375rem', { lineHeight: '1.6' }],   // 20px → 22px
        '2xl': ['1.625rem', { lineHeight: '1.5' }],  // 24px → 26px
        '3xl': ['2rem', { lineHeight: '1.4' }],      // 30px → 32px
        '4xl': ['2.5rem', { lineHeight: '1.3' }],    // 36px → 40px
      }
    },
  },
  plugins: [],
};

export default config;
