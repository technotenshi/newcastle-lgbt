<template>
  <div class="item features-image col-12 col-md-6 col-lg-4">
    <div class="item-wrapper">
      <div class="item-img">
        <NuxtLink
          :to="link"
          :target="target"
          :rel="linkRel"
        >
          <NuxtImg
            v-if="imageUrl"
            :src="imageUrl"
            :alt="imageAlt"
            format="webp"
            sizes="100vw md:50vw lg:33vw"
            loading="lazy"
            class="img-fluid"
          />
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
import { normalizeAssetPath } from '~/utils/assets';

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

const imageUrl = computed(() => normalizeAssetPath(props.imageSrc));
const linkRel = computed(() => (props.target === '_blank' ? 'noopener noreferrer' : null));
</script>

<style scoped>
.item-img {
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.item-wrapper {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.item-content {
  padding: 1rem 1rem 0;
}

.item-title {
  font-size: 1.25rem;
  line-height: 1.3;
}
</style>
