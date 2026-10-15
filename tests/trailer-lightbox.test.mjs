import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trailerIdFrom, embedUrl, ASTRA_TRAILERS } from '../trailer-lightbox.js';

test('recognises Astra trailer links', () => {
  assert.equal(trailerIdFrom('https://www.youtube.com/watch?v=fNwTSZKmpis'), 'fNwTSZKmpis');
  assert.equal(trailerIdFrom('https://youtube.com/watch?v=96weNjdV0A4&t=3'), '96weNjdV0A4');
});

test('ignores other videos, sites and malformed links', () => {
  assert.equal(trailerIdFrom('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(trailerIdFrom('https://www.youtube.com/@astraproduction/videos'), null);
  assert.equal(trailerIdFrom('https://evil-youtube.com/watch?v=fNwTSZKmpis'), null);
  assert.equal(trailerIdFrom('not a url'), null);
});

test('embeds use the privacy-enhanced player', () => {
  for (const id of ASTRA_TRAILERS) assert.match(embedUrl(id), /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?autoplay=1/);
});

test('restored Hide and Seek trailer is playable', () => {
  assert.equal(trailerIdFrom('https://www.youtube.com/watch?v=luX6gA05Si4'), 'luX6gA05Si4');
});
