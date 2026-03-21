<template>
  <div>
    <SectionHeader title="Newcastle Council Members" />

    <section
      id="image3-council"
      data-bs-version="5.1"
      class="image3 cid-uhK9q2n4fC mt-4"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10">
            <div class="image-wrapper">
              <img
                :src="councilPhoto"
                alt="Newcastle City Council placeholder image"
                width="750"
                height="430"
                class="img-fluid rounded-3"
                decoding="async"
                loading="lazy"
              >
            </div>
          </div>
        </div>
      </div>
    </section>

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
                - All the information shown here comes from public sources, specifically the Newcastle City website at
                <a
                  href="https://www.newcastlewa.gov/cms/One.aspx?portalId=4026119&pageId=12768370"
                  class="text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >Newcastle City Council</a>.<br><br>
                - Each council member has their own email address as shown below, yet you can reach the whole council using the
                email
                <a
                  href="mailto:citycouncil@newcastlewa.gov"
                  class="text-primary"
                >citycouncil@newcastlewa.gov</a>.<br><br>
                - The pride flag (🏳️‍🌈) next to some of the council members' emails denotes the person's proven support for the LGBTQ+
                community.
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>

    <template v-if="hasMembers">
      <CouncilMembersComponent
        v-for="member in members"
        :key="member.id"
        :position="member.position"
        :name="member.name"
        :email="member.email"
        :flag="member.flag"
        :bio="member.bio"
        :image="member.image"
      />
    </template>

    <section
      v-else
      class="content2 cid-uggfofTuig empty-state"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8 text-center">
            <p class="mbr-text mbr-fonts-style display-7">
              Council member information is temporarily unavailable. Please check back soon.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/* global definePageMeta */
import { computed } from 'vue';
import { useHead, useSeoMeta } from '#imports';
import CouncilMembersComponent from '~/components/CouncilMembersComponent.vue';
import SectionHeader from '~/components/SectionHeader.vue';
import { useCouncil } from '~/composables/useCouncil';
import councilPhoto from '~/assets/images/council-members/20260101-council-members.png';
import { normaliseString } from '~/utils/content';

defineOptions({
  name: 'CouncilMembersIndexPage',
});

const pageTitle = 'Council Members | Newcastle LGBTQ Voice';
const pageDescription = 'Meet the Newcastle City Council members and learn about their commitment to an inclusive community.';

const siteUrl = 'https://newcastle.lgbt';
const defaultOgImage = `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/K59bqmorPm9qeV7qbg4Dozml.webp`;

definePageMeta({
  title: 'Council Members',
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
  link: [{ rel: 'canonical', href: `${siteUrl}/council-members` }],
});

const { data: councilData } = await useCouncil();

const members = computed(() => {
  const entries = Array.isArray(councilData.value) ? councilData.value : [];

  return entries.map((member, index) => {
    const identifier = typeof member._id === 'string' && member._id.trim()
      ? member._id.trim()
      : `council-member-${index}`;
    const title = normaliseString(member.title);
    const numericPosition = typeof member.position === 'number' ? member.position : undefined;
    const positionLabel = title ?? (typeof numericPosition === 'number' ? `Position ${numericPosition}` : '');

    return {
      id: identifier,
      position: positionLabel,
      name: normaliseString(member.name) ?? '',
      email: normaliseString(member.email) ?? '',
      flag: normaliseString(member.flag) ?? '',
      bio: member.bio ?? null,
      image: normaliseString(member.image) ?? '',
    };
  });
});

const hasMembers = computed(() => members.value.length > 0);
</script>

<style scoped>
.empty-state {
  padding: 4rem 0;
}
</style>
