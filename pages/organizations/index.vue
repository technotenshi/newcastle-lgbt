<template>
  <div>
    <SectionHeader title="Organizations" />

    <section
      id="team2-q"
      data-bs-version="5.1"
      class="team2 cid-ufpsOMqPgL"
    >
      <div class="container">
        <div
          v-for="organization in organizations"
          :key="organization.id"
          class="item features-image"
        >
          <div class="item-wrapper">
            <div class="row align-items-center">
              <div class="col-12 col-md-4">
                <div class="image-wrapper">
                  <a
                    :href="organization.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      :src="organization.image"
                      :alt="organization.imageAlt"
                      class="img-fluid"
                      loading="lazy"
                      decoding="async"
                    >
                  </a>
                </div>
              </div>
              <div class="col-12 col-md">
                <div class="card-box">
                  <h5 class="card-title mbr-fonts-style m-0 mb-3 display-5">
                    <strong v-if="organization.emphasize">
                      <a
                        :href="organization.url"
                        class="text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ organization.name }}
                      </a>
                    </strong>
                    <a
                      v-else
                      :href="organization.url"
                      class="text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ organization.name }}
                    </a>
                  </h5>

                  <p class="mbr-text mbr-fonts-style display-7">
                    {{ organization.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/* global definePageMeta */
import { useHead, useSeoMeta } from '#imports';
import SectionHeader from '~/components/SectionHeader.vue';
import pflagBellevueImage from '~/assets/images/GXwZyRMXemPZnNJrZZop2ev8g.webp';
import eastsidePrideImage from '~/assets/images/mJ12ldj01ZjqVeqjm6Avnp2mX.webp';
import genPrideImage from '~/assets/images/landscape-black-genpride.webp';
import prideAcrossBridgeImage from '~/assets/images/pride-across-the-bridge-logo2-600x540.webp';
import lambertHouseImage from '~/assets/images/pms211ulogobydannyarguetty-smallerforfacebook.webp';

defineOptions({
  name: 'OrganizationsPage',
});

const pageTitle = 'Organizations | Newcastle LGBTQ Voice';
const pageDescription = 'Discover LGBTQ+ organizations supporting inclusion, advocacy, and resources across the Eastside community.';

const siteUrl = 'https://newcastle.lgbt';
const defaultOgImage = `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/K59bqmorPm9qeV7qbg4Dozml.webp`;

definePageMeta({
  title: 'Organizations',
  description: pageDescription,
});

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: defaultOgImage,
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterCard: 'summary_large_image',
  twitterImage: defaultOgImage,
});

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/organizations` }],
});

const organizations = [
  {
    id: 'pflag-bellevue-eastside',
    name: 'PFLAG BELLEVUE EASTSIDE',
    url: 'https://pflagbellevue.org/',
    description:
      'PFLAG Bellevue is a local chapter of the national organization PFLAG, dedicated to supporting LGBTQ+ individuals, their families, and allies. They provide a welcoming and inclusive space for people to share their experiences and receive support, fostering a community of acceptance and understanding. PFLAG Bellevue offers various resources, educational programs, and advocacy efforts aimed at promoting equality and inclusion for all. By connecting individuals and families with the tools and support they need, PFLAG Bellevue plays a crucial role in building a more inclusive and accepting society. Learn more about their mission and how you can get involved by visiting their website.',
    image: pflagBellevueImage,
    imageAlt: 'PFLAG Bellevue Eastside logo',
    emphasize: true,
  },
  {
    id: 'eastside-pride-pnw',
    name: 'Eastside Pride PNW',
    url: 'https://www.eastsidepridepnw.com/',
    description:
      'Eastside Pride PNW is a vibrant organization dedicated to fostering an inclusive and supportive community for LGBTQ+ individuals and their allies in the Pacific Northwest. Their mission is to promote acceptance, equality, and understanding through community events, educational programs, and advocacy efforts. The website provides resources for LGBTQ+ individuals, families, and allies, featuring information on upcoming events, volunteer opportunities, and ways to get involved. With a focus on creating safe and welcoming spaces, Eastside Pride PNW is committed to celebrating diversity and empowering the LGBTQ+ community through education, support, and community engagement.',
    image: eastsidePrideImage,
    imageAlt: 'Eastside Pride PNW logo',
    emphasize: true,
  },
  {
    id: 'genpride',
    name: 'GenPride',
    url: 'https://genprideseattle.org/',
    description:
      'GenPride is a Seattle-based organization dedicated to supporting the unique needs of older LGBTQIA+ adults in King County. Through a variety of programs and services, GenPride fosters well-being and a sense of belonging among the community. Their initiatives include advocacy, educational workshops, and social events, all aimed at enhancing the quality of life for LGBTQIA+ seniors. A notable project is Pride Place, an affordable housing and community center in Capitol Hill, designed to provide safe and affirming spaces for LGBTQIA+ elders.',
    image: genPrideImage,
    imageAlt: 'GenPride logo',
    emphasize: false,
  },
  {
    id: 'pride-across-the-bridge',
    name: 'Pride Across the Bridge',
    url: 'https://prideacrossthebridge.org/',
    description:
      'Pride Across the Bridge is an East King County organization dedicated to creating a safe, inclusive, and equitable community for 2SLGBTQIA+ individuals. They achieve this through unique events, vetted resources, and local advocacy opportunities. Committed to diversity and acceptance, the organization elevates the voices of LGBTQIA+ and BIPOC communities. Their initiatives include the Big Book of All Things Queer, social events like D&D Game Nights, and resources for food, shelter, and severe weather. Donations support inclusive events and community resources.',
    image: prideAcrossBridgeImage,
    imageAlt: 'Pride Across the Bridge logo',
    emphasize: false,
  },
  {
    id: 'lambert-house',
    name: 'Lambert House',
    url: 'https://www.lamberthouse.org/',
    description:
      'Lambert House is a Seattle-based organization dedicated to empowering LGBTQ+ youth aged 10-22 through leadership development, social activities, and life skills. They offer over 30 different programs, activities, resources, and services, providing a safe and supportive environment where youth can build community, find friends, and receive support. Their drop-in center features amenities like a pool table, music station, library, and computer lab, and hosts various events and support groups. Lambert House aims to make life better for LGBTQ+ youth by fostering a sense of belonging and community.',
    image: lambertHouseImage,
    imageAlt: 'Lambert House logo',
    emphasize: false,
  },
];
</script>

<style scoped>
/* Add any custom component-specific styles here */
</style>
