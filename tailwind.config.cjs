const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      gridTemplateColumns: {
        'media-reference-list': '200px auto 1fr',
        'media-list-only': 'auto 1fr',
        '1fr-auto': '1fr auto',
      }
    },
  },

  plugins: [],
}

module.exports = config
