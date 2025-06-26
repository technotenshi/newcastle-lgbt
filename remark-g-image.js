const visit = require('unist-util-visit');

module.exports = () => tree => {
  visit(tree, 'image', node => {
    const alt = node.alt ? node.alt.replace(/"/g, '&quot;') : '';
    node.type = 'html';
    node.value = `<g-image src="${node.url}" alt="${alt}" />`;
    node.children = undefined;
  });
};
