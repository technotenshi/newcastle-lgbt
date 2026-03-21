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
            <NuxtImg
              v-if="imageSrc"
              :src="imageSrc"
              :alt="imageHeader.alt"
              width="511"
              format="webp"
              sizes="100vw md:50vw lg:42vw"
              loading="lazy"
            />
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
import { normalizeAssetPath } from '~/utils/assets';

const props = defineProps({
  imageHeader: {
    type: Object,
    required: true,
  },
});

const imageSrc = computed(() => normalizeAssetPath(props.imageHeader?.path || props.imageHeader?.src || ''));
</script>

<style scoped>
/* Add any necessary CSS styles here */
</style>
