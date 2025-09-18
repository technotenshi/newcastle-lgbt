<template>
  <div class="item features-image col-12 col-md-6 col-lg-4">
    <div class="item-wrapper">
      <div class="item-img">
        <NuxtLink
          :to="link"
          :target="target"
          :rel="linkRel"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="imageAlt"
            class="img-fluid"
          >
        </NuxtLink>
      </div>
      <div class="item-content">
        <h5 class="item-title mbr-fonts-style display-7">
          <strong>{{ title }}</strong>
        </h5>
        <p class="mbr-text mbr-fonts-style mt-3 display-7">
          {{ description }}
        </p>
      </div>
      <div class="mbr-section-btn item-footer mt-2">
        <NuxtLink
          :to="link"
          class="btn btn-primary item-btn display-7"
          :target="target"
          :rel="linkRel"
        >
          Learn More &gt;
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  imageSrc: {
    type: [String, Object],
    required: true,
  },
  imageAlt: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    default: '_self',
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
      // Ignore resolution errors and try the next candidate.
    }
  }

  return '';
};

const extractImagePath = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return value.src || value.path || '';
  }

  return '';
};

const imageUrl = computed(() => resolveImagePath(extractImagePath(props.imageSrc)));
const linkRel = computed(() => (props.target === '_blank' ? 'noopener noreferrer' : null));
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
