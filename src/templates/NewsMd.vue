<template>
  <Layout>
    <div>
      <!-- Content will be added here -->
      <section
        id="content4-1f"
        data-bs-version="5.1"
        class="content4 cid-uggm6pUBC5"
      >
        <div class="container">
          <div class="row justify-content-center">
            <div class="title col-md-12 col-lg-10">
              <h3 class="mbr-section-title mbr-fonts-style align-center mb-4 display-2">
                <strong>{{ $page.post.title }}</strong>
              </h3>
            </div>
          </div>
        </div>
      </section>

      <NewsCommunityCarousel
        v-if="$page.post.carousel"
        :images="$page.post.carousel.images"
      />

      <NewsHeaderImage
        v-if="$page.post.imageHeader"
        :image-header="$page.post.imageHeader"
      />

      <section
        id="content5-1g"
        data-bs-version="5.1"
        class="content5 cid-uggmezkOif"
      >
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-md-12 col-lg-10">
              <p class="mbr-text mbr-fonts-style display-7">
                {{ $page.post.date }}
              </p>
              <p
                class="mbr-text mbr-fonts-style display-7"
                v-html="$page.post.content"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<page-query>
query Post ($path: String!) {
post: newsMd (path: $path) {
title
date (format: "MMMM D, Y")
content
carousel { images {src alt} }
imageHeader {path alt}
}
}
</page-query>

<script>
import NewsCommunityCarousel from "~/components/NewsCommunityCarousel.vue";
import NewsHeaderImage from "~/components/NewsHeaderImage.vue";

export default {
  components: {
    NewsCommunityCarousel,
    NewsHeaderImage
  },
  metaInfo () {
    return {
      title: this.$page.post.title
    };
  },
};
</script>