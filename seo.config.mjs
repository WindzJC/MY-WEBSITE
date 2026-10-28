export const DEFAULT_SITE_URL = "https://astraproductions.co";

export const SITE_PATHS = ["/", "/our-work", "/our-work/book-trailers", "/our-work/author-websites", "/book-trailers", "/author-websites", "/discover-books", "/projects/queen-of-intelligence", "/projects/hide-and-seek", "/privacy/"];

export function getSiteUrl(env = process.env) {
  const raw = env.VITE_SITE_URL || env.SITE_URL || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}
