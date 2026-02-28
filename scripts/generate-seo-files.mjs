import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getSiteUrl, SITE_PATHS } from "../seo.config.mjs";

const siteUrl = getSiteUrl(process.env);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const now = new Date().toISOString().slice(0, 10);
const urls = SITE_PATHS.map(
  (path) => `<url><loc>${siteUrl}${path}</loc><lastmod>${now}</lastmod></url>`
).join("");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>
`;

const writeSeoFile = async (filePath, content) => {
  await mkdir(resolve(filePath, ".."), { recursive: true });
  await writeFile(filePath, content, "utf8");
};

await writeSeoFile(resolve(process.cwd(), "robots.txt"), robotsTxt);
await writeSeoFile(resolve(process.cwd(), "sitemap.xml"), sitemapXml);
await writeSeoFile(resolve(process.cwd(), "public/robots.txt"), robotsTxt);
await writeSeoFile(resolve(process.cwd(), "public/sitemap.xml"), sitemapXml);

console.log(`Generated robots.txt and sitemap.xml for ${siteUrl}`);
