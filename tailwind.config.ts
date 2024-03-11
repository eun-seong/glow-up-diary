import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#19181D',
        blue: '#3971E0',
        lightblue: '#EBF1FD',

        grey10: '#F9F9FD',
        grey20: '#F8F9FD',
        grey30: '#F4F5F7',
        grey70: '#B1B9C4',
        grey80: '#718397',

        blue70: '#718397',
        blue30: '#B1B9C4',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
