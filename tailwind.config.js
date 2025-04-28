/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Định nghĩa màu tùy chỉnh ICT
      colors: {
        'ict-blue': '#006b69', // Giữ nguyên mã màu xanh
        'ict-yellow': '#ffc72f', // Giữ nguyên mã màu vàng
      },
    },
  },
  plugins: [],
}