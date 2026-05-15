/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary gradient colors (blue to cyan)
        primary: {
          50: '#f0f4fb',
          100: '#e1e9f7',
          200: '#c3d3ef',
          300: '#a5bde7',
          400: '#7a9edb',
          500: '#4c7aef',
          600: '#3563da',
          700: '#265fda',
          800: '#1e36d5',
          900: '#0415f4',
        },
        // Secondary colors (light cyan/teal)
        secondary: {
          50: '#f0fbfc',
          100: '#e0f8fa',
          200: '#c1f1f5',
          300: '#a2eaef',
          400: '#72ccf3',
          500: '#53acf4',
          600: '#3b95e8',
          700: '#2d7ad4',
          800: '#1f5fc0',
          900: '#1444ac',
        },
        // Accent colors (purple/indigo)
        accent: {
          50: '#f8f5ff',
          100: '#f1ebff',
          200: '#e3d7ff',
          300: '#d5c3ff',
          400: '#b895ff',
          500: '#9b67ff',
          600: '#7d3ff0',
          700: '#6525d6',
          800: '#4d1abc',
          900: '#3510a2',
        },
        // Neutral colors (grays)
        neutral: {
          50: '#fafbfc',
          100: '#f5f7fa',
          200: '#ebedf8',
          300: '#e1e4ef',
          400: '#d0d5e3',
          500: '#b3bcd7',
          600: '#a2abc9',
          700: '#7b84a1',
          800: '#6a7188',
          900: '#3e4459',
        },
        // Dark colors (for backgrounds and text)
        dark: {
          50: '#f0f2f7',
          100: '#e1e5ef',
          200: '#c3cbdf',
          300: '#a5b1cf',
          400: '#8697bf',
          500: '#687daf',
          600: '#4d6099',
          700: '#3a4a7d',
          800: '#2a3046',
          900: '#161c33',
          950: '#090e24',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '15': '3.75rem',  // 60px
        '30': '7.5rem',   // 120px
        '45': '11.25rem', // 180px
        '60': '15rem',    // 240px
        '70': '17.5rem',  // 280px
        '80': '20rem',    // 320px
        '125': '31.25rem', // 500px
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'progress-drain': 'progressDrain 4s linear forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        progressDrain: {
          'from': { transform: 'scaleX(1)' },
          'to': { transform: 'scaleX(0)' },
        },
      },
    },
  },
  plugins: [],
}
