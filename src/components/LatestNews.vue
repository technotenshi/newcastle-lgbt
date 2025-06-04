<template>
  <section class="latest-news-component" v-if="newsItems && newsItems.length > 0">
    <h2>Latest News</h2>
    <div class="news-list">
      <div v-for="item in newsItems" :key="item.node.id" class="news-item">
        <g-link :to="item.node.path">
          <g-image v-if="item.node.image && item.node.image.path" :src="require(`!!assets-loader!@/../${item.node.image.path}`)" :alt="item.node.image.alt || item.node.title" class="news-thumbnail" />
          <h3 class="news-title">{{ item.node.title }}</h3>
        </g-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LatestNews',
  props: {
    newsItems: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style scoped>
/* Styles remain the same, but the outer container for the component itself is removed from here */
/* as it will be handled by the parent Index.vue */
.latest-news-component {
  /* Styles for the content *within* the section that Index.vue will create */
  /* For example, if Index.vue creates <section><div class="container"><LatestNews>...</LatestNews></div></section> */
  /* then this component's root is LatestNews, and it might not need padding/margin here directly */
  /* but its inner elements like H2 and .news-list do. */
}

.latest-news-component h2 {
  text-align: center;
  margin-bottom: 1.5rem;
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
