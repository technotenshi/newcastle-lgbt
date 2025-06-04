<template>
  <section class="latest-news" v-if="newsItems.length > 0">
    <div class="container">
      <h2>Latest News</h2>
      <div class="news-list">
        <div v-for="item in newsItems" :key="item.node.id" class="news-item">
          <g-link :to="item.node.path">
            <g-image v-if="item.node.image && item.node.image.path" :src="require(`!!assets-loader!@/../${item.node.image.path}`)" :alt="item.node.image.alt || item.node.title" class="news-thumbnail" />
            <h3 class="news-title">{{ item.node.title }}</h3>
          </g-link>
        </div>
      </div>
    </div>
  </section>
</template>

<static-query>
query {
  latestNews: allNewsMd(  # Corrected from allMarkdownPage to allNewsMd
    filter: { path: { regex: "^/news/" } }
    sortBy: "date"
    order: DESC
    limit: 10
  ) {
    edges {
      node {
        id
        title
        path
        date
        image {
          path
          alt
        }
      }
    }
  }
}
</static-query>

<script>
export default {
  name: 'LatestNews',
  computed: {
    newsItems() {
      // Ensure this path matches the query structure
      return this.$static.latestNews ? this.$static.latestNews.edges : [];
    }
  }
};
</script>

<style scoped>
.latest-news {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.news-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.news-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-item g-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.news-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.news-title {
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.75rem;
  margin: 0;
  text-align: center;
}
</style>
