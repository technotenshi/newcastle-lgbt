<template>
  <div>
    <SectionHeader title="News" />

    <section
      v-if="hasArticles"
      id="content2-1c"
      data-bs-version="5.1"
      class="content2 cid-uggfofTuig"
    >
      <div class="container">
        <div class="row g-4 mt-2">
          <FeaturedNews
            v-for="article in articles"
            :key="article.id"
            :image-src="article.imageSrc"
            :image-alt="article.imageAlt"
            :title="article.title"
            :date="article.date"
            :summary="article.summary"
            :link="article.link"
            :target="article.target"
          />
        </div>
      </div>
    </section>

    <section
      v-else
      class="content2 cid-uggfofTuig empty-state"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8 text-center">
            <p class="mbr-text mbr-fonts-style display-7">
              No news articles are available at the moment. Please check back later.
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
import { useSeoMeta } from '#imports';
import { useSocialImage } from '~/composables/useSocialImage';
import FeaturedNews from '~/components/FeaturedNews.vue';
import SectionHeader from '~/components/SectionHeader.vue';
import { useNews } from '~/composables/useNews';
import { normalizeAssetPath } from '~/utils/assets';
import { normaliseString } from '~/utils/content';

defineOptions({
  name: 'NewsIndexPage',
});

const pageTitle = 'News';
const pageDescription = "Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality, and promoting community events in Newcastle, WA.";

definePageMeta({
  title: 'News',
});

const defaultOgImage = useSocialImage();

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogImage: defaultOgImage,
  twitterCard: 'summary_large_image',
  twitterImage: defaultOgImage,
});

const { data: newsData } = await useNews();

const formatPublishDate = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) {
    return '';
  }
  const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

/**
 * Normalises fetched news entries into the card-friendly shape consumed by the template.
 */
const articles = computed(() => {
  const entries = Array.isArray(newsData.value) ? newsData.value : [];

  return entries.map((entry) => {
    const title = normaliseString(entry.title) ?? 'Untitled Article';
    const summary = entry.summary || 'Read the full story';
    const formattedDate = formatPublishDate(entry.date) || '';
    const imageObj = entry.image && typeof entry.image === 'object' ? entry.image : null;
    const imagePath = imageObj?.path;
    const imageSrc = normalizeAssetPath(imagePath) || '';
    const imageAlt = normaliseString(imageObj?.alt) ?? `${title} image`;
    const link = normaliseString(entry._path)
      ?? normaliseString(entry.sourcePath)
      ?? '/';

    return {
      id: entry._id,
      title,
      summary,
      date: formattedDate,
      imageSrc,
      imageAlt,
      link,
      target: '_self',
    };
  });
});

const hasArticles = computed(() => articles.value.length > 0);
</script>

<style scoped>
.empty-state {
  padding: 3rem 0;
}
</style>
