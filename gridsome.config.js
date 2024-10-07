// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'Newcastle LGBT',
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        typeName: 'CouncilMembersMd',
        path: './content/council/**/*.md'
      }
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        typeName: 'NewsMd',
        path: './content/news/**/*.md'
      }
    }
  ],
  templates: {
    NewsMd: '/news/:year/:month/:day/:slug'
  }
};
