<template>
  <div class="item features-image сol-12 col-md-6 col-lg-4">
    <div class="item-wrapper">
      <div class="item-img">
        <g-link
          :to="link"
          :target="target"
        >
          <g-image
            :src="imageSrc"
            :alt="imageAlt"
            title=""
            data-slide-to="1"
            data-bs-slide-to="2"
          />
        </g-link>
      </div>
      <div class="item-content">
        <h5 class="item-title mbr-fonts-style display-5">
          <g-link
            :to="link"
            class="text-primary"
            :target="target"
          >
            {{ title }}
          </g-link>
        </h5>
        <h6 class="item-subtitle mbr-fonts-style mt-1 display-7">
          <strong>{{ author }} </strong><em>{{ date }}</em>
        </h6>
        <p class="mbr-text mbr-fonts-style mt-3 display-7">
          {{ summary }}
        </p>
      </div>
      <div class="mbr-section-btn item-footer mt-2">
        <g-link
          :to="link"
          class="btn item-btn btn-primary display-7"
          :target="target"
        >
          Read More
          &gt;
        </g-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeaturedNews',
  props: {
    imageSrc: {
      type: String,
      required: true
    },
    imageAlt: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: '_self'
    }
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
