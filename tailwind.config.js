import { fontFamily } from 'tailwindcss/defaultTheme'
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        pink: '#ffc8c8',
        green: '#235046',
        red: '#e52421',
        blue: '#449ad5',
        'light-blue': '#a6faff',
        'light-grey': '#d0d0d0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"Azeret Mono"', 'ui-monospace', 'SFMono-Regular']
      }
    },
  },
  plugins: [],
}
