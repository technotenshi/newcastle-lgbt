import { defineEventHandler, setResponseHeader } from "h3";
import { queryCollection } from "@nuxt/content/server";
import { Feed } from "feed";
import { truncateSummary, parseMeta } from "../../utils/content";

const SITE_URL = "https://newcastle.lgbt";
const FEED_LIMIT = 20;

export default defineEventHandler(async (event) => {
  const rows = (await queryCollection(event, "content")
    .select("id", "path", "title", "description", "meta")
    .where("path", "LIKE", "/news/%")
    .all()) as Array<Record<string, unknown>>;

  const todayPacific = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date());

  const articles = rows
    .map((row) => {
      const meta = parseMeta(row.meta);
      return { row, meta };
    })
    .filter(({ meta }) => {
      if (meta.draft === true) return false;
      if (typeof meta.date === "string" && meta.date > todayPacific) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = typeof a.meta.date === "string" ? a.meta.date : "";
      const dateB = typeof b.meta.date === "string" ? b.meta.date : "";
      const diff = dateB.localeCompare(dateA);
      if (diff !== 0) return diff;
      return (Number(b.meta.order) || 0) - (Number(a.meta.order) || 0);
    })
    .slice(0, FEED_LIMIT);

  const feed = new Feed({
    title: "Newcastle LGBTQ Voice",
    description: "News and updates from the Newcastle, WA LGBTQ+ community.",
    id: `${SITE_URL}/`,
    link: `${SITE_URL}/`,
    language: "en",
    feedLinks: { rss2: `${SITE_URL}/feed.xml` },
    copyright: `© ${new Date().getFullYear()} Newcastle LGBTQ Voice`,
  });

  for (const { row, meta } of articles) {
    const date = typeof meta.date === "string" ? meta.date : undefined;
    const slug = typeof meta.slug === "string" ? meta.slug : undefined;
    if (!date || !slug) continue;

    const [year, rawMonth, rawDay] = date.split("-");
    if (!year || !rawMonth || !rawDay) continue;
    const month = rawMonth.padStart(2, "0");
    const day = rawDay.padStart(2, "0");
    const link = `${SITE_URL}/news/${year}/${month}/${day}/${slug}`;
    const pubDate = new Date(Date.UTC(Number(year), Number(rawMonth) - 1, Number(rawDay)));

    const rawDescription = typeof row.description === "string" ? row.description.trim() : "";
    const description = truncateSummary(rawDescription, 160) || "Read more at Newcastle LGBTQ Voice.";
    const title =
      typeof row.title === "string" && row.title.trim()
        ? row.title.trim()
        : typeof meta.title === "string"
          ? meta.title
          : "Untitled";

    feed.addItem({ title, id: link, link, description, date: pubDate });
  }

  setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "max-age=3600, s-maxage=3600");
  return feed.rss2();
});
