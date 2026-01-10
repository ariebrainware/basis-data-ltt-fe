import nextConfig from 'eslint-config-next'
import tailwindcss from 'eslint-plugin-tailwindcss'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

const config = [
  ...nextConfig,
  {
    plugins: {
      tailwindcss,
      prettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      // Warn for misordered Tailwind CSS classes
      'tailwindcss/classnames-order': 'warn',
      // Turn off if you allow custom classnames
      'tailwindcss/no-custom-classname': 'off',
      // Enforce Prettier formatting
      'prettier/prettier': 'error',
    },
  },
]

export default config
