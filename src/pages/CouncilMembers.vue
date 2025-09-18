<template>
  <Layout>
    <div>
      <!-- Content will be added here -->

      <SectionHeader
        title="Newcastle Council Members"
      />

      <section
        id="content7-m"
        data-bs-version="5.1"
        class="content7 cid-ufk8Tj1y0q"
      >
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-10">
              <blockquote>
                <h5 class="mbr-section-title mbr-fonts-style mb-2 display-7">
                  <strong>Note</strong>
                </h5>
                <p class="mbr-text mbr-fonts-style display-4">
                  - All the information contained and shown here comes
                  from public sources, specifically the Newcastle City website at <a
                    href="https://www.newcastlewa.gov/cms/One.aspx?portalId=4026119&pageId=12768370"
                    class="text-primary"
                    target="_blank"
                  >Newcastle City Council</a>.<br><br>- Each council
                  member has their own email address as shown below, yet you can reach the whole council using the
                  email <a
                    href="mailto:citycouncil@newcastlewa.gov"
                    class="text-primary"
                  >citycouncil@newcastlewa.gov</a>.<br><br>-
                  The pride flag (🏳️‍🌈) next to some of the council members' emails denotes the person's proven
                  support for the LGBTQ+ community.
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <CouncilMembersComponent
        v-for="edge in $page.allCouncilMembersMd.edges"
        :key="edge.node.position"
        :position="edge.node.title"
        :name="edge.node.name"
        :email="edge.node.email"
        :flag="edge.node.flag"
        :bio="edge.node.content"
        :image="edge.node.image"
      />
    </div>
  </Layout>
</template>

<page-query>
{
allCouncilMembersMd (sortBy: "position", order: ASC) {
edges {
node {
title
date
position
name
email
flag
content
image
}
}
}
}
</page-query>

<script>
import SectionHeader from '~/components/SectionHeader.vue';
import CouncilMembersComponent from '~/components/CouncilMembersComponent.vue';

export default {
  name: 'CouncilMembers',
  metaInfo() {
    return {
      title: 'Newcastle Council Members', // Sets the page title
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
    CouncilMembersComponent,
  }
};
</script>

<style scoped>
/* Add any custom component-specific styles here */
</style>
