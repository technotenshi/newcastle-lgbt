<template>
  <section class="latest-news-component" v-if="newsItems && newsItems.length > 0">
    <h2>Latest News</h2>
    <div class="row mt-4"> <!-- Added row for grid system -->
      <div v-for="item in newsItems" :key="item.node.id" class="item features-image col-12 col-md-6 col-lg-4 news-grid-item"> <!-- Added grid column classes -->
        <div class="item-wrapper"> <!-- Added item-wrapper, similar to FeatureItem -->
          <g-link :to="item.node.path" class="news-item-link">
            <div class="item-img"> <!-- Added item-img for image consistency -->
              <g-image v-if="item.node.image && item.node.image.path" :src="require(`!!assets-loader!@/../${item.node.image.path}`)" :alt="item.node.image.alt || item.node.title" class="news-thumbnail" />
            </div>
            <div class="item-content"> <!-- Added item-content for text consistency -->
              <h5 class="item-title mbr-fonts-style display-7 news-title"><strong>{{ item.node.title }}</strong></h5>
            </div>
          </g-link>
        </div>
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
/* Adjusted styles to work with the new grid structure and item-wrapper */
.latest-news-component h2 {
  text-align: center;
  margin-bottom: 1.5rem; /* Matches style of FeatureItem section titles if any */
  /* Or use existing mbr-section-title mbr-fonts-style display-2 if that's the standard */
}

/* news-grid-item is the col-12 col-md-6 col-lg-4 element */
.news-grid-item {
  margin-bottom: 1.5rem; /* Space below items if they wrap */
}

.item-wrapper {
  /* Replicates styling from FeatureItem's item-wrapper if necessary */
  /* e.g., borders, shadows, background, padding, text-align */
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  height: 100%; /* Ensure wrappers in a row are same height if content varies */
  display: flex;
  flex-direction: column;
}

.item-wrapper:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-item-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allows link to fill wrapper */
}

.item-img {
  width: 100%;
  /* height: 180px; /* Or make it aspect ratio based */
  /* object-fit: cover; /* Handled by g-image */
}

.news-thumbnail {
  width: 100%;
  height: 180px; /* Fixed height for thumbnails */
  object-fit: cover;
  display: block; /* Remove extra space below image */
}

.item-content {
  padding: 1rem; /* Standard padding within content area */
  text-align: center; /* Center title */
  flex-grow: 1; /* Allows content to push footer down if any */
}

.news-title { /* This is an h5 now */
  font-size: 1.1rem; /* Adjust as needed for h5 */
  font-weight: bold; /* Handled by <strong> */
  margin: 0; /* Reset margin for h5 */
}

/* Remove old .news-list and .news-item styles as they are replaced by grid classes and .item-wrapper */
</style>
