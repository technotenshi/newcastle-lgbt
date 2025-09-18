<template>
  <section
    id="header6-1b"
    data-bs-version="5.1"
    class="header6 cid-uggffGpPgO"
  >
    <div
      class="mbr-overlay"
      style="opacity: 0.5; background-color: rgb(255, 255, 255);"
    />

    <div class="align-center container">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <h1 class="mbr-section-title mbr-fonts-style mbr-white mb-3 display-1">
            <strong>{{ title }}</strong>
          </h1>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    title: {
      type: String,
      required: true
    },
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
