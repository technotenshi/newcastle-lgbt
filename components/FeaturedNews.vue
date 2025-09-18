<template>
  <div class="item features-image сol-12 col-md-6 col-lg-4">
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
            title=""
            data-slide-to="1"
            data-bs-slide-to="2"
            class="img-fluid"
          >
        </NuxtLink>
      </div>
      <div class="item-content">
        <h5 class="item-title mbr-fonts-style display-5">
          <NuxtLink
            :to="link"
            class="text-primary"
            :target="target"
            :rel="linkRel"
          >
            {{ title }}
          </NuxtLink>
        </h5>
        <h6 class="item-subtitle mbr-fonts-style mt-1 display-7">
          <em>{{ date }}</em>
        </h6>
        <p class="mbr-text mbr-fonts-style mt-3 display-7">
          {{ summary }}...
        </p>
      </div>
      <div class="mbr-section-btn item-footer mt-2">
        <NuxtLink
          :to="link"
          class="btn item-btn btn-primary display-7"
          :target="target"
          :rel="linkRel"
        >
          Read More
          &gt;
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAsset } from '#imports';

const props = defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  summary: {
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

  let normalized = path.replace(/^@\//, '~/');

  if (normalized.startsWith('/')) {
    return normalized;
  }

  if (normalized.startsWith('~/')) {
    return useAsset(normalized);
  }

  if (normalized.startsWith('assets/')) {
    return useAsset(`~/${normalized}`);
  }

  if (normalized.startsWith('images/')) {
    return useAsset(`~/assets/${normalized}`);
  }

  return useAsset(`~/assets/images/${normalized}`);
};

const imageUrl = computed(() => resolveImagePath(props.imageSrc));
const linkRel = computed(() => (props.target === '_blank' ? 'noopener noreferrer' : null));
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
