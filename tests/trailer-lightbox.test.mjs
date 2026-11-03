import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

test('all ten Our Work trailer thumbnails open the on-page player, including the Queen trailer', async () => {
  for (const path of ['../our-work.html', '../our-work/book-trailers.html']) {
    const html = await readFile(new URL(path, import.meta.url), 'utf8');
    const cards = [...html.matchAll(/<article class="as-project-card">([\s\S]*?)<\/article>/g)]
      .map((match) => match[1])
      .filter((card) => card.includes('youtube.com/watch?v='));
    assert.equal(cards.length, 10, path + ': expected ten trailer cards');
    for (const card of cards) {
      const thumbnail = card.match(/<a class="as-video-thumb" href="(https:\/\/www\.youtube\.com\/watch\?v=([\w-]+))"[^>]*aria-label="Play [^"]+"><figure class="as-card-media">([\s\S]*?)<\/figure><\/a>/);
      assert.ok(thumbnail, path + ': every trailer thumbnail should be a labeled video link');
      assert.ok(ASTRA_TRAILERS.has(thumbnail[2]), path + ': video ID must be recognized by player');
      assert.match(thumbnail[3], /<span class="as-video-play" aria-hidden="true">▶<\/span>/);
    }

    const queen = cards.find((card) => card.includes('<h3>The Queen of Intelligence</h3>'));
    assert.ok(queen, path + ': Queen trailer must be present');
    assert.match(queen, /<a class="as-video-thumb" href="https:\/\/www\.youtube\.com\/watch\?v=fNwTSZKmpis"/);
    assert.match(queen, /aria-label="Play The Queen of Intelligence"/);
    assert.match(queen, /href="\/projects\/queen-of-intelligence">Read the case study/);
  }
});