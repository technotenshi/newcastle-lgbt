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
                v-for="(image, index) in images"
                :key="index"
                :data-slide-to="index"
                :data-bs-slide-to="index"
                :class="{ active: index === 0 }"
                :data-target="'#ughmJreSXS'"
                :data-bs-target="'#ughmJreSXS'"
              />
            </ol>
            <div class="carousel-inner">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="carousel-item slider-image item"
                :class="{ active: index === 0 }"
              >
                <div class="item-wrapper">
                  <g-image
                    :src="require(`@/${image.src}`)"
                    :alt="image.alt"
                    class="d-block w-100"
                    :data-slide-to="index"
                    :data-bs-slide-to="index"
                  />
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

<script>
export default {
  name: 'NewsCommunityCarousel',
  props: {
    images: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
/* Add any necessary CSS styles here */
</style>
