/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'float-random': 'float-random 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite'
      },
      keyframes: {
        'float-random': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -10px) rotate(5deg)' },
          '50%': { transform: 'translate(-5px, -20px) rotate(-5deg)' },
          '75%': { transform: 'translate(-10px, -10px) rotate(5deg)' }
          }
        },
        'gradient-x': {
          '0%': {
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center'
          },
          '100%': {
            backgroundSize: '200% 100%',
            backgroundPosition: 'right center'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
      },
      transitionProperty: {
        'width': 'width'
      }
    },
  },
  plugins: []
};