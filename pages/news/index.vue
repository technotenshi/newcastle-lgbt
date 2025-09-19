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
        <div class="row mt-4">
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
import { queryCollection, useAsyncData, useSeoMeta } from '#imports';
import FeaturedNews from '~/components/FeaturedNews.vue';
import SectionHeader from '~/components/SectionHeader.vue';
import { useNews } from '~/composables/useNews';

defineOptions({
  name: 'NewsIndexPage',
});

const pageTitle = 'News | Newcastle LGBTQ Voice';
const pageDescription = "Welcome to Newcastle LGBTQ Voice! This is your go-to platform for amplifying LGBTQ voices, advocating for equality, and promoting community events in Newcastle, WA.";

definePageMeta({
  title: 'News',
});

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
});

const { data: newsData } = await useNews();
const { data: documentsData } = await useAsyncData('news-index-documents', async () => {
  const rows = await queryCollection('content')
    .select('id', 'meta', 'description', 'body')
    .where('path', 'LIKE', '/news/%')
    .all();

  const parseMeta = (input) => {
    if (!input) {
      return {};
    }

    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return {};
      }
    }

    if (typeof input === 'object') {
      return input;
    }

    return {};
  };

  const parseBody = (input) => {
    if (!input) {
      return undefined;
    }

    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return undefined;
      }
    }

    if (typeof input === 'object') {
      return input;
    }

    return undefined;
  };

  return (Array.isArray(rows) ? rows : []).map((row) => ({
    _id: typeof row.id === 'string' ? row.id : String(row.id ?? ''),
    meta: parseMeta(row.meta),
    description: typeof row.description === 'string' ? row.description : undefined,
    body: parseBody(row.body),
  }));
});

const documentsById = computed(() => {
  const entries = documentsData.value;
  const map = new Map();

  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (entry && typeof entry === 'object' && typeof entry._id === 'string') {
        map.set(entry._id, entry);
      }
    }
  }

  return map;
});

const toPlainText = (node) => {
  if (!node) {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(toPlainText).join(' ');
  }

  if (typeof node === 'object') {
    if (typeof node.value === 'string') {
      return node.value;
    }

    if (Array.isArray(node.children)) {
      return node.children.map(toPlainText).join(' ');
    }
  }

  return '';
};

const truncateSummary = (input, length = 160) => {
  if (input.length <= length) {
    return input;
  }

  const truncated = input.slice(0, length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
};

const extractSummary = (document) => {
  if (!document || typeof document !== 'object') {
    return '';
  }

  const meta = document.meta && typeof document.meta === 'object' ? document.meta : {};
  const excerptText = toPlainText(meta.excerpt);
  const metaDescription = toPlainText(meta.description);
  const documentDescription = typeof document.description === 'string' ? document.description : '';
  const bodyText = toPlainText(document.body);

  const cleanedSource = [excerptText, metaDescription, documentDescription, bodyText]
    .map((value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''))
    .find((value) => value.length > 0);

  if (!cleanedSource) {
    return '';
  }

  return truncateSummary(cleanedSource);
};

const formatPublishDate = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const articles = computed(() => {
  const entries = Array.isArray(newsData.value) ? newsData.value : [];

  return entries.map((entry) => {
    const document = documentsById.value.get(entry._id) ?? null;
    const title = typeof entry.title === 'string' && entry.title.trim() ? entry.title.trim() : 'Untitled Article';
    const summary = extractSummary(document) || 'Read the full story';
    const formattedDate = formatPublishDate(entry.date) || '';
    const imagePath = entry.image && typeof entry.image.path === 'string' ? entry.image.path : '';
    const imageAlt = entry.image && typeof entry.image.alt === 'string' && entry.image.alt.trim()
      ? entry.image.alt.trim()
      : `${title} image`;
    const link = typeof entry._path === 'string' && entry._path.trim()
      ? entry._path.trim()
      : typeof entry.sourcePath === 'string' && entry.sourcePath.trim()
        ? entry.sourcePath.trim()
        : '/';

    return {
      id: entry._id,
      title,
      summary,
      date: formattedDate,
      imageSrc: imagePath,
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
