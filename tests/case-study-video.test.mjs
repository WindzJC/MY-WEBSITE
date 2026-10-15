import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../case-study-video.js', import.meta.url), 'utf8');

function setup(videoId) {
  const handlers = {};
  let frame;
  let created = 0;
  const player = {
    dataset: { videoId, videoTitle: 'Trailer' },
    querySelector: selector => selector === 'iframe' ? frame : {
      addEventListener: (_, callback) => { handlers.poster = callback; },
    },
    replaceChildren: value => { frame = value; },
    scrollIntoView: options => { assert.equal(options.behavior, 'instant'); },
  };
  const document = {
    querySelector: selector => selector === '[data-video-id]' ? player : {
      addEventListener: (_, callback) => { handlers.hero = callback; },
    },
    createElement: tag => {
      assert.equal(tag, 'iframe');
      created++;
      return { focus: options => { assert.equal(options.preventScroll, true); } };
    },
  };
  runInNewContext(source, { document });
  return { handlers, frame: () => frame, count: () => created };
}

for (const id of ['fNwTSZKmpis']) {
  test(`${id}: inert until activation, privacy embed, one player`, () => {
    const state = setup(id);
    assert.equal(state.count(), 0);
    let prevented = false;
    state.handlers.hero({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(state.frame().src, `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`);
    assert.equal(state.frame().allowFullscreen, true);
    assert.equal(state.frame().referrerPolicy, 'strict-origin-when-cross-origin');
    assert.match(state.frame().title, /YouTube video player/);
    state.handlers.poster();
    assert.equal(state.count(), 1);
  });
}

test('modified navigation does not activate playback', () => {
  const state = setup('fNwTSZKmpis');
  for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
    state.handlers.hero({ [modifier]: true, preventDefault() { assert.fail('Navigation intercepted'); } });
  }
  assert.equal(state.count(), 0);
});

test('unrecognized video ID fails closed', () => {
  const state = setup('unverified-video');
  state.handlers.poster();
  assert.equal(state.count(), 0);
});
