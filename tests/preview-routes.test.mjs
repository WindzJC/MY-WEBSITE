import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrlRoutes } from '../vite.config.js';

for (const hook of ['configureServer', 'configurePreviewServer']) {
  test(`${hook}: clean routes preserve query parameters without a server`, () => {
    let rewrite;
    cleanUrlRoutes()[hook]({ middlewares: { use(fn) { rewrite = fn; } } });
    for (const [url, expected] of [
      ['/our-work?type=websites', '/our-work.html?type=websites'],
      ['/projects/queen-of-intelligence?ref=portfolio', '/projects/queen-of-intelligence.html?ref=portfolio'],
      ['/privacy?ref=form', '/privacy/index.html?ref=form'],
      ['/author-websites', '/author-websites.html'],
      ['/api/inquiry?x=1', '/api/inquiry?x=1'],
      ['/assets/example.js?v=1', '/assets/example.js?v=1'],
    ]) {
      const req = { url };
      let next = false;
      rewrite(req, {}, () => { next = true; });
      assert.equal(req.url, expected);
      assert.equal(next, true);
    }
  });
}
