/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssAspectRatio from "@tailwindcss/aspect-ratio";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        agardex: {
          black: 'hsl(0, 0%, 0%)',
          navy: {
            light: 'hsl(240, 100%, 0.2%)',
            dark: 'hsl(230.89, 97.53%, 15.88%)',
            darker: 'hsl(202.94, 94.44%, 7.06%)',
          },
          blue: {
            light: 'hsl(209.69, 75.19%, 74.71%)',
            DEFAULT: 'hsl(222.33, 86.9%, 32.94%)',
            dark: 'hsl(211.56, 60%, 44.12%)',
            darker: 'hsl(215.91, 57.39%, 45.1%)',
          },
          teal: {
            light: 'hsl(184.29, 100%, 89.02%)',
            lighter: 'hsl(183.43, 100%, 93.14%)',
            DEFAULT: 'hsl(185.08, 69.41%, 66.67%)',
            dark: 'hsl(189, 87.72%, 22.35%)',
            darker: 'hsl(202.35, 82.26%, 24.31%)',
          },
          cyan: {
            light: 'hsl(205, 73.68%, 77.65%)',
            DEFAULT: 'hsl(193.33, 79.59%, 28.82%)',
            dark: 'hsl(206.55, 45.02%, 49.22%)',
          },
          purple: {
            light: 'hsl(285.13, 100%, 77.84%)',
            DEFAULT: 'hsl(275.5, 65.22%, 63.92%)',
          },
          gray: {
            light: 'hsl(214, 75%, 76.47%)',
            DEFAULT: 'hsl(213.16, 53.27%, 58.04%)',
          },
          slate: {
            DEFAULT: 'hsl(210.5, 52.63%, 55.29%)',
            dark: 'hsl(185.25, 47.06%, 33.33%)',
            darker: 'hsl(187.11, 31.67%, 47.06%)',
          },
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s infinite',
        'blob-circle': 'blobCircle 2s infinite ease-in-out',
        'blob-circle-reverse': 'blobCircleReverse 2s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(74, 222, 128, 0.5)' },
        },
        blobCircle: {
          '0%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.8'
          },
          '25%': {
            transform: 'translate(75%, 0) scale(1.2)',
            opacity: '1'
          },
          '50%': {
            transform: 'translate(75%, 75%) scale(1)',
            opacity: '0.8'
          },
          '75%': {
            transform: 'translate(0, 75%) scale(0.8)',
            opacity: '0.6'
          },
          '100%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.8'
          },
        },
        blobCircleReverse: {
          '0%': {
            transform: 'translate(75%, 75%) scale(1)',
            opacity: '0.8'
          },
          '25%': {
            transform: 'translate(0, 75%) scale(0.8)',
            opacity: '0.6'
          },
          '50%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.8'
          },
          '75%': {
            transform: 'translate(75%, 0) scale(1.2)',
            opacity: '1'
          },
          '100%': {
            transform: 'translate(75%, 75%) scale(1)',
            opacity: '0.8'
          },
        }
      }
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssAspectRatio],
};