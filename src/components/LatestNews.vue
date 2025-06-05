<template>
  <div class="item features-image col-12 col-md-6 col-lg-4 news-grid-item">
    <div class="item-wrapper">
      <g-link :to="path" class="news-item-link">
        <div class="item-img">
          <g-image v-if="image && image.path" :src="require(`!!assets-loader!@/../${image.path}`)" :alt="image.alt || title" class="news-thumbnail" />
        </div>
        <div class="item-content">
          <h5 class="item-title mbr-fonts-style display-7 news-title"><strong>{{ title }}</strong></h5>
          <!-- Optional: Display date if desired -->
          <!-- <p class="news-date mbr-fonts-style display-7">{{ formattedDate }}</p> -->
        </div>
      </g-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LatestNews',
  props: {
    title: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    date: { // Raw date string, formatting can be done if needed
      type: String,
      required: true
    },
    image: { // Expects an object like { path: '...', alt: '...' }
      type: Object,
      default: null // Or default: () => ({ path: '', alt: '' }) if image is optional but object structure is preferred
    }
  }
  // Optional: Add computed property for date formatting if needed
  // computed: {
  //   formattedDate() {
  //     if (!this.date) return '';
  //     const options = { year: 'numeric', month: 'long', day: 'numeric' };
  //     return new Date(this.date).toLocaleDateString(undefined, options);
  //   }
  // }
};
</script>

<style scoped>
/* Styles are largely the same as the previous grid item styling */
/* news-grid-item is the root element of this component now. */
.news-grid-item {
  margin-bottom: 1.5rem; /* Space below items if they wrap */
}

.item-wrapper {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  height: 100%;
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
  flex-grow: 1;
}

.item-img {
  width: 100%;
}

.news-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.item-content {
  padding: 1rem;
  text-align: center;
  flex-grow: 1;
}

.news-title { /* This is an h5 */
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}
</style>
