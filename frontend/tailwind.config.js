export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cream: '#F7F5F0',
        ink: '#1A1A2E',
        navy: '#16213E',
        amber: '#E8A838',
        'amber-light': '#FDF3DC',
        muted: '#6B7280',
        border: '#E2DDD6',
      },
    },
  },
  plugins: [],
}
