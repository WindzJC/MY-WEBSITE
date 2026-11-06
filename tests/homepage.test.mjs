import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");
const homepageScript = await readFile(new URL("../script.js", import.meta.url), "utf8");

const section = (classOrId, endTag = "section") => {
  const pattern = classOrId.startsWith("#")
    ? new RegExp(`<section[^>]*id="${classOrId.slice(1)}"[\\s\\S]*?<\\/${endTag}>`)
    : new RegExp(`<section[^>]*class="[^"]*${classOrId}[^"]*"[\\s\\S]*?<\\/${endTag}>`);
  return homepage.match(pattern)?.[0] ?? "";
};

test("first screen states the problem, solution, outcome, and primary next step", () => {
  const hero = section("astra-cinema-hero");
  assert.match(hero, /MAKE THEM FEEL THE STORY\./);
  assert.match(hero, /GIVE THEM SOMEWHERE TO GO\./);
  assert.match(hero, /Someone discovers your book\. Where do they go next\?/);
  assert.match(hero, /GET MY FREE REVIEW/);
  assert.match(hero, /SEE OUR WORK/);
  assert.match(hero, /Play The Queen of Intelligence book trailer/);
  assert.ok(hero.indexOf("GET MY FREE REVIEW") < hero.indexOf("SEE OUR WORK"), "free review remains the primary hero action");
});

test("homepage proof balances real trailers with accurately labeled website work", () => {
  const proof = section("astra-cinema-featured");
  assert.match(proof, /CLIENT WEBSITE · IN PROGRESS/);
  assert.match(proof, /Jeffery Sealing/);
  assert.match(proof, /Robert S\. Maiden/);
  assert.match(proof, /David Graham/);
  assert.equal((proof.match(/<small>HOMEPAGE CONCEPT<\/small>/g) ?? []).length, 2);
  assert.match(proof, /10<\/strong><span>trailers and teasers/);
  assert.match(proof, /7<\/strong><span>author website projects/);
  assert.match(proof, /FREE<\/strong><span>three-point review, no obligation/);
  assert.doesNotMatch(proof, /CLIENT WEBSITE[^<]*Robert S\. Maiden|CLIENT WEBSITE[^<]*David Graham/i);
});

test("three core services use the approved public offer names", () => {
  const services = section("astra-cinema-services");
  assert.match(services, /AUTHOR WEBSITES/);
  assert.match(services, /CINEMATIC BOOK TRAILERS/);
  assert.match(services, /BOOK COVER DESIGN/);
  assert.doesNotMatch(services, /LAUNCH GRAPHICS|Cover &amp; Launch Graphics/i);
  for (const price of [699, 999, 299]) assert.match(services, new RegExp(`Starting at \\$${price} USD`));
  assert.match(services, /Promotional graphics quoted separately/);
});

test("the first featured pair exposes a trailer and client website without duplicate cards", () => {
  const pair = homepage.match(/<div class="astra-cinema-film-grid ah-featured-pair">([\s\S]*?)<\/article>\s*<\/div>/)?.[1];
  assert.ok(pair);
  assert.match(pair, /fNwTSZKmpis/);
  assert.match(pair, /jeffery-sealing-website\.pages\.dev/);
  assert.match(pair, /CLIENT WEBSITE · IN PROGRESS/);
  assert.equal((homepage.match(/alt="Homepage of Jeffery Sealing’s author website"/g) ?? []).length, 1);
  assert.doesNotMatch(homepage, /class="mobile-sticky-cta/);
});

test("reader journey is concise and does not promise sales", () => {
  const journey = section("#reader-journey");
  assert.equal((journey.match(/<li>/g) ?? []).length, 3);
  for (const label of ["Discovery", "Interest", "A clear destination"]) assert.match(journey, new RegExp(label));
  assert.match(journey, /does not create an audience by itself/i);
});

test("free review process is explicit and its fictional sample is optional", () => {
  const process = section("#process");
  assert.match(process, /Get three priorities/);
  assert.match(process, /Nothing starts until you agree\./);
  assert.match(process, /<details class="ah-sample">/);
  assert.match(process, /OPTIONAL EXAMPLE/);
  assert.match(process, /made-up novel/);
});

test("inquiry contract and legacy public anchors remain present", () => {
  for (const id of ["overview", "work", "reader-journey", "services", "process", "pricing", "about", "faq", "start"]) {
    assert.match(homepage, new RegExp(`id="${id}"`));
  }
  for (const name of ["bot_field", "inquiry_type", "user_name", "user_email", "author_website", "book_link", "service", "message", "deadline", "company", "genre", "extra_notes"]) {
    assert.match(homepage, new RegExp(`name="${name}"`));
  }
  assert.match(homepage, /value="review" checked/);
  assert.match(homepage, /value="quote"/);
  assert.match(homepage, /value="Book cover design">Book cover design/);

  const ids = [...homepage.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), []);
});

test("internal anchor focus persists until the destination loses focus", () => {
  assert.match(homepageScript, /needsTemporaryTabIndex/);
  assert.match(homepageScript, /addEventListener\("blur", \(\) => target\.removeAttribute\("tabindex"\), \{ once: true \}\)/);
  assert.doesNotMatch(homepageScript, /target\.focus\(\{ preventScroll: true \}\);\s*if \([^)]*\) target\.removeAttribute\("tabindex"\)/);
});
test("pricing differentiates quote-ready and exploring authors", () => {
  const pricing = section("#pricing");
  assert.match(pricing, /ah-bundle-actions/);
  assert.match(pricing, /REQUEST A PROJECT QUOTE/);
  assert.match(pricing, /data-inquiry-intent="quote"/);
  assert.match(pricing, /Exploring your options\? Get a free review/);
  assert.match(pricing, /data-inquiry-intent="review"/);
  assert.match(pricing, /Two revision rounds normally included/);
  assert.match(pricing, /30 days of post-launch website bug fixes/);
  assert.match(pricing, /Ownership and handoff follow the agreed terms/);
  assert.match(pricing, /domain registration, renewal and any paid hosting are separate/i);
  assert.match(homepageScript, /setInquiryMode\(link\.getAttribute\("data-inquiry-intent"\)\)/);
});
