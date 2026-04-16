import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1a1410',
        paper: '#f5efe1',
        gold: '#c9a96b',
        cinnabar: '#a93226',
        jade: '#3e6b5a',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', 'STSong', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
