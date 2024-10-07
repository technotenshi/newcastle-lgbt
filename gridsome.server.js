// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const dataUtils = (()=>{

  const path = require('path');

  const getDataPath = (basePath, filename) => path.resolve(__dirname, basePath, filename);

  const createCollection = (actions, typeName, data) => {
    const collection = actions.addCollection({ typeName });

    data.forEach((item, index) => {
      const nodeData = {
        order: item.order || index, // Default to index if order is not provided
      };

      // Iterate over item properties
      for (const key in item) {
        // If the property is an image path, resolve it
        if (key.endsWith('Src')) {
          nodeData[key] = getDataPath('./src/assets/images/', item[key]);
        } else {
          nodeData[key] = item[key];
        }
      }

      collection.addNode(nodeData);
    });
  };

  return {
    createCollection,
  };

})();

module.exports = api => {
  // api.loadSource(({ addCollection }) => {
  //   // Use the Data Store API here: https://gridsome.org/docs/data-store-api/
  // })

  api.loadSource(async actions => {
    const featuresData = require('./data/features.json');
    const featuredNews = require('./data/news.json');

    dataUtils.createCollection(actions, 'FeatureItem', featuresData);
    dataUtils.createCollection(actions, 'News', featuredNews);
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
