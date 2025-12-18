import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'roboflow-purple': '#6C5CE7',
        'roboflow-blue': '#0984E3',
        'jeopardy-blue': '#060CE9',
      },
    },
  },
  plugins: [],
}
export default config
