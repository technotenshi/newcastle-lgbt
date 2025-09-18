<template>
  <section
    id="slider2-1m"
    data-bs-version="5.1"
    class="slider2 cid-uggCyJ3UrA"
  >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10">
          <div
            id="ughmJreSXS"
            class="carousel slide"
            data-interval="5000"
            data-bs-interval="5000"
          >
            <ol class="carousel-indicators">
              <li
                v-for="(image, index) in resolvedImages"
                :key="`indicator-${index}`"
                :data-slide-to="index"
                :data-bs-slide-to="index"
                :class="{ active: index === 0 }"
                :data-target="'#ughmJreSXS'"
                :data-bs-target="'#ughmJreSXS'"
              />
            </ol>
            <div class="carousel-inner">
              <div
                v-for="(image, index) in resolvedImages"
                :key="`slide-${index}`"
                class="carousel-item slider-image item"
                :class="{ active: index === 0 }"
              >
                <div class="item-wrapper">
                  <img
                    v-if="image.resolvedSrc"
                    :src="image.resolvedSrc"
                    :alt="image.alt || ''"
                    class="d-block w-100"
                    :data-slide-to="index"
                    :data-bs-slide-to="index"
                  >
                </div>
              </div>
            </div>
            <a
              class="carousel-control carousel-control-prev"
              role="button"
              data-slide="prev"
              data-bs-slide="prev"
              href="#ughmJreSXS"
            >
              <span
                class="mobi-mbri mobi-mbri-arrow-prev"
                aria-hidden="true"
              />
              <span class="sr-only visually-hidden">Previous</span>
            </a>
            <a
              class="carousel-control carousel-control-next"
              role="button"
              data-slide="next"
              data-bs-slide="next"
              href="#ughmJreSXS"
            >
              <span
                class="mobi-mbri mobi-mbri-arrow-next"
                aria-hidden="true"
              />
              <span class="sr-only visually-hidden">Next</span>
            </a>
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
  images: {
    type: Array,
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

const resolvedImages = computed(() =>
  props.images.map((image) => {
    const source =
      (typeof image === 'object' && (image.src || image.path)) ||
      (typeof image === 'string' ? image : '');

    const base =
      typeof image === 'object' && image !== null
        ? image
        : { alt: '', src: source };

    return {
      ...base,
      resolvedSrc: resolveImagePath(source),
    };
  })
);
</script>

<style scoped>
/* Add any necessary CSS styles here */
</style>
