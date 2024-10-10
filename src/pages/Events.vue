<template>
  <Layout>
    <div>
      <!-- Content will be added here -->

      <SectionHeader
        title="Events"
      />

      <section
        v-for="edge in $page.allEventsMd.edges"
        id="features17-7"
        :key="edge.node.id"
        data-bs-version="5.1"
        class="features17 cid-uf3QuR9bob"
      >
        <div class="container">
          <div class="content-wrapper">
            <div class="row align-items-center">
              <div class="col-12 col-lg-6">
                <div class="image-wrapper">
                  <g-image
                    :src="require(`~/${edge.node.image.path}`)"
                    :alt="`${edge.node.image.alt}`"
                  />
                </div>
              </div>
              <div class="col-12 col-lg">
                <div class="text-wrapper">
                  <h6 class="card-title mbr-fonts-style display-5">
                    <strong>{{ edge.node.title }} - {{ edge.node.date }}</strong>
                  </h6>
                  <p
                    class="mbr-text mbr-fonts-style mb-4 display-4"
                    v-html="edge.node.content"
                  />
                  <div class="mbr-section-btn mt-3">
                    <a
                      class="btn btn-primary display-4"
                      :href="`${edge.node.link.target}`"
                      target="_blank"
                    >
                      {{ edge.node.link.text }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<page-query>
{
allEventsMd (sort: [{by: "date", order: DESC}, {by: "order", order: DESC}]) {
edges {
node {
id
title
date(format: "MMMM D, Y")
image {path alt}
link{text target}
content
}
}
}
}
</page-query>

<script>
import SectionHeader from '@/components/SectionHeader.vue';

export default {
  name: 'EventsPage',
  metaInfo() {
    return {
      title: 'Events', // Sets the page title
      meta: [
        {
          name: 'description',
          content: 'Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality, and promoting community events in Newcastle, WA.'
        }
      ]
    };
  },
  components: {
    SectionHeader,
  }
};
</script>

<style scoped>
/* Add any custom component-specific styles here */
</style>
