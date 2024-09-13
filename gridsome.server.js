// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const path = require('path');

module.exports = function (api) {
  // api.loadSource(({ addCollection }) => {
  //   // Use the Data Store API here: https://gridsome.org/docs/data-store-api/
  // })

  api.loadSource(async actions => {
    const data = require('./src/data/features.json');

    const collection = actions.addCollection({
      typeName: 'FeatureItem'
    });

    data.forEach((item, index) => {
      const imagePath = path.resolve(__dirname, './src/assets/images/', item.imageSrc);

      collection.addNode({
        id: item.id,
        order: item.order || index, // Use item.order if available, else index
        imageSrc: imagePath,
        imageAlt: item.imageAlt,
        title: item.title,
        description: item.description,
        link: item.link,
        target: item.target
      });
    });

  });

  // api.createPages(({ createPage }) => {
  //   // Use the Pages API here: https://gridsome.org/docs/pages-api/
  // })
}
