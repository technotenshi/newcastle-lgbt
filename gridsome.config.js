// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const path = require('path');

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
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        typeName: 'EventsMd',
        path: './content/events/**/*.md'
      }
    }
  ],
  templates: {
    NewsMd: '/news/:year/:month/:day/:slug'
  },
  transformers: {
    remark: {
      plugins: [
        ['remark-html', { sanitize: true }]
      ]
    }
  },
  chainWebpack: config => {
    const imagesRule = config.module.rule('images');
    imagesRule
      .include.add(path.resolve(__dirname, 'src/assets/images')).end()
      .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .before('url-loader')
        .options({
          mozjpeg: { progressive: true, quality: 70 },
          optipng: { enabled: false },
          pngquant: { quality: [0.65, 0.9], speed: 4 },
          gifsicle: { interlaced: false },
          webp: { quality: 75 }
        });
  }
};
