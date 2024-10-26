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
              <div v-if="image">
                <g-image
                  :src="require(`@/assets/images/council/${image}`)"
                  alt="Image"
                  class="img-fluid"
                />
              </div>
              <div
                v-else
                class="placeholder-image"
              />
            </div>

            <!-- Bio Section -->
            <div class="col-md-8 col-lg-9">
              <!-- Position -->
              <h4 class="mbr-section-subtitle mbr-fonts-style mb-2 display-6">
                {{ position }}
              </h4>

              <!-- Name and Flag (if applicable) -->
              <p class="mbr-fonts-style mb-2 display-5">
                <strong>{{ name }}</strong>
                <template v-if="flag">
                  &nbsp;<span>{{ flag }}</span>
                </template>
              </p>

              <!-- Email -->
              <p
                v-if="email"
                class="mbr-fonts-style mb-4 display-5"
              >
                <a
                  :href="'mailto:' + email"
                  class="text-primary"
                >{{ email }}</a>
              </p>

              <!-- Bio Content -->
              <span
                class="mbr-text mbr-fonts-style display-7"
                v-html="bio"
              />
            </div>
          </div>
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
    },
    image: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
