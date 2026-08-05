---
name: bibo.id.vn — Canh-Trung Nguyen
description: A technical datasheet written as a memoir — warm paper, oxblood ink, hand-drawn schematic line-art.
colors:
  oxblood: "#8e2433"
  oxblood-wash: "#f3e4e6"
  warm-paper: "#faf9f7"
  surface-white: "#ffffff"
  ink: "#1c1c21"
  ink-secondary: "#52525b"
  ink-tertiary: "#70707c"
  hairline: "#e5e2dc"
  code-paper: "#f2f0eb"
typography:
  display:
    fontFamily: "Newsreader Variable, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.6rem, 7vw, 4.2rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontVariation: "'opsz' 72"
  headline:
    fontFamily: "Newsreader Variable, Georgia, Times New Roman, serif"
    fontSize: "1.8rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Newsreader Variable, Georgia, Times New Roman, serif"
    fontSize: "1.15rem"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  pill: "999px"
spacing:
  gutter: "1.25rem"
  section: "5rem"
components:
  button-cta:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.65rem 1.3rem"
  button-cta-hover:
    textColor: "{colors.oxblood}"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "1.4rem 1.5rem 2.4rem"
  chip-metric:
    backgroundColor: "{colors.code-paper}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.7rem"
---

# Design System: bibo.id.vn — Canh-Trung Nguyen

## Overview

**Creative North Star: "The Datasheet Memoir"**

A technical datasheet written as a memoir. The page is warm paper, not screen-white; the type is a literary serif carrying an engineer's story; every measurement on it is real. The system borrows its graphic language from engineering documents — hairline rules, mono-spaced labels tracking wide and uppercase, hand-drawn schematic line-art — but its voice is narrative. Precision supplies the credibility, prose supplies the warmth, and neither is allowed to drown the other.

Density is generous and editorial: one column of measured text (44rem), wide hairline-bounded frames (62rem), and a single accent used the way a rubber stamp is used on a document — small, deliberate, and rare. Depth is flat like paper. Illustration is never photographic: the site draws its own subject matter as datasheet-style SVG line-art, with one binding convention inherited from the product itself: **dashed strokes mean simulated, solid strokes mean real.**

