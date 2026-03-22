<template>
  <div>
    <section
      id="header14-1f"
      data-bs-version="5.1"
      class="header14 cid-sFzxmVl7J6"
    >
      <div class="container">
        <div class="row justify-content-center align-items-center">
          <div class="col-12 col-md-6 image-wrapper">
            <NuxtImg
              src="images/K59bqmorPm9qeV7qbg4Dozml.webp"
              alt="Newcastle LGBTQ Voice"
              format="webp"
              sizes="100vw md:50vw"
              loading="eager"
              fetchpriority="high"
              class="img-fluid"
            />
          </div>
          <div class="col-12 col-md">
            <div class="text-wrapper">
              <h1 class="mbr-section-title mbr-fonts-style mb-3 display-1">
                <strong>Newcastle LGBTQ Voice</strong>
              </h1>
              <p class="mbr-text mbr-fonts-style display-7">
                Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality,
                and promoting community events in Newcastle, WA. Here, you'll find news, educational resources, and updates on
                local LGBTQ events. Join us in standing against discrimination and celebrating diversity in our city. Stay
                informed, get involved, and help make Newcastle a more inclusive place for everyone.
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
            v-for="feature in features"
            :key="feature.id"
            :image-src="feature.imageSrc"
            :image-alt="feature.imageAlt"
            :title="feature.title"
            :description="feature.description"
            :link="feature.link"
            :target="feature.target ?? '_self'"
          />
        </div>
      </div>
    </section>

    <section
      v-if="hasLatestNews"
      class="latest-news"
    >
      <div class="container">
        <h2 class="mbr-section-title mbr-fonts-style align-center mb-4 display-2">
          <strong>Latest News</strong>
        </h2>
        <div class="row mt-4">
          <LatestNews
            v-for="article in latestNews"
            :key="article._id"
            :title="article.title ?? 'Untitled Article'"
            :path="article._path ?? '/'"
            :date="article.date ?? ''"
            :image="article.image ?? null"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/* global definePageMeta */
import { computed } from 'vue';
import { defineOrganization, useSeoMeta, useSiteConfig, useSchemaOrg } from '#imports';
import { useFeatures } from '~/composables/useFeatures';
import { useNews } from '~/composables/useNews';

definePageMeta({
  title: 'Home',
});

const { url: siteUrl } = useSiteConfig();
const defaultOgImage = `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/K59bqmorPm9qeV7qbg4Dozml.webp`;

useSeoMeta({
  title: 'Home',
  description:
    "Welcome to Newcastle LGBTQ Voice! Amplifying LGBTQ voices, sharing news, and supporting community events across Newcastle, Washington.",
  ogImage: defaultOgImage,
  twitterCard: 'summary_large_image',
  twitterImage: defaultOgImage,
});

useSchemaOrg([
  defineOrganization({
    name: 'Newcastle LGBTQ Voice',
    url: 'https://newcastle.lgbt',
    description: 'Amplifying LGBTQ voices, sharing news, and supporting community events across Newcastle, Washington.',
  }),
]);

const { data: featuresData } = await useFeatures();
const { data: latestNewsData } = await useNews({ limit: 6 });

const features = computed(() => featuresData.value ?? []);
const latestNews = computed(() => latestNewsData.value ?? []);
const hasLatestNews = computed(() => latestNews.value.length > 0);
</script>

<style scoped>
/* Add any custom component-specific styles here */
.latest-news {
  padding: 3rem 0; /* Increased padding slightly */
  background-color: #f8f9fa;
}

/* Styling for the section title, similar to other sections if applicable */
.latest-news .mbr-section-title {
  /* Ensure it matches other section titles, e.g. from features3-9 */
  /* text-align: center; already applied by align-center */
  /* margin-bottom: 1.5rem; or mb-4 as used */
}
</style>
