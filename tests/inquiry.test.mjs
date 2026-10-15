import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/inquiry.js';

// No native fetch reference is retained: every provider request is synthetic.
globalThis.fetch = async () => { throw new Error('Unexpected network request blocked'); };
const origin = 'https://preview.example.test';
const fixture = () => ({ user_name: 'Test <Reader> & "Writer"', user_email: 'owner@example.test',
  book_link: 'Book <script>alert(1)</script>', service: 'Book promotion / trailer',
  author_website: 'https://author.example.test', message: '<img src=x onerror=alert(1)>',
  bot_field: '', request_id: 'fixture-request-001', form_elapsed_ms: '2000', submitted_at: '2026-10-15T00:00:00.000Z' });

test('inquiry contract with network fully mocked', async t => {
  t.mock.method(Date, 'now', () => 1792022400000);
  t.mock.method(console, 'error', () => {});
  let calls = [], replies = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer dummy-not-a-secret');
    calls.push({ ...options, payload: JSON.parse(options.body) });
    const next = replies.shift() || { status: 200, body: { id: 'mock-provider-id' } };
    if (next.throw) throw new Error('Synthetic network failure');
    return Response.json(next.body || {}, { status: next.status });
  };
  async function submit({ body = fixture(), headers = {}, method = 'POST', env = { RESEND_API_KEY: 'dummy-not-a-secret' }, raw } = {}) {
    const request = new Request(origin + '/api/inquiry', { method,
      headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...headers },
      ...(method === 'GET' ? {} : { body: raw ?? JSON.stringify(body) }) });
    return onRequest({ request, env });
  }
  const cases = [
    ['GET', { method: 'GET' }, 405], ['cross origin', { headers: { Origin: 'https://other.example.test' } }, 403],
    ['missing origin', { headers: { Origin: '' } }, 403], ['cross site', { headers: { 'Sec-Fetch-Site': 'cross-site' } }, 403],
    ['missing key', { env: {} }, 503],
    ['invalid inquiry mode', { body: { ...fixture(), inquiry_type: 'unknown' } }, 400], ['content type', { headers: { 'Content-Type': 'text/plain' } }, 415],
    ['malformed JSON', { raw: '{' }, 400], ['array', { body: [] }, 400], ['null', { body: null }, 400],
    ['honeypot', { body: { ...fixture(), bot_field: 'bot' } }, 400],
    ...['user_name', 'user_email', 'book_link', 'service'].map(key => ['required ' + key, { body: { ...fixture(), [key]: '' } }, 400]),
    ...Object.entries({ user_email: 'invalid', author_website: 'javascript:alert(1)', form_elapsed_ms: 'NaN', submitted_at: 'invalid', message: 42 }).map(([key,value]) => ['invalid ' + key, { body: { ...fixture(), [key]: value } }, 400]),
    ...['1499', '7200001', ''].map(value => ['timing ' + value, { body: { ...fixture(), form_elapsed_ms: value } }, 400]),
    ['field limit', { body: { ...fixture(), message: 'x'.repeat(5001) } }, 400],
    ['byte limit', { raw: JSON.stringify({ extra: 'é'.repeat(12001) }) }, 413],
  ];
  for (const [name, options, status] of cases) await t.test(name, async () => {
    calls = []; const res = await submit(options); assert.equal(res.status, status); assert.equal(calls.length, 0);
    assert.equal(res.headers.get('cache-control'), 'no-store'); assert.equal((await res.json()).ok, false);
    if (status === 405) assert.equal(res.headers.get('allow'), 'POST');
  });
  await t.test('two ordered calls, escaping, reply addresses and stable idempotency', async () => {
    calls = []; const res = await submit(); assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, confirmationSent: true }); assert.equal(calls.length, 2);
    const [internal, confirmation] = calls;
    assert.deepEqual(internal.payload.to, ['jc@astraproductions.co']);
    assert.equal(internal.payload.reply_to, fixture().user_email);
    assert.deepEqual(confirmation.payload.to, [fixture().user_email]);
    assert.equal(confirmation.payload.reply_to, 'jc@astraproductions.co');
    for (const call of calls) { assert.ok(call.payload.html.includes('&lt;script&gt;')); assert.ok(!call.payload.html.includes('<script>')); assert.ok(call.payload.html.includes('&amp;')); }
    assert.ok(internal.payload.html.includes('&lt;img')); assert.ok(internal.payload.html.includes('&quot;'));
    assert.match(internal.headers['Idempotency-Key'], /^inquiry-window\/[a-f0-9]{40}$/);
    assert.equal(confirmation.headers['Idempotency-Key'], 'confirmation/fixture-request-001');
    await submit(); assert.equal(calls[2].headers['Idempotency-Key'], internal.headers['Idempotency-Key']);
    assert.equal(calls[3].headers['Idempotency-Key'], confirmation.headers['Idempotency-Key']);
  });
  await t.test('different authors on one shared IP use independent internal keys', async () => {
    calls = [];
    const first = await submit({ body: { ...fixture(), user_email: 'author-one@example.test', request_id: 'first-author-001' } });
    const second = await submit({ body: { ...fixture(), user_email: 'author-two@example.test', request_id: 'second-author-002' } });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(calls.length, 4);
    assert.notEqual(calls[0].headers['Idempotency-Key'], calls[2].headers['Idempotency-Key']);
    assert.deepEqual(calls[0].payload.to, ['jc@astraproductions.co']);
    assert.deepEqual(calls[2].payload.to, ['jc@astraproductions.co']);
  });
  await t.test('explicit quote inquiry reaches Astra and receives a quote-specific confirmation', async () => {
    calls = [];
    replies = [];
    const res = await submit({ body: { ...fixture(), inquiry_type: 'quote', request_id: 'quote-example-123' } });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, confirmationSent: true });
    assert.equal(calls.length, 2);
    assert.match(calls[0].payload.subject, /New Astra quote request/);
    assert.match(calls[0].payload.text, /Request type:\nProject quote request/);
    assert.match(calls[1].payload.text, /Thanks for requesting a project quote/);
    assert.doesNotMatch(calls[1].payload.text, /Thanks for requesting a free three-point review/);
    assert.ok(calls[1].payload.text.includes('\n\n'));
  });
  await t.test('explicit free review inquiry is labeled accurately', async () => {
    calls = [];
    replies = [];
    const res = await submit({ body: { ...fixture(), inquiry_type: 'review', request_id: 'review-example-123' } });
    assert.equal(res.status, 200);
    assert.match(calls[0].payload.subject, /New Astra free review/);
    assert.match(calls[0].payload.text, /Free 3-point review/);
    assert.match(calls[1].payload.text, /free three-point review/);
  });
  for (const failure of [{ status: 500 }, { throw: true }]) await t.test('internal failure ' + JSON.stringify(failure), async () => {
    calls = []; replies = [failure]; const res = await submit(); assert.equal(res.status, 502); assert.equal(calls.length, 1);
    assert.deepEqual(await res.json(), { ok: false, error: 'We could not send your request. Please try again.' });
  });
  await t.test('confirmation failure preserves accepted inquiry', async () => {
    calls = []; replies = [{ status: 200 }, { status: 500 }]; const res = await submit();
    assert.equal(res.status, 200); assert.deepEqual(await res.json(), { ok: true, confirmationSent: false }); assert.equal(calls.length, 2);
  });
  for (const name of ['invalid_idempotent_request', 'concurrent_idempotent_requests']) await t.test('simulated rate limit ' + name, async () => {
    calls = []; replies = [{ status: 409, body: { name } }]; const res = await submit();
    assert.equal(res.status, 429); assert.equal(res.headers.get('retry-after'), '300'); assert.equal((await res.json()).code, 'rate_limited'); assert.equal(calls.length, 1);
  });
});