**Key Characteristics:**
- Warm paper ground (#faf9f7) with true-white surfaces only for raised cards and code frames.
- One accent (Oxblood) applied as punctuation, never as area.
- Three typefaces with strict roles: serif narrates, sans explains, mono measures.
- Hairline (1px) borders carry all structure; no shadows anywhere.
- Hand-drawn schematic SVG line-art; dashed = simulated, solid = real.
- Full light/dark mirror driven entirely by CSS custom properties.

## Colors

An ink-on-warm-paper palette with a single dark-red seal.

### Primary
- **Oxblood** (#8e2433): the site's one voice of emphasis — links, active nav, chapter era labels, timeline dots, story bullets, the blinking brand cursor, accent strokes inside the line-art, and `::selection`. In dark theme it lightens to a dusty rose (#e08b96) to hold contrast on near-black.
- **Oxblood Wash** (#f3e4e6): the only tinted fill — search-result highlights and soft fills inside SVG art (#35222a in dark).

### Neutral
- **Warm Paper** (#faf9f7): the page ground everywhere (#131318 in dark).
- **Surface White** (#ffffff): raised paper — cards and framed images only (#1b1b22 in dark).
- **Ink** (#1c1c21): headings and primary text (#e9e7e3 in dark).
- **Ink Secondary** (#52525b): body-adjacent text — intros, nav, org lines, card excerpts (#a6a6b0 in dark).
- **Ink Tertiary** (#70707c): metadata — dates, section labels, captions, footer (#83838e in dark). Tuned to hold ≥4.5:1 on both grounds at the small mono sizes it labels.
- **Hairline** (#e5e2dc): every border and divider on the site (#2a2a33 in dark).
- **Code Paper** (#f2f0eb): code blocks, inline code, and metric chips (#1f1f28 in dark).

### Named Rules
**The Stamp Rule.** Oxblood is a stamp, not a paint. It appears on strokes, glyphs, dots, and text — never as a large fill or background. If a surface is turning red, it's wrong.

**The Two-Theme Mirror Rule.** Every color exists only as a CSS custom property with a light and a dark value; components never hard-code a hex. New work must land in both themes at once.

## Typography

**Display Font:** Newsreader Variable (with Georgia fallback), optical size 72 for headings, 40 + italic for taglines
**Body Font:** Inter Variable (with system-ui fallback)
**Label/Mono Font:** JetBrains Mono (with ui-monospace fallback), Vietnamese subset loaded

**Character:** A literary serif doing the storytelling over a quiet, efficient sans — the pairing of a memoir set by an engineer. The mono face is the instrument readout: small, tracked wide, often uppercase, and always attached to a fact.

### Hierarchy
- **Display** (500, clamp(2.6rem, 7vw, 4.2rem), 1.15, `opsz` 72): the hero name and page titles. Balanced wrapping (`text-wrap: balance`), -0.01em tracking.
- **Headline** (500, 1.65–1.8rem, 1.15): chapter titles and prose `h2`. Same serif voice, same optical settings.
- **Title** (500, 1.15–1.35rem, 1.15): card titles and blog-list entries.
- **Body** (400, 1.0625rem, 1.65): Inter, all running text. Prose column capped at 44rem.
- **Label** (400, 0.72–0.8125rem, 0.14em tracking, uppercase for section labels): JetBrains Mono via the `.mono` utility — section labels, era codes, roles, dates, metrics, table headers, the brand mark.
- **Tagline** (italic serif, `opsz` 40, clamp(1.25rem, 3vw, 1.6rem), Ink Secondary): the one italic voice, used for the hero epigraph and blockquotes.

### Named Rules
**The Three Hands Rule.** Serif narrates, sans explains, mono measures. A heading is never sans, running text is never serif, and a number worth believing is set in mono.

## Layout

Two widths govern everything: **44rem** (`--w-content`) for anything meant to be read line-by-line, and **62rem** (`--w-wide`) for the framed stage — hero panorama, timeline, card grids. Containers center with a 1.25rem inline gutter.

Sections open with a **section label**: mono, 0.75rem, uppercase, 0.14em tracking, Ink Tertiary, underlined by a full-width hairline, with 5rem of top margin. This label-plus-rule is the site's page-structure primitive.

The home timeline is the signature layout: a **square-wave** — a dashed 1px line that runs down the outer edge of each chapter spread (left for odd, right for even), then crosses the full width like a clock edge, enclosing art and text in alternating cells. Below 900px it collapses to a single continuous left spine and the body reorders (era → title → org → art → story → metrics) via `display: contents`.

Cards sit in a 2-column grid (1rem gap) collapsing to one column at 700px. Blog lists are hairline-ruled rows (date column, 8rem) collapsing at 640px. The header wraps its nav to a second row on small screens rather than hiding it behind a menu.

## Elevation & Depth

**Flat, like the paper it imitates.** There is not a single box-shadow in the system. Depth is conveyed three ways: tone (Warm Paper ground vs. Surface White raised elements), hairline borders, and motion (cards lift -2px on hover with their border turning Oxblood). The one translucent element is the sticky header: 88% Warm Paper over an 8px backdrop blur, sitting on a hairline.

### Named Rules
**The No-Shadow Rule.** Never add a box-shadow. If an element needs to feel raised, give it Surface White, a hairline border, and — if interactive — the -2px hover lift.

## Shapes

Rectangles with quiet corners, in a fixed radius scale: **4px** (inline code, small controls like the language/theme toggles), **8px** (code blocks, search field, FPGA package in the art), **10px** (cards, framed images), and **999px** (pills: the CTA button and metric chips). Every shape is bounded by a 1px hairline border; borders are the system's structure, not decoration.

The line-art carries its own form language: 1.1–1.7px strokes with round caps and joins, `vector-effect: non-scaling-stroke`, ink-toned strokes with Oxblood reserved for the signal being talked about.

### Named Rules
**The Dashed Twin Rule.** Dashed strokes (5 7 dasharray) mean *simulated, reflected, or scaffold* — the digital-twin reflection, the timeline wave. Solid strokes mean *real*. Never use a dashed stroke decoratively; it is semantic.

## Components

### Buttons
The system has exactly one button shape: the pill CTA. Refined and restrained — a hairline pill that only reveals its intent on approach.
- **Shape:** pill (999px), 1px hairline border
- **Default:** transparent background, mono uppercase label (0.75rem, 0.14em), Ink Secondary, padding 0.65rem 1.3rem
- **Hover / Focus:** border and text turn Oxblood; the embedded ↓/→ glyph translates 3px in its direction of travel; 0.15s ease
- **Utility controls** (language badge, theme toggle): the same recipe at 4px radius and tighter padding

### Chips
- **Style:** metric chips — mono 0.72rem on Code Paper, hairline border, pill radius, padding 0.25rem 0.7rem, Ink Secondary text
- **Role:** verified numbers only (speedups, clock rates, throughput). They are the datasheet's spec table rendered as chips.

### Cards / Containers
- **Corner Style:** 10px
- **Background:** Surface White on the Warm Paper ground
- **Shadow Strategy:** none (see The No-Shadow Rule)
- **Border:** 1px hairline; turns Oxblood on hover with a -2px translateY lift (0.15s ease)
- **Internal Padding:** 1.4rem 1.5rem, extra bottom room for the mono → affordance pinned bottom-right in Oxblood
- **Card art:** each card opens with its line-art figure over a hairline rule

### Inputs / Fields
- **Style:** the Pagefind search box, skinned entirely through tokens — Surface White, hairline border, 8px radius, sans type
- **Highlight:** result marks in Oxblood Wash with Oxblood text, 3px radius
- **Behavior:** search hides itself in dev builds where no index exists

### Navigation
- **Brand:** `ctn_` in mono, the underscore blinking in Oxblood (1.2s steps)
- **Links:** sans 0.9rem, Ink Secondary; hover → Ink (no underline); active page → Oxblood
- **Bar:** sticky, translucent Warm Paper (88%) with 8px backdrop blur, hairline bottom, 3.5rem tall; nav wraps below the brand row on mobile

### Prose (long-form)
- 44rem column, 1.1em block rhythm; serif `h2`/`h3` with generous top margins
- Blockquotes: serif italic 1.15em, Ink Secondary, with a 2px solid Oxblood left rule
- Code: Code Paper ground, hairline border, Shiki dual theme following the site theme
- Tables: mono uppercase headers in Ink Tertiary, hairline row rules, self-scrolling on mobile
- Images: framed on Surface White with hairline border, 10px radius, 0.5rem padding; captions in Ink Tertiary; dimmed 12% in dark theme

### Schematic Line-Art (signature)
The site draws its own illustrations as datasheet-style SVG: HeroScene (the career as one continuous left-to-right signal), ChapterArt (one schematic per era), ProjectArt (one per project). Strokes use ink tones at 1.1–1.7px with round caps; Oxblood marks the active signal; Oxblood Wash is the only fill; dashed strokes follow The Dashed Twin Rule. All colors are CSS custom properties, so every drawing is theme-aware for free. Never replace these with photography or stock illustration.

## Do's and Don'ts

### Do:
- **Do** define every color as a CSS custom property with both a light and dark value before using it (The Two-Theme Mirror Rule).
- **Do** set section openers as the mono label + full-width hairline primitive with 5rem top margin.
- **Do** keep readable text at 44rem and framed visual structure at 62rem.
- **Do** express interactivity as border-color → Oxblood plus a small transform, at 0.15s ease.
- **Do** set every real number (metrics, dates, versions, era codes) in JetBrains Mono.
- **Do** draw new illustrations as line-art SVG in the existing stroke classes, honoring dashed = simulated / solid = real.
- **Do** respect `prefers-reduced-motion` — the global kill-switch already zeroes animation and transition durations.

### Don't:
- **Don't** add box-shadows, gradients, or glassmorphism beyond the header's existing backdrop blur (The No-Shadow Rule).
- **Don't** use Oxblood as a background or large fill; it is punctuation (The Stamp Rule).
- **Don't** introduce a second accent hue, photographic imagery, or stock icons; the line-art system is the imagery.
- **Don't** hard-code hex values in components; tokens only.
- **Don't** set headings in Inter or body copy in Newsreader (The Three Hands Rule).
- **Don't** use dashed strokes decoratively; dashed is a semantic claim that the thing is simulated.
