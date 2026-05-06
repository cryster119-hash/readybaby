/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 src 폴더 안의 모든 코드에 디자인을 적용하라는 뜻
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}