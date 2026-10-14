# Astra Productions Website Upgrade Preview

Status: Cloudflare preview deployed for review only. NOT live-domain production, NOT approved for final publication.
Preview worktree: D:/VS/astra-website-upgrade-preview
Source main checkout: D:/VS/MY WEBSITE (untouched)
Preview branch: astra-site-upgrade-preview-20261015

## Delivered in preview
- Homepage repositioned around From the story to the reader.
- Clearer primary actions, featured work moved near opening, 3 service categories, streamlined audit, creation-to-promotion explanation, and about section; testimonial block removed.
- Updated /our-work: 2 verified author website examples and 11 published Astra YouTube videos; concept preview removed.
- Three project detail pages under /projects.
- New /discover-books: preliminary reader showcase referencing only existing public portfolio projects and verified external links.
- All existing pricing tiers preserved: $499, $999, $1299, $399.
- Existing inquiry form and /api/inquiry code untouched.
- Added clean routes, Vite multi-page build inputs, and book-trailers service page with realistic production scope and deliverables.
- Added a proposed Astra Author Spotlight one-time organic publishing pilot, scope and rights limits, and a separate future paid-promotion direction.

## Publication requirements
1. Obtain author/client permissions before developing complete author profiles and using new materials.
2. Confirm approved official covers, portraits, book copy and current retailer links.
3. Obtain confirmation that project descriptions and featured client works are approved for expanded reuse.
4. Test contact form delivery in an authorized staging environment without generating fake leads.
5. Review performance, accessibility and mobile layout.
6. New pages are marked noindex, follow pending approval. Remove noindex only after review and decide sitemap policy.
7. Advertising management and production deployment are NOT part of this preview.

Use npm ci then npm run build or npm run dev from this worktree.
This branch is reserved for preview review. Do not merge to main or deploy to production without approval.

## Latest quality verification
- 44 browser page/viewport checks across 360, 390, 768 and 1440 widths: passed with zero errors after mobile menu and media corrections.
- Gallery images fetched and verified; author concept removed from author websites as well as Our Work.
- Contact form markup is present, but successful live email delivery was NOT exercised.
