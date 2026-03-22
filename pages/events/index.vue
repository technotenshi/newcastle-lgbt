<template>
  <div>
    <SectionHeader title="Events" />

    <template v-if="hasEvents">
      <section
        v-for="(event, index) in events"
        :id="`features17-7-${index}`"
        :key="event._id ?? index"
        data-bs-version="5.1"
        class="features17 cid-uf3QuR9bob"
      >
        <div class="container">
          <div class="content-wrapper">
            <div class="row align-items-center">
              <div class="col-12 col-lg-6">
                <div
                  v-if="event.imageSrc"
                  class="image-wrapper"
                >
                  <NuxtImg
                    :src="event.imageSrc"
                    :alt="event.imageAlt"
                    format="webp"
                    sizes="100vw lg:50vw"
                    loading="lazy"
                    class="img-fluid rounded-3"
                  />
                </div>
              </div>
              <div class="col-12 col-lg">
                <div class="text-wrapper">
                  <h6 class="card-title mbr-fonts-style display-5">
                    <strong>
                      {{ event.title }}<span v-if="event.displayDate"> - {{ event.displayDate }}</span>
                    </strong>
                  </h6>

                  <ContentRenderer
                    v-if="event.body"
                    :value="event"
                    class="mbr-text mbr-fonts-style mb-4 display-4 event-body"
                  />

                  <div
                    v-if="event.linkTarget && event.linkText"
                    class="mbr-section-btn mt-3"
                  >
                    <a
                      class="btn btn-primary display-4"
                      :href="event.linkTarget"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ event.linkText }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <section
      v-else
      class="content2 cid-uggfofTuig empty-state"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8 text-center">
            <p class="mbr-text mbr-fonts-style display-7">
              No upcoming events are available at the moment. Please check back soon.
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
import SectionHeader from '~/components/SectionHeader.vue';
import { useEvents } from '~/composables/useEvents';
import { normalizeAssetPath } from '~/utils/assets';
import { normaliseString } from '~/utils/content';

defineOptions({
  name: 'EventsIndexPage',
});

const pageTitle = 'Events | Newcastle LGBTQ Voice';
const pageDescription = "Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality, and promoting community events in Newcastle, WA.";

const siteUrl = 'https://newcastle.lgbt';
const defaultOgImage = `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/K59bqmorPm9qeV7qbg4Dozml.webp`;

definePageMeta({
  title: 'Events',
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
  link: [{ rel: 'canonical', href: `${siteUrl}/events` }],
});

const { data: eventsData } = await useEvents();

const calendarDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const defaultDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const parseCalendarDate = (value) => {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const formatEventDate = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const calendarDate = parseCalendarDate(trimmed);

  if (calendarDate) {
    return calendarDateFormatter.format(calendarDate);
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return defaultDateFormatter.format(parsed);
};

const events = computed(() => {
  const list = Array.isArray(eventsData.value) ? eventsData.value : [];

  return list.map((event) => {
    const title = normaliseString(event.title) ?? 'Untitled Event';
    const imagePath = normaliseString(event.image?.path);
    const imageAlt = normaliseString(event.image?.alt) ?? title;
    const linkTarget = normaliseString(event.link?.target);
    const linkText = normaliseString(event.link?.text);

    return {
      ...event,
      title,
      displayDate: formatEventDate(event.date),
      imageSrc: normalizeAssetPath(imagePath) || '',
      imageAlt,
      linkTarget,
      linkText,
    };
  });
});

const hasEvents = computed(() => events.value.length > 0);
</script>

<style scoped>
.empty-state {
  padding: 3rem 0;
}

:deep(.event-body p) {
  margin-bottom: 1rem;
}

.content-wrapper {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.content-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
