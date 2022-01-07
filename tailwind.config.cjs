const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      gridTemplateColumns: {
        'media-reference-list': '200px auto 1fr',
        'media-list-only': 'auto 1fr',
      }
    },
  },

  plugins: [],
}

module.exports = config
