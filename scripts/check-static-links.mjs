// Offline build check: no server, fetch, or external URL validation.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
const root = resolve('dist');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)]);
const files = walk(root), errors = [], external = new Set();
const locate = path => [resolve(root, '.' + path), resolve(root, '.' + path + '.html'), resolve(root, '.' + path, 'index.html')].find(p => files.includes(p));
let references = 0;
for (const file of files.filter(p => /\.(html|css|js)$/.test(p))) {
  const source = readFileSync(file, 'utf8');
  const refs = file.endsWith('.html') ? [...source.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map(m => m[1]) : file.endsWith('.css') ? [...source.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)].map(m => m[1]) : [];
  for (const ref of refs) {
    if (/^(?:https?:)?\/\//.test(ref)) { external.add(ref); continue; }
    if (/^(?:data:|mailto:|tel:)/.test(ref)) continue;
    references++;
    const url = new URL(ref.replaceAll('&amp;', '&'), 'https://offline.test/' + relative(root, file).replaceAll('\\', '/'));
    const target = locate(decodeURIComponent(url.pathname));
    if (!target) { errors.push(`${relative(root, file)}: missing ${ref}`); continue; }
    if (url.hash && target.endsWith('.html')) {
      const ids = [...readFileSync(target, 'utf8').matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
      if (!ids.includes(decodeURIComponent(url.hash.slice(1)))) errors.push(`${relative(root, file)}: missing anchor ${ref}`);
    }
  }
  if (file.endsWith('.html')) {
    if (/__(?:CANONICAL_URL|OG_IMAGE_URL)__/.test(source)) errors.push(`${file}: unresolved SEO token`);
    const production = process.env.SITE_INDEXABLE === 'true' || process.env.CF_PAGES_BRANCH === 'main';
    const noindex = /<meta name="robots" content="noindex, follow"/.test(source);
    const privatePage = /john-oross|thank-you/.test(file);
    if (!production && !noindex) errors.push(`${file}: preview is not noindex`);
    if (production && !privatePage && noindex) errors.push(`${file}: live page is noindex`);
    if (production && privatePage && !noindex) errors.push(`${file}: private page is indexable`);
  }
}
console.log(JSON.stringify({ pages: files.filter(p => p.endsWith('.html')).length, references, externalUrlsUnverified: external.size, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
