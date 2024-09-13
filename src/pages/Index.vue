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

      <section
        id="header14-1j"
        data-bs-version="5.1"
        class="header14 cid-sFzz5E692j"
      >
        <div class="container">
          <div class="row justify-content-center align-items-center">
            <div class="col-12 col-md-6 image-wrapper">
              <g-image
                src="~/assets/images/djEYRr8qMXjV5vygnVyYG6J7n.webp"
                alt="No Hate"
              />
            </div>
            <div class="col-12 col-md">
              <div class="text-wrapper">
                <p class="mbr-text mbr-fonts-style display-7">
                  A recent vote by Newcastle's city council saw a
                  majority (4-3) against raising the Pride flag at city hall for Pride Month, highlighting
                  underlying intolerance and privilege within the council. Mayor Robert Clark and council members
                  Pratima Lakhotia, Steve Tallman, and Tom Griffin voted against the motion. Clark argued that
                  raising the Pride flag could necessitate flying other divisive symbols, drawing an offensive
                  comparison between the Pride flag and hate symbols such as the Hamas flag and MAGA flag. He
                  claimed that the American flag is the only unifying symbol needed, a statement reflecting his
                  cisgender, heterosexual, white male privilege, which does not account for the experiences of
                  LGBTQ+ and other minoritized communities.<br><br>Councilmembers Paul Charbonneau, Sun Burford,
                  and Ariana Sherlock, who supported the motion, emphasized the importance of inclusivity and the
                  positive impact of the Pride flag on the local LGBTQ+ community. They highlighted that flying
                  the flag shows support and invites engagement from underrepresented groups. The real harm and
                  violence are experienced by LGBTQ+ individuals, not by those opposing the Pride flag. Burford
                  criticized the intolerant and outdated views of some council members, urging for leaders who
                  embrace diversity and acceptance. The decision underscores the disconnect between the privileged
                  perspectives of some leaders and the actual struggles faced by minoritized communities.<br>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
query { allFeatureItem(sortBy: "order", order: ASC) { edges { node { id order imageSrc imageAlt title description link target } } } }
</page-query>

<script>
import FeatureItem from '@/components/FeatureItem.vue';

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
    }
  }
}
</script>

<style scoped>
/* Add any custom component-specific styles here */
</style>
