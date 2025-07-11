// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // IMPORTANT: Ensure 'darkMode' is set to 'class' for theme toggling
  darkMode: 'class', 
  content: [  
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is crucial for Tailwind to find your React components
  ],
  theme: {
    extend: {
      // You can add custom animations or other theme extensions here if needed
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-delay': 'fade-in 0.7s ease-out forwards 0.2s', // Longer delay for second element
      },
    },
  },
  plugins: [],
}
