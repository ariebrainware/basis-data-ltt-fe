import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:prettier/recommended'
  ),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Warn for misordered Tailwind CSS classes
      'tailwindcss/classnames-order': 'warn',
      // Turn off if you allow custom classnames
      'tailwindcss/no-custom-classname': 'off',
      // Enforce Prettier formatting
      'prettier/prettier': 'error',
    },
  },
];

export default config;
