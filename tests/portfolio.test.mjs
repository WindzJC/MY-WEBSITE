import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const servicePage = await readFile(new URL("../author-websites.html", import.meta.url), "utf8");
const portfolioPage = await readFile(new URL("../our-work/author-websites.html", import.meta.url), "utf8");
const overviewPage = await readFile(new URL("../our-work.html", import.meta.url), "utf8");

test("author website portfolio contains seven projects including Robert S. Maiden", () => {
  const grid = portfolioPage.match(/<div class="as-project-grid as-website-project-grid">([\s\S]*?)<\/div><\/section>/)?.[1];
  assert.ok(grid, "author website project grid is present");
  assert.equal((grid.match(/<article class="as-project-card">/g) ?? []).length, 7);
  assert.match(grid, /Homepage concept · Dark fantasy &amp; short stories/);
  assert.match(grid, /Robert S\. Maiden — All for Her, Them, and Me/);
  assert.match(grid, /https:\/\/robert-maiden-website\.pages\.dev\//);
  assert.match(grid, /\/case-studies\/robert-maiden-author-website\.webp/);
  assert.doesNotMatch(grid, /Client website[^<]*Robert S\. Maiden|Robert S\. Maiden[^<]*Client website/i);
});

test("author website service page includes Robert as a homepage concept", () => {
  assert.match(servicePage, /HOMEPAGE CONCEPT \/ ROBERT S\. MAIDEN/);
  assert.match(servicePage, /<h3>All for Her, Them, and Me<\/h3>/);
  assert.match(servicePage, /including <cite>It’s a Puzzle<\/cite>/);
  assert.match(servicePage, /SEE ALL SEVEN WEBSITES/);
});

test("main Our Work page displays the seven verified author website projects", () => {
  const section = overviewPage.match(/<section class="as-section" id="websites">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, "Our Work website section is present");
  assert.match(section, /One client website and six homepage concepts/);
  const cards = section.match(/<article class="as-project-card">/g) ?? [];
  assert.equal(cards.length, 7, "all seven projects are on the main Our Work page");

  for (const url of [
    "jeffery-sealing-website.pages.dev",
    "david-graham-website.pages.dev",
    "predator-awareness-website.pages.dev",
    "michael-s-website-2m5.pages.dev",
    "mark-website-eij.pages.dev",
    "tony-website.pages.dev",
    "robert-maiden-website.pages.dev",
  ]) {
    assert.ok(section.includes(url), "Missing website: " + url);
  }

  const robertPattern = /<article class="as-project-card"><a class="as-site-thumb" href="https:\/\/robert-maiden-website\.pages\.dev\/"[\s\S]*?<\/article>/;
  const overviewCard = section.match(robertPattern)?.[0];
  const canonicalCard = portfolioPage.match(robertPattern)?.[0];
  assert.ok(overviewCard && canonicalCard, "Robert card present on both portfolio pages");
  assert.equal(overviewCard, canonicalCard, "main overview reuses the approved Robert card exactly");
  assert.match(overviewCard, /Homepage concept/);
  assert.match(overviewCard, /robert-maiden-author-website\.webp/);
  assert.equal((overviewPage.match(/robert-maiden-website\.pages\.dev/g) ?? []).length, 2, "Robert appears only once");
});