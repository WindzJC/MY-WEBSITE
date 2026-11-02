import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const servicePage = await readFile(new URL("../author-websites.html", import.meta.url), "utf8");
const portfolioPage = await readFile(new URL("../our-work/author-websites.html", import.meta.url), "utf8");

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
