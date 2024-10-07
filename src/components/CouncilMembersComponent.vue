<template>
  <section
    id="content5-g"
    data-bs-version="5.1"
    class="content5 cid-ufk4kB3ye9"
  >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-12 col-lg-10">
          <h4 class="mbr-section-subtitle mbr-fonts-style mb-4 display-5">
            <strong>
              {{ position }}</strong>: {{ name }} - <a
              :href="'mailto:' + email"
              class="text-primary"
            >{{ email }}</a>&nbsp;<span>{{ flag }}</span>
          </h4>
          <span
            class="mbr-text mbr-fonts-style display-7"
            v-html="bio"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CouncilMembers',
  props: {
    position: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    flag: {
      type: String,
      required: false,
      default: null
    },
    bio: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
