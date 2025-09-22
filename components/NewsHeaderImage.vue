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
import { resolveAssetUrl } from '~/utils/assets';

const props = defineProps({
  imageHeader: {
    type: Object,
    required: true,
  },
});

const imageSrc = computed(() => resolveAssetUrl(props.imageHeader?.path || props.imageHeader?.src || ''));
</script>

<style scoped>
/* Add any necessary CSS styles here */
</style>
