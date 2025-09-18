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
              v-for="edge in $page.allNewsMd.edges"
              :key="edge.node.id"
              :image-src="edge.node.image.path"
              :image-alt="edge.node.image.alt"
              :title="edge.node.title"
              :author="'author'"
              :date="edge.node.date"
              :summary="edge.node.content"
              :link="`/news/${edge.node.dateForLink}/${edge.node.slug}`"
              :target="edge.node.target"
            />
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<page-query>
{
allNewsMd(sort: [{by: "date", order: DESC}, {by: "order", order: DESC}]) {
edges {
node {
id
title
date(format: "MMMM D, Y")
dateForLink: date(format: "YYYY/MM/DD")
slug
image {
path
alt
}
imageHeader {
path
alt
}
content: excerpt
}
}
}
}

</page-query>

<script>
import FeaturedNews from '~/components/FeaturedNews.vue';
import SectionHeader from '~/components/SectionHeader.vue';

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
