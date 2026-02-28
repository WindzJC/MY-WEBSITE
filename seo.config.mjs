export const DEFAULT_SITE_URL = "https://astraproductionsbyjc.pages.dev";

export const SITE_PATHS = ["/", "/privacy"];

export function getSiteUrl(env = process.env) {
  const raw = env.VITE_SITE_URL || env.SITE_URL || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}
