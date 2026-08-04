/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/layouts/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        hansol: {
          blue: '#00AEEF',  // Xanh dương Hansol
          green: '#00A651', // Xanh lá Hansol
          dark: '#1A1A1B',  // Đen chữ Hansol
        },
      },
    },
  },
  corePlugins: {
    // QUAN TRỌNG: Tắt preflight để Tailwind không đè lên CSS của Ant Design
    preflight: false, 
  },
  plugins: [],
}