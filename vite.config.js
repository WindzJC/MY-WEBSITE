import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { getSiteUrl } from "./seo.config.mjs";

function cleanUrlRoutes() {
  const rewrite = (req, _res, next) => {
    if (req.url === "/privacy") req.url = "/privacy/index.html";
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
    return "/privacy";
  }
  return "/";
}

function seoMetaDefaults(siteUrl) {
  return {
    name: "seo-meta-defaults",
    transformIndexHtml(html, ctx) {
      const pagePath = getPagePath(ctx?.path || "/");
      const canonicalUrl = `${siteUrl}${pagePath}`;
      const ogImageUrl = `${siteUrl}/LOGOASTRA.png`;

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
          privacy: resolve(process.cwd(), "privacy/index.html"),
        },
      },
    },
  };
});
