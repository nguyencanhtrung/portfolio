# Architecture changes

## Publish the grouped project catalog

- Problem: The production Projects page rendered one undifferentiated list and temporarily mounted a development-only prototype with query-string controls. The approved C direction needed two durable categories without making the prototype part of production.
- Design decision: `src/data/projectCatalog.ts` owns locale-specific catalog content and explicit entry contracts. `ProjectCatalogCategory`, `ProjectCatalogEntry`, and `ProjectCatalogIcon` own rendering and receive typed props. Professional entries reuse the existing project facts and routes; independent projects are per-locale arrays so adding another project is a data change. The category rail, icon-first headings, responsive entry directions, and theme-aware SVG art stay within the existing Datasheet Memoir template. The ASR Studio source is described as publicly available under PolyForm Noncommercial and links to GitHub, setup, and its website.
- Trade-offs and rejected options: The dev prototype was not promoted as a component or left behind as a hidden production branch. A shared category/entry renderer was chosen over separate hand-written sections so content growth does not add view branches. The approved category rail is retained even though a single-column list would be shorter to implement; the rail makes the two kinds of work scannable without adding jump navigation.
- Verification evidence: `/tmp/portfolio-production-run/catalog-build.log` records the normal Astro production build and Pagefind run. `/tmp/portfolio-production-run/catalog-check.log` records EN/VI catalog assertions, role labels, ASR links/logo path, prototype-control absence, and `git diff --check`.
- Prototype archive: Approved snapshots and the throwaway prototype are preserved on `prototype/projects-c-approved` at commit `6cd4439544b87db8ed24ea88979a2c3a6719dbee`; the main branch does not include the preview middleware or prototype files.
- Follow-ups: Add future independent projects to both locale arrays in `src/data/projectCatalog.ts`, including a stable `id`, localized copy, and links.
- Tag: architecture, design. Target document: this file.
