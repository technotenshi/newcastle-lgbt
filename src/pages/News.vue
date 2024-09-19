<template>
  <Layout>
    <div>
      <!-- Content will be added here -->

      <SectionHeader
        title="News"
      />

      <section
        id="content2-1c"
        data-bs-version="5.1"
        class="content2 cid-uggfofTuig"
      >
        <div class="container">
          <div class="row mt-4">
            <FeaturedNews
              v-for="edge in $page.allNews.edges"
              :key="edge.node.id"
              :image-src="edge.node.imageSrc"
              :image-alt="edge.node.imageAlt"
              :title="edge.node.title"
              :author="edge.node.author"
              :date="edge.node.date"
              :summary="edge.node.summary"
              :link="edge.node.link"
              :target="edge.node.target"
            />
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<page-query>
query { allNews(sortBy: "order", order: DESC) { edges { node { id order imageSrc imageAlt title author date summary link target } } } }
</page-query>

<script>
import FeaturedNews from '@/components/FeaturedNews.vue';
import SectionHeader from '@/components/SectionHeader.vue';

export default {
  name: 'NewsMain',
  metaInfo() {
    return {
      title: 'News', // Sets the page title
      meta: [
        {
          name: 'description',
          content: 'Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality, and promoting community events in Newcastle, WA.'
        }
      ]
    };
  },
  components: {
    FeaturedNews,
    SectionHeader,
  }
};
</script>

<style scoped>
/* Add any custom component-specific styles here */
</style>
