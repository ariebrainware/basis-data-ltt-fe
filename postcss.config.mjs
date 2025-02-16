import { preProcessFile } from "typescript";

/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preProcessFile: false,
  },
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
