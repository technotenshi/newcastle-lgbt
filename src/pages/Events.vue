<template>
  <Layout>
    <div>
      <!-- Content will be added here -->

      <SectionHeader
        title="Events"
      />

      <section
        id="features17-7"
        data-bs-version="5.1"
        class="features17 cid-uf3QuR9bob"
      >
        <div class="container">
          <div class="content-wrapper">
            <div class="row align-items-center">
              <div class="col-12 col-lg-6">
                <div class="image-wrapper">
                  <g-image src="~/assets/images/2E0NWnKvzb1BqD4WVdPAD9BBp.webp" />
                </div>
              </div>
              <div class="col-12 col-lg">
                <div class="text-wrapper">
                  <h6 class="card-title mbr-fonts-style display-5">
                    <strong>Newcastle pride recognition - June 18th</strong>
                  </h6>
                  <p class="mbr-text mbr-fonts-style mb-4 display-4">
                    Due to the Newcastle City Council's recent
                    vote based on intolerance and ignorance, our community has been deeply affected. We want to
                    make it clear that Newcastle stands for inclusivity, safety, and welcome for our LGBTQ+
                    neighbors. Join us in a peaceful and joyous gathering at <strong>Lake Boren Park on June
                      18th at 5 PM</strong>, adorned in our most vibrant rainbow colors. Together, we'll
                    celebrate our unity and resilience with inspiring speeches before marching as a proud group
                    to City Hall for the regular council meeting at 7 PM.<br><br>We aim to fill the council
                    chamber with the spirit of Pride, encouraging respectful public comments to ensure our
                    voices are heard by those who voted against LGBTQ+ visibility. We invite everyone to bring
                    Pride-related clothing, flags, and items to donate, showing our collective support. For more
                    details, watch KING 5's coverage of the council meeting and hear the statements from Mayor
                    Clark and Councilmember Tallman. Share your thoughts and take action by contacting
                    Newcastle's Council at <a
                      href="mailto:citycouncil@newcastle.gov"
                      class="text-primary"
                    >citycouncil@newcastle.gov</a>.
                    Let's come together and make a powerful statement for equality and acceptance!
                  </p>
                  <div class="mbr-section-btn mt-3">
                    <a
                      class="btn btn-primary display-4"
                      href="https://www.facebook.com/events/344702428644024/"
                      target="_blank"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features17-a"
        data-bs-version="5.1"
        class="features17 cid-ufjXNdzJl7"
      >
        <div class="container">
          <div class="content-wrapper">
            <div class="row align-items-center">
              <div class="col-12 col-lg-6">
                <div class="image-wrapper">
                  <g-image src="~/assets/images/2xnDjoxlzkBXY90EbKqdj0q6p.webp" />
                </div>
              </div>
              <div class="col-12 col-lg">
                <div class="text-wrapper">
                  <h6 class="card-title mbr-fonts-style display-5">
                    <strong>Stand for Equality in
                      Newcastle</strong>
                  </h6>
                  <p class="mbr-text mbr-fonts-style mb-4 display-4">
                    Newcastle's recent decision to not raise the
                    Pride flag at City Hall is a clear message of exclusion and intolerance. This choice
                    undermines the values of diversity, acceptance, and community that we hold dear. Our mission
                    is to show Mayor Clark and the councilmembers who voted against this symbolic gesture that
                    their decision does not reflect the inclusive spirit of Newcastle.<br><br>We urge you to
                    stand with us by signing our petition and joining our efforts to promote LGBTQ+ visibility
                    and equality. Together, we can make it clear that Newcastle is a place where everyone,
                    regardless of their sexual orientation or gender identity, is valued and respected. Your
                    support is crucial in sending a powerful message that love and acceptance will always
                    triumph over hate and ignorance. Sign the petition and join us in making a difference.
                  </p>
                  <div class="mbr-section-btn mt-3">
                    <a
                      class="btn btn-primary display-4"
                      href="https://www.change.org/p/show-the-newcastle-mayor-his-anti-lgbtq-vote-is-wrong?recruiter=928553248&recruited_by_id=41db08b0-164c-11e9-b778-4dfd15f5caee&utm_source=share_petition&utm_campaign=share_petition&utm_term=share_for_starters_page&utm_medium=copylink&utm_content=cl_sharecopy_490091320_en-US%3A7"
                      target="_blank"
                    >Sign the petition</a>
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
