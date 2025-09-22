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
import { resolveAssetUrl } from '~/utils/assets';

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

const imageUrl = computed(() => resolveAssetUrl(extractImagePath(props.imageSrc)));
const linkRel = computed(() => (props.target === '_blank' ? 'noopener noreferrer' : null));
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
