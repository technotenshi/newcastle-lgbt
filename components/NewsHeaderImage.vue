<template>
  <section
    id="image3-1v"
    data-v-48677de0=""
    data-v-6ac3a620=""
    data-bs-version="5.1"
    class="image3 cid-ughfg1guI4"
  >
    <div
      data-v-48677de0=""
      data-v-6ac3a620=""
      class="container"
    >
      <div
        data-v-48677de0=""
        data-v-6ac3a620=""
        class="row justify-content-center"
      >
        <div
          data-v-48677de0=""
          data-v-6ac3a620=""
          class="col-12 col-lg-5"
        >
          <div
            data-v-48677de0=""
            data-v-6ac3a620=""
            class="image-wrapper"
          >
            <img
              v-if="imageSrc"
              :alt="imageHeader.alt"
              :src="imageSrc"
              width="511"
            >
            <p
              class="mbr-description mbr-fonts-style mt-2 align-center display-4"
            >
              {{ imageHeader.alt }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useAsset } from '#imports';

const props = defineProps({
  imageHeader: {
    type: Object,
    required: true,
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

const imageSrc = computed(() => resolveImagePath(props.imageHeader?.path || props.imageHeader?.src || ''));
</script>

<style scoped>
/* Add any necessary CSS styles here */
</style>
