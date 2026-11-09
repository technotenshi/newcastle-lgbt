import { defineEventHandler, setResponseHeader } from "h3";
import { queryCollection } from "@nuxt/content/server";
import { Feed } from "feed";
import { listFeedItems, pacificToday } from "../../utils/news.mjs";

const SITE_URL = "https://newcastle.lgbt";
const FEED_LIMIT = 20;

export default defineEventHandler(async (event) => {
  const rows = (await queryCollection(event, "content")
    .select("id", "path", "title", "description", "meta")
    .where("path", "LIKE", "/news/%")
    .all()) as Array<Record<string, unknown>>;

  const feed = new Feed({
    title: "Newcastle LGBTQ Voice",
    description: "News and updates from the Newcastle, WA LGBTQ+ community.",
    id: `${SITE_URL}/`,
    link: `${SITE_URL}/`,
    language: "en",
    feedLinks: { rss2: `${SITE_URL}/feed.xml` },
    copyright: `© ${new Date().getFullYear()} Newcastle LGBTQ Voice`,
  });

  for (const item of listFeedItems(rows, pacificToday(), FEED_LIMIT)) {
    const link = `${SITE_URL}${item.path}`;

    feed.addItem({
      title: item.title,
      id: link,
      link,
      description: item.description || "Read more at Newcastle LGBTQ Voice.",
      date: item.published,
    });
  }

  setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "max-age=3600, s-maxage=3600");
  return feed.rss2();
});
