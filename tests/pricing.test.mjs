import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");
const authorWebsites = await readFile(new URL("../author-websites.html", import.meta.url), "utf8");

const jsonLdBlocks = [...homepage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const service = jsonLdBlocks
  .flatMap((block) => block["@graph"] ?? [])
  .find((entry) => entry["@type"] === "Service" && entry["@id"]?.endsWith("#author-services"));

test("homepage advertises the approved prices and savings", () => {
  for (const text of ["$699", "$299", "$999", "$1,499", "$1,698", "SAVE $199"]) {
    assert.match(homepage, new RegExp(text.replace("$", "\\$")));
  }
  assert.match(homepage, /<del>\$1,698<\/del> when purchased separately/);
  assert.match(homepage, /LIMITED-TIME BUNDLE OFFER/);
  assert.doesNotMatch(homepage, /countdown|last chance|validThrough/i);
});

test("structured offers match the customer-facing prices", () => {
  assert.ok(service, "author services JSON-LD is present");
  const prices = Object.fromEntries(service.offers.map((offer) => [offer.name, offer.price]));
  assert.deepEqual(prices, {
    "Author Website": "699",
    "Cinematic Book Trailer": "999",
    "Limited-Time Author Website and Cinematic Book Trailer Bundle": "1499",
    "Book Cover Design": "299",
  });
});

test("author website service page uses the approved one-time starting price", () => {
  assert.match(authorWebsites, /<strong>\$699 <small>USD<\/small><\/strong>/);
  assert.match(authorWebsites, /One-time website design and development fee for an agreed scope\./);
  assert.match(authorWebsites, /Domain registration, renewal and any paid hosting are separate/);
});
