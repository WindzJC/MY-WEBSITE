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

test("first screen states what Astra does and the primary next step", () => {
  const hero = section("astra-cinema-hero");
  assert.match(hero, /<span>YOUR BOOKS\. YOUR STORY\.<\/span><span>YOUR OWN WEBSITE\.<\/span>/);
  assert.match(hero, /We help authors connect with readers, bring their stories to life, and make their books easier to discover and explore through bespoke author websites, cinematic book trailers, and distinctive book covers\./);
  assert.match(hero, /href="#start" data-inquiry-intent="concept"[^>]*>REQUEST A FREE HOMEPAGE CONCEPT/);
  assert.match(hero, /href="\/our-work"[^>]*>VIEW OUR WORK/);
  assert.match(hero, /See the creative direction before deciding\. No charge or obligation\./);
  assert.match(hero, /Play The Queen of Intelligence book trailer/);
  assert.equal((hero.match(/is-primary/g) ?? []).length, 1, "one primary hero action");
  assert.ok(hero.indexOf("REQUEST A FREE HOMEPAGE CONCEPT") < hero.indexOf("VIEW OUR WORK"), "concept is the primary hero action");
});

test("homepage proof balances real trailers with accurately labeled website work", () => {
  const proof = section("astra-cinema-featured");
  assert.match(proof, /COMMISSIONED AUTHOR WEBSITE/);
  assert.match(proof, /Jeffery Sealing/);
  assert.match(proof, /Robert S\. Maiden/);
  assert.match(proof, /David Graham/);
  assert.equal((proof.match(/<small>HOMEPAGE CONCEPT<\/small>/g) ?? []).length, 2);
  assert.doesNotMatch(proof, /ah-proof-facts|author website projects<\/span>/);
  assert.equal((proof.match(/COMMISSIONED AUTHOR WEBSITE/g) ?? []).length, 1);
  assert.ok(proof.indexOf('COMMISSIONED AUTHOR WEBSITE') < proof.indexOf('BOOK TRAILER'), 'commissioned author proof precedes the trailer');
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
  const pair = homepage.match(/<div class="astra-cinema-film-grid ah-featured-pair">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(pair);
  assert.match(pair, /fNwTSZKmpis/);
  assert.match(pair, /jeffery-sealing-website\.pages\.dev/);
  assert.match(pair, /COMMISSIONED AUTHOR WEBSITE/);
  assert.ok(pair.indexOf('Jeffery Sealing') < pair.indexOf('fNwTSZKmpis'), 'website first, trailer second');
  assert.equal((homepage.match(/alt="Homepage of Jeffery Sealing’s author website"/g) ?? []).length, 1);
  assert.doesNotMatch(homepage, /class="mobile-sticky-cta/);
});

test("reader journey is concise and does not promise sales", () => {
  const journey = section("#reader-journey");
  assert.equal((journey.match(/<li>/g) ?? []).length, 3);
  for (const label of ["Discovery", "Interest", "A clear destination"]) assert.match(journey, new RegExp(label));
  assert.match(journey, /does not create an audience by itself/i);
});

test("how it works explains the concept path and keeps review and quote routes", () => {
  const process = section("#process");
  for (const step of ["Tell us about your book", "See a free homepage concept", "Review your quote", "Go ahead if you choose"]) {
    assert.match(process, new RegExp(`<h3>${step}</h3>`));
  }
  assert.match(process, /If it’s a good fit/);
  assert.match(process, /not a finished website/);
  assert.match(process, /Nothing starts until you agree\./);
  assert.match(process, /data-inquiry-intent="review">Ask for a free 3-point review/);
  assert.match(process, /data-inquiry-intent="quote">request a project quote/);
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
  assert.match(homepage, /value="concept"/);
  assert.match(homepage, /value="quote"/);
  const choices = [...homepage.matchAll(/name="inquiry_type" value="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(choices, ["review", "concept", "quote"]);
  for (const label of ["Free 3-point review", "Request a free homepage concept", "Request a project quote"]) {
    assert.match(homepage, new RegExp(`<strong>${label}</strong>`));
  }
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
  assert.match(pricing, /Two standard revision rounds included/);
  assert.ok(pricing.indexOf('<h3>Author Website</h3>') < pricing.indexOf('class="is-featured ah-bundle"'), 'website is presented before optional bundle');
  assert.match(pricing, /30 days of post-launch website bug fixes/);
  assert.match(pricing, /Ownership and handoff follow the agreed terms/);
  assert.match(pricing, /Domain and hosting are separate/);
  assert.match(pricing, /additional functionality and later updates are quoted first/i);
  assert.match(pricing, /No Astra monthly subscription/);
  assert.match(homepageScript, /setInquiryMode\(link\.getAttribute\("data-inquiry-intent"\)\)/);
});

test("FAQ explains author updates, costs and realistic reader outcomes", () => {
  const faq = section("#faq");
  assert.match(faq, /Can Astra update my website when I publish another book/);
  assert.match(faq, /quoted and approved first/);
  assert.match(faq, /What.s included in the \$699 author website/);
  assert.match(faq, /two revision rounds/);
  assert.match(faq, /30 days of post-launch bug fixes/);
  assert.match(faq, /Traffic and book sales depend on many factors/);
});

test("homepage concept invitation sits inside the concept proof and preselects the concept route", () => {
  const proof = homepage.match(/<div class="ah-website-proof"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(proof, /See what your author website could become\./);
  assert.match(proof, /Request a complimentary homepage concept inspired by your book's cover and story\./);
  assert.match(proof, /confirm whether it's a fit before creating the concept/);
  assert.match(proof, /No charge\. No obligation\./);
  assert.match(proof, /href="#start" data-inquiry-intent="concept"[^>]*>REQUEST MY FREE HOMEPAGE CONCEPT/);
  assert.match(homepageScript, /concept: \{/);
  assert.match(homepageScript, /fromQuery === "concept"/);
});

test("FAQ separates the free review from the homepage concept", () => {
  const faq = section("#faq");
  assert.match(faq, /three useful recommendations about your reader journey/);
  assert.match(faq, /What is the free homepage concept\?/);
  assert.match(faq, /One bespoke first-draft direction/);
  assert.match(faq, /not a complete free website/);
  assert.match(faq, /no payment or obligation to view the draft/);
  assert.doesNotMatch(faq, /every request|limited spots|only \d+ (spots|concepts)/i);
});

test("Facebook and LinkedIn links are removed while YouTube remains", () => {
  assert.doesNotMatch(homepage, /facebook\.com|linkedin\.com/i);
  assert.match(homepage, /https:\/\/www\.youtube\.com\/@astraproduction/);
});

test("homepage sections use plain headings in the author journey order", () => {
  const headings = [...homepage.matchAll(/<h2 id="([^"]+)">([^<]+)/g)].map((match) => match[2].trim());
  assert.deepEqual(headings, [
    "Our Work",
    "Our Services",
    "Why You Need an Author Website",
    "How It Works",
    "Pricing",
    "A studio built around authors.",
    "An Author Spotlight, when it fits.",
    "Frequently Asked Questions",
    "Get in Touch",
  ]);
  assert.match(section("#pricing"), /Larger or more complex website projects are quoted according to their requirements\./);
  assert.match(section("#start"), /mailto:jc@astraproductions\.co/);
});

test("every page header offers Contact, and the mobile menu includes Home and Contact", async () => {
  const { readFile: read } = await import("node:fs/promises");
  const pages = ["index.html", "author-websites.html", "book-trailers.html", "our-work.html", "our-work/author-websites.html", "our-work/book-trailers.html", "discover-books.html", "privacy/index.html", "projects/hide-and-seek.html", "projects/queen-of-intelligence.html", "thank-you.html"];
  for (const page of pages) {
    const html = await read(new URL(`../${page}`, import.meta.url), "utf8");
    assert.match(html, /class="as-header-cta"[^>]*>(?:<span class="ah-cta-desktop">)?CONTACT US/, page);
    assert.match(html, /<nav aria-label="Mobile navigation"><a href="\/">Home<\/a>[\s\S]*?<a href="\/#start">Contact<\/a><\/nav>/, page);
    for (const link of ["/our-work", "/author-websites", "/book-trailers", "/#pricing", "/#about"]) {
      assert.match(html, new RegExp(`<nav class="as-desktop-nav"[^]*?href="${link}"`), page);
    }
  }
});
