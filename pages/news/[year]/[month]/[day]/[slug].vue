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
import { createError, defineArticle, queryCollection, useAsyncData, useRoute, useSeoMeta, useSiteConfig, useSchemaOrg } from '#imports';
import NewsCommunityCarousel from '~/components/NewsCommunityCarousel.vue';
import NewsHeaderImage from '~/components/NewsHeaderImage.vue';
import SectionHeader from '~/components/SectionHeader.vue';
import { normalizeAssetPath } from '~/utils/assets';

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
const canonicalPath = `/news/${year}/${month}/${day}/${slug}`;
const asyncKey = `news-article-${date}-${slug}`;

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

const coerceNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
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

const { data: article } = await useAsyncData(asyncKey, async () => {
  const rows = await queryCollection('content')
    .select('id', 'path', 'title', 'description', 'meta', 'body')
    .where('path', 'LIKE', '/news/%')
    .all();

  const entries = Array.isArray(rows) ? rows : [];

  for (const row of entries) {
    const meta = parseMeta(row.meta);
    const metaSlug = typeof meta.slug === 'string' ? meta.slug : undefined;
    const metaDate = typeof meta.date === 'string' ? meta.date : undefined;

    if (metaSlug !== slug || metaDate !== date) {
      continue;
    }

    const todayPacific = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
    }).format(new Date());
    if (typeof metaDate === 'string' && metaDate > todayPacific) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' });
    }

    const defaultPath = typeof row.path === 'string' ? row.path : '';
    const titleFromRow = typeof row.title === 'string' ? row.title : undefined;
    const descriptionFromRow = typeof row.description === 'string' ? row.description : undefined;
    const titleFromMeta = typeof meta.title === 'string' ? meta.title : undefined;
    const descriptionFromMeta = typeof meta.description === 'string' ? meta.description : undefined;

    const document = {
      _id: typeof row.id === 'string' ? row.id : String(row.id ?? ''),
      _path: canonicalPath,
      sourcePath: defaultPath || undefined,
      title: titleFromRow?.trim() ? titleFromRow : titleFromMeta,
      description: descriptionFromRow?.trim() ? descriptionFromRow : descriptionFromMeta,
      date: metaDate,
      slug: metaSlug,
      order: coerceNumber(meta.order),
      image: typeof meta.image === 'object' && meta.image !== null ? meta.image : undefined,
      imageHeader: typeof meta.imageHeader === 'object' && meta.imageHeader !== null ? meta.imageHeader : undefined,
      carousel: typeof meta.carousel === 'object' && meta.carousel !== null ? meta.carousel : undefined,
      draft: meta.draft === true,
      _draft: meta._draft === true,
      body: parseBody(row.body),
      meta,
    };

    if (typeof meta.seo === 'object' && meta.seo !== null) {
      document.seo = meta.seo;
    }

    if (typeof meta.excerpt === 'object' && meta.excerpt !== null) {
      document.excerpt = meta.excerpt;
    } else if (typeof meta.excerpt === 'string') {
      document.excerpt = meta.excerpt;
    }

    return document;
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found',
  });
});

const articleData = computed(() => article.value ?? null);

const articleTitle = computed(() => {
  const title = articleData.value?.title;
  return typeof title === 'string' && title.trim() ? title.trim() : 'News Article';
});

const fallbackDescription = 'Stay informed with the latest updates from Newcastle LGBTQ Voice.';

const toPlainText = (node) => {
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
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

const truncateSnippet = (input, length) => {
  if (input.length <= length) {
    return input;
  }

  const truncated = input.slice(0, length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return `${truncated.slice(0, lastSpace).trim()}…`;
  }

  return `${truncated.trim()}…`;
};

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
    return truncateSnippet(plainText, 160);
  }

  return fallbackDescription;
});

const pageTitle = computed(() => articleTitle.value);

const { url: siteUrl } = useSiteConfig();

const ogImageUrl = computed(() => {
  const imagePath = normalizeAssetPath(articleData.value?.image?.path || '');
  return imagePath
    ? `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/${imagePath}`
    : `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/K59bqmorPm9qeV7qbg4Dozml.webp`;
});

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogType: 'article',
  articlePublishedTime: () => articleData.value?.date ?? '',
  ogImage: () => ogImageUrl.value,
  twitterCard: 'summary_large_image',
  twitterImage: () => ogImageUrl.value,
});

useSchemaOrg([
  defineArticle({
    headline: () => articleTitle.value,
    datePublished: () => articleData.value?.date ?? '',
    image: () => ogImageUrl.value,
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
</style>
