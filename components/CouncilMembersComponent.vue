<template>
  <section
    id="content5-g"
    data-bs-version="5.1"
    class="content5 cid-ufk4kB3ye9"
  >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-12 col-lg-10">
          <div class="row align-items-start">
            <!-- Image Section -->
            <div class="col-md-4 col-lg-3">
              <div v-if="imageUrl">
                <img
                  :src="imageUrl"
                  :alt="resolvedImageAlt"
                  class="img-fluid"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <div
                v-else
                class="placeholder-image"
              />
            </div>

            <!-- Bio Section -->
            <div class="col-md-8 col-lg-9">
              <!-- Position -->
              <h4
                v-if="position"
                class="mbr-section-subtitle mbr-fonts-style mb-2 display-6"
              >
                {{ position }}
              </h4>

              <!-- Name and Flag (if applicable) -->
              <p
                v-if="name"
                class="mbr-fonts-style mb-2 display-5"
              >
                <strong>{{ name }}</strong>
                <template v-if="flag">
                  &nbsp;<span>{{ flag }}</span>
                </template>
              </p>

              <!-- Email -->
              <p
                v-if="hasEmail"
                class="mbr-fonts-style mb-4 display-5"
              >
                <a
                  :href="mailtoHref"
                  class="text-primary"
                >{{ email }}</a>
              </p>

              <!-- Bio Content -->
              <ContentRenderer
                v-if="bioDocument"
                :value="bioDocument"
                class="mbr-text mbr-fonts-style display-7"
              />
              <span
                v-else-if="bioHtml"
                class="mbr-text mbr-fonts-style display-7"
                v-html="bioHtml"
              />
            </div>
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
  position: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  flag: {
    type: String,
    default: '',
  },
  bio: {
    type: [Object, String],
    default: null,
  },
  image: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: '',
  },
});

const imageUrl = computed(() => resolveAssetUrl(props.image));

const resolvedImageAlt = computed(() => {
  const alt = typeof props.imageAlt === 'string' ? props.imageAlt.trim() : '';

  if (alt) {
    return alt;
  }

  if (props.name) {
    return `${props.name} portrait`;
  }

  return 'Council member portrait';
});

const bioDocument = computed(() => {
  if (props.bio && typeof props.bio === 'object' && !Array.isArray(props.bio)) {
    return { body: props.bio };
  }

  return null;
});

const bioHtml = computed(() => {
  if (typeof props.bio === 'string') {
    return props.bio;
  }

  if (Array.isArray(props.bio)) {
    return props.bio
      .filter((segment) => typeof segment === 'string' && segment.trim().length > 0)
      .join(' ');
  }

  return '';
});

const hasEmail = computed(() => typeof props.email === 'string' && props.email.trim().length > 0);

const mailtoHref = computed(() => (hasEmail.value ? `mailto:${props.email}` : ''));
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
