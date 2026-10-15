import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { getSiteUrl } from "./seo.config.mjs";

export function cleanUrlRoutes() {
  const rewrite = (req, _res, next) => {
    const originalUrl = req.url;
    const queryIndex = originalUrl.indexOf("?");
    const query = queryIndex < 0 ? "" : originalUrl.slice(queryIndex);
    req.url = queryIndex < 0 ? originalUrl : originalUrl.slice(0, queryIndex);
    if (req.url === "/privacy") req.url = "/privacy/index.html";
    if (req.url === "/author-websites") req.url = "/author-websites.html";
    if (req.url === "/book-trailers") req.url = "/book-trailers.html";
    if (req.url === "/our-work") req.url = "/our-work.html";
    if (req.url === "/our-work/book-trailers") req.url = "/our-work/book-trailers.html";
    if (req.url === "/our-work/author-websites") req.url = "/our-work/author-websites.html";
    if (req.url === "/discover-books") req.url = "/discover-books.html";
    for (const project of ["john-oross", "frank-roberts", "queen-of-intelligence", "hide-and-seek"]) {
      if (req.url === "/projects/" + project) req.url = "/projects/" + project + ".html";
    }
    if (req.url === "/thank-you") req.url = "/thank-you.html";
    req.url += query;
    next();
  };

  return {
    name: "clean-url-routes",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

function getPagePath(pathname = "/") {
  if (pathname === "/privacy" || pathname === "/privacy/" || pathname === "/privacy/index.html") {
    return "/privacy/";
  }
  if (pathname === "/author-websites" || pathname === "/author-websites.html") {
    return "/author-websites";
  }
  if (pathname === "/book-trailers" || pathname === "/book-trailers.html") return "/book-trailers";
  if (pathname === "/our-work" || pathname === "/our-work.html") return "/our-work";
  if (pathname === "/our-work/book-trailers" || pathname === "/our-work/book-trailers.html") return "/our-work/book-trailers";
  if (pathname === "/our-work/author-websites" || pathname === "/our-work/author-websites.html") return "/our-work/author-websites";
  if (pathname === "/discover-books" || pathname === "/discover-books.html") return "/discover-books";
  for (const project of ["john-oross", "frank-roberts", "queen-of-intelligence", "hide-and-seek"]) {
    if (pathname === "/projects/" + project || pathname === "/projects/" + project + ".html") return "/projects/" + project;
  }
  if (pathname === "/thank-you" || pathname === "/thank-you.html") {
    return "/thank-you";
  }
  return "/";
}

function seoMetaDefaults(siteUrl) {
  return {
    name: "seo-meta-defaults",
    transformIndexHtml(html, ctx) {
      const pagePath = getPagePath(ctx?.path || "/");
      const canonicalUrl = `${siteUrl}${pagePath}`;
      const ogImageUrl = `${siteUrl}/astra-productions-social.png`;

      return html
        .replaceAll("__CANONICAL_URL__", canonicalUrl)
        .replaceAll("__OG_IMAGE_URL__", ogImageUrl);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = getSiteUrl(env);

  return {
    appType: "mpa",
    plugins: [cleanUrlRoutes(), seoMetaDefaults(siteUrl)],
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), "index.html"),
          authorWebsites: resolve(process.cwd(), "author-websites.html"),
          bookTrailers: resolve(process.cwd(), "book-trailers.html"),
          ourWork: resolve(process.cwd(), "our-work.html"),
          workTrailers: resolve(process.cwd(), "our-work/book-trailers.html"),
          workWebsites: resolve(process.cwd(), "our-work/author-websites.html"),
          discoverBooks: resolve(process.cwd(), "discover-books.html"),
          projectHideAndSeek: resolve(process.cwd(), "projects/hide-and-seek.html"),
          projectJohnOross: resolve(process.cwd(), "projects/john-oross.html"),
          projectFrankRoberts: resolve(process.cwd(), "projects/frank-roberts.html"),
          projectQueenOfIntelligence: resolve(process.cwd(), "projects/queen-of-intelligence.html"),
          thankYou: resolve(process.cwd(), "thank-you.html"),
          privacy: resolve(process.cwd(), "privacy/index.html"),
        },
      },
    },
  };
});
