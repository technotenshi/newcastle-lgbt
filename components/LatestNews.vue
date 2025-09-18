<template>
  <div class="item features-image col-12 col-md-6 col-lg-4 news-grid-item">
    <div class="item-wrapper">
      <NuxtLink
        :to="path"
        class="news-item-link"
      >
        <div class="item-img">
          <img
            v-if="thumbnailSrc"
            :src="thumbnailSrc"
            :alt="imageAltText"
            class="news-thumbnail"
          >
        </div>
        <div class="item-content">
          <h5 class="item-title mbr-fonts-style display-7 news-title">
            <strong>{{ title }}</strong>
          </h5>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
    default: null,
  },
});

const resolveImagePath = (path) => {
  if (!path || typeof path !== 'string') {
    return '';
  }

  if (/^https?:\/\//i.test(path) || path.startsWith('//')) {
    return path;
  }

  let normalized = path.replace(/^@\//, '~/').trim();

  if (normalized.startsWith('/')) {
    return normalized;
  }

  if (normalized.startsWith('~/')) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }

  const stripped = normalized.replace(/^assets\//, '');
  const candidates = [];

  if (stripped) {
    candidates.push(stripped);
  }

  if (!stripped.startsWith('images/')) {
    candidates.push(`images/${stripped}`);
  }

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      return new URL(`../assets/${candidate}`, import.meta.url).href;
    } catch {
      // Ignore resolution errors and try the next option.
    }
  }

  return '';
};

const thumbnailSrc = computed(() => {
  const path = props.image?.path || props.image?.src || '';
  return resolveImagePath(path);
});

const imageAltText = computed(() => props.image?.alt || props.title);
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
