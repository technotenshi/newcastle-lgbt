<template>
  <Layout>
    <div>
      <!-- Content will be added here -->
      <section
        id="header14-1f"
        data-bs-version="5.1"
        class="header14 cid-sFzxmVl7J6"
      >
        <div class="container">
          <div class="row justify-content-center align-items-center">
            <div class="col-12 col-md-6 image-wrapper">
              <g-image
                src="~/assets/images/K59bqmorPm9qeV7qbg4Dozml.webp"
                alt="Newcastle LGBTQ Voice"
              />
            </div>
            <div class="col-12 col-md">
              <div class="text-wrapper">
                <h1 class="mbr-section-title mbr-fonts-style mb-3 display-1">
                  <strong>Newcastle LGBTQ Voice</strong>
                </h1>
                <p class="mbr-text mbr-fonts-style display-7">
                  Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices,
                  advocating for equality, and promoting community events in Newcastle, WA. Here, you'll find
                  news, educational resources, and updates on local LGBTQ events. Join us in standing against
                  discrimination and celebrating diversity in our city. Stay informed, get involved, and help make
                  Newcastle a more inclusive place for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="latest-news" v-if="newsItems && newsItems.length > 0">
        <div class="container">
          <LatestNews :newsItems="newsItems" />
        </div>
      </section>

<!--      <section-->
<!--        id="header14-1j"-->
<!--        data-bs-version="5.1"-->
<!--        class="header14 cid-sFzz5E692j"-->
<!--      >-->
<!--        <div class="container">-->
<!--          <div class="row justify-content-center align-items-center">-->
<!--            <div class="col-12 col-md-6 image-wrapper">-->
<!--              <g-image-->
<!--                src="~/assets/images/register-to-vote.png"-->
<!--                alt="Diverse group of people standing in line at a voting event, holding papers and looking forward."-->
<!--              />-->
<!--            </div>-->
<!--            <div class="col-12 col-md">-->
<!--              <div class="text-wrapper">-->
<!--                <p class="mbr-text mbr-fonts-style display-7">-->
<!--                  The deadline to register to vote for the November 5th, 2024 election is fast approaching! Be sure to register or update your address by <strong>Monday, October 28, 2024</strong>, to ensure your voice is heard. Voting directly impacts key issues like healthcare, racial justice, climate policy, and housing, giving us the chance to choose leaders who truly represent our communities.-->
<!--                  <br><br>-->
<!--                  When voter turnout is low, <strong>it harms democracy</strong> by creating unrepresentative governments, often favoring wealthier, privileged groups—<i>just as we've seen locally</i>. By voting, we can challenge this imbalance and shape a more inclusive future. Register online, by mail, or in person—don’t wait! Register today on <a-->
<!--                    href="https://vote.gov/register/washington"-->
<!--                    target="_blank"-->
<!--                  >Washington’s election website</a>, and <strong>make a plan to vote early!</strong>-->
<!--                </p>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </section>-->

      <section
        id="features3-9"
        data-bs-version="5.1"
        class="features3 cid-ufjT3hlkXu"
      >
        <div class="container">
          <div class="row mt-4">
            <FeatureItem
              v-for="edge in $page.allFeatureItem.edges"
              :key="edge.node.id"
              :image-src="edge.node.imageSrc"
              :image-alt="edge.node.imageAlt"
              :title="edge.node.title"
              :description="edge.node.description"
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
query {
  allFeatureItem(sortBy: "order", order: ASC) {
    edges {
      node {
        id
        order
        imageSrc
        imageAlt
        title
        description
        link
        target
      }
    }
  }
  latestNews: allNewsMd(
    sort: [{by: "date", order: DESC}, {by: "order", order: DESC}] # Changed sorting
    limit: 10
  ) {
    edges {
      node {
        id
        title
        path
        date # Keep simple date for now, formatting can be done in template if needed
        slug # Added slug
        image {
          path
          alt
        }
      }
    }
  }
}
</page-query>

<script>
import FeatureItem from '@/components/FeatureItem.vue';
import LatestNews from '@/components/LatestNews.vue';

export default {
  name: 'Index',
  metaInfo() {
    return {
      title: 'Home', // Sets the page title
      meta: [
        {
          name: 'description',
          content: 'Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality, and promoting community events in Newcastle, WA.'
        }
      ]
    };
  },
  computed: {
    newsItems() {
      return this.$page.latestNews ? this.$page.latestNews.edges : [];
    }
  },
  components: {
    FeatureItem,
    LatestNews
  }
};
</script>

<style scoped>
/* Add any custom component-specific styles here */
.latest-news {
  padding: 2rem 0;
  background-color: #f8f9fa; /* Optional: background color for the section */
}
</style>
