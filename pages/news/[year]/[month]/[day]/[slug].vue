<template>
  <div v-if="articleData">
    <SectionHeader :title="articleTitle" />

    <NewsHeaderImage
      v-if="headerImage"
      :image-header="headerImage"
    />

    <NewsCommunityCarousel
      v-if="hasCarousel"
      :images="carouselImages"
    />

    <section class="news-article-section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10">
            <p
              v-if="formattedPublishDate"
              class="article-date mbr-text mbr-fonts-style display-7"
            >
              <time :datetime="articleData.date">{{ formattedPublishDate }}</time>
            </p>

            <ContentRenderer :value="articleData" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { createError, defineArticle, queryCollection, useAsyncData, useRoute, useSeoMeta, useSchemaOrg } from '#imports';
import NewsCommunityCarousel from '~/components/NewsCommunityCarousel.vue';
import NewsHeaderImage from '~/components/NewsHeaderImage.vue';
import SectionHeader from '~/components/SectionHeader.vue';
import { useSocialImage } from '~/composables/useSocialImage';
import { toPlainText, truncateSummary } from '~/utils/content.mjs';
import { findPublishedArticle, pacificToday } from '~/utils/news.mjs';

defineOptions({
  name: 'NewsArticlePage',
});

const route = useRoute();

const toParamString = (value) => {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : '';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return typeof value === 'string' ? value : '';
};

const sanitiseNumericParam = (value, digits) => {
  const numeric = toParamString(value).replace(/\D/g, '');

  if (!numeric) {
    return '';
  }

  const padded = digits ? numeric.padStart(digits, '0') : numeric;
  return digits ? padded.slice(-digits) : padded;
};

const year = sanitiseNumericParam(route.params.year, 4);
const month = sanitiseNumericParam(route.params.month, 2);
const day = sanitiseNumericParam(route.params.day, 2);
const slug = toParamString(route.params.slug).trim();

if (!year || year.length !== 4 || !month || !day || !slug) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found',
  });
}

const date = `${year}-${month}-${day}`;
const asyncKey = `news-article-${date}-${slug}`;

const { data: article } = await useAsyncData(asyncKey, async () => {
  const rows = await queryCollection('content')
    .select('id', 'path', 'title', 'description', 'meta', 'body')
    .where('path', 'LIKE', '/news/%')
    .all();

  const document = findPublishedArticle(Array.isArray(rows) ? rows : [], { date, slug }, pacificToday());

  if (!document) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Article not found',
    });
  }

  return document;
});

const articleData = computed(() => article.value ?? null);

const articleTitle = computed(() => {
  const title = articleData.value?.title;
  return typeof title === 'string' && title.trim() ? title.trim() : 'News Article';
});

const fallbackDescription = 'Stay informed with the latest updates from Newcastle LGBTQ Voice.';

const pageDescription = computed(() => {
  const doc = articleData.value;

  if (!doc) {
    return fallbackDescription;
  }

  const metaDescription =
    (typeof doc.description === 'string' && doc.description.trim()) ||
    (typeof doc.excerpt === 'string' && doc.excerpt.trim());

  if (metaDescription) {
    return metaDescription;
  }

  const plainText = toPlainText(doc.body).replace(/\s+/g, ' ').trim();

  if (plainText) {
    return truncateSummary(plainText, 160, { ellipsis: true });
  }

  return fallbackDescription;
});

const pageTitle = computed(() => articleTitle.value);

// Runs after the awaited article query so the image path is resolved, and
// synchronously in setup so prerenderRoutes has a Nuxt context. This is a plain
// string on purpose: do not wrap it in a getter or computed, which would run
// outside setup where prerenderRoutes cannot register the path.
const ogImageUrl = useSocialImage(articleData.value?.image?.path);

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogType: 'article',
  articlePublishedTime: () => articleData.value?.date ?? '',
  ogImage: ogImageUrl,
  twitterCard: 'summary_large_image',
  twitterImage: ogImageUrl,
});

useSchemaOrg([
  defineArticle({
    headline: () => articleTitle.value,
    datePublished: () => articleData.value?.date ?? '',
    image: ogImageUrl,
    description: () => pageDescription.value,
  }),
]);

const formattedPublishDate = computed(() => {
  const rawDate = articleData.value?.date;

  if (typeof rawDate !== 'string' || !rawDate) {
    return '';
  }

  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(rawDate);
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
});

const headerImage = computed(() => {
  const image = articleData.value?.imageHeader;

  if (!image || typeof image !== 'object') {
    return null;
  }

  const hasPath = typeof image.path === 'string' && image.path.trim().length > 0;
  const hasSrc = typeof image.src === 'string' && image.src.trim().length > 0;

  if (!hasPath && !hasSrc) {
    return null;
  }

  return image;
});

const carouselImages = computed(() => {
  const images = articleData.value?.carousel?.images;

  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((image) => {
    if (typeof image === 'string') {
      return image.trim().length > 0;
    }

    if (image && typeof image === 'object') {
      const hasSrc = typeof image.src === 'string' && image.src.trim().length > 0;
      const hasPath = typeof image.path === 'string' && image.path.trim().length > 0;
      return hasSrc || hasPath;
    }

    return false;
  });
});

const hasCarousel = computed(() => carouselImages.value.length > 0);
</script>

<style scoped>
.news-article-section {
  padding: 3rem 0;
}

.article-date {
  text-align: center;
  color: #6c757d;
  margin-bottom: 2rem;
}

.news-article-section :deep(p) {
  font-size: 1.08rem;
  line-height: 1.9;
  margin-bottom: 1.25rem;
}

.news-article-section :deep(h2) {
  font-family: 'Jost', sans-serif;
  font-size: 2rem;
  line-height: 1.5;
  margin-top: 3rem;
  margin-bottom: 0.6rem;
}

.news-article-section :deep(h3) {
  font-family: 'Jost', sans-serif;
  font-size: 1.2rem;
  line-height: 1.5;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}

.news-article-section :deep(blockquote) {
  font-size: 1.08rem;
  line-height: 1.9;
  padding: 0.75rem 1.5rem;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.news-article-section :deep(table) {
  display: block;
  overflow-x: auto;
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.7;
}

.news-article-section :deep(th),
.news-article-section :deep(td) {
  padding: 0.85rem 1rem;
  text-align: left;
  vertical-align: top;
  border: none;
  border-bottom: 1px solid #e2e2e2;
}

.news-article-section :deep(thead th) {
  background-color: #f4f4f4;
  font-family: 'Jost', sans-serif;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-bottom: 2px solid #d0d0d0;
}

.news-article-section :deep(tbody tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.025);
}

.news-article-section :deep(tbody tr:last-child td) {
  border-bottom: none;
}
</style>
