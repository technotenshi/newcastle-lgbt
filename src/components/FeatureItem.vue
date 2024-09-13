<template>
  <div class="item features-image col-12 col-md-6 col-lg-4">
    <div class="item-wrapper">
      <div class="item-img">
        <g-link
          :to="link"
          :target="target"
        >
          <g-image
            :src="imageSrc"
            :alt="imageAlt"
          />
        </g-link>
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
        <g-link
          :to="link"
          class="btn btn-primary item-btn display-7"
          :target="target"
        >
          Learn More &gt;
        </g-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureItem',
  props: {
    imageSrc: {
      type: String,
      required: true
    },
    imageAlt: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    description: {
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
