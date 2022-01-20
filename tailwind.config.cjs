const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      gridTemplateColumns: {
        '1fr-auto': '1fr auto',
        'auto-1fr-auto': 'auto 1fr auto',
      }
    },
  },

  plugins: [],
}

module.exports = config
