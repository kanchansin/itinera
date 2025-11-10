/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a",
        accent: "#3b82f6",
        neutral: "#f3f4f6",
      },
    },
  },
  plugins: [require("nativewind/tailwind/css")],
}
