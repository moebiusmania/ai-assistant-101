# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Parlare con l’AI / Talking to AI" is a static Astro + MDX site: an interactive course on using AI assistants that isn't tied to any one product. Italian is the default locale and is served at `/`. English is served at `/en/`. Some concepts come from the AI Fluency Framework by Rick Dakan and Joseph Feller (CC BY-NC-SA 4.0).

## Commands

Uses Bun:

```sh
bun install
bun run dev      # http://localhost:4321
bun run build    # static output in dist/
bun run preview
bun run check    # astro check (type-check .astro/.ts; needs @astrojs/check, not yet in deps)
```

There is no test suite or linter. To verify a change, run `bun run build` and check the generated pages.

## Architecture

**Bilingual routing.** `astro.config.mjs` sets up i18n with `it` as the default locale and no prefix. The page files are thin per-locale wrappers that render shared views from `src/views/`:
- `src/pages/index.astro` / `src/pages/en/index.astro` → `HomeView`
- `src/pages/lezioni/[slug].astro` / `src/pages/en/lessons/[slug].astro` → `LessonView`
- `src/pages/glossario.astro` / `src/pages/en/glossary.astro` → `GlossaryView`

Views get the language from `getLang(Astro.currentLocale)`. Always build URLs with `routes.*` in `src/i18n/ui.ts`, never by hand: the paths differ by locale (`/lezioni/` vs `/en/lessons/`, `/glossario/` vs `/en/glossary/`).

**Lessons content collection.** `src/content.config.ts` uses a glob loader over `src/content/lessons/**/*.mdx`. Its frontmatter schema is `title`, `description`, `order`, `minutes`, `icon`, and an optional `tag`. Entry ids look like `it/basics`, and `splitId()` turns them into `{ lang, slug }`. A lesson must use the same slug (file name) in `it/` and `en/` because hreflang alternates and the language switcher rely on it. `order` sets the position in the prev/next pager and the home list. `icon` must be a key of the `paths` map in `src/components/Icon.astro`.

**Widgets in MDX.** `src/components/widgets/index.ts` exports `lessonComponents`, which `LessonView` passes to `<Content components={...}>`. That makes every widget, plus `Callout` and `Term`, usable in any lesson without an import. When you add a new widget, register it there. Widgets follow this pattern:
- The server side wraps its markup in `Widget.astro` (label/icon/title/hint chrome) inside a custom element such as `<quiz-box>`.
- Localized strings come from the `w.*` keys in `ui.ts` through `t(lang)`, or from inline `lang === 'it' ? … : …` ternaries. They are serialized into `data-i18n` and read on the client with `strings(this)` from `src/scripts/ui.ts`. Structured props go through `data-config` and `data(el)`.
- The client side is a `<script>` that defines a custom element class (`class QuizBox extends HTMLElement`) and imports helpers from `src/scripts/` (`sound`, `confetti`, `storage`, `progress`).

**Glossary.** `src/i18n/glossary.ts` maps ids to `{ it, en }` entries. In MDX, `<Term id="...">text</Term>` renders a popover definition. An unknown id silently renders plain text.

**Client state.** All persistence is in `localStorage`, accessed only through the safe `read`/`write` wrappers in `src/scripts/storage.ts`. Keys use the `aic:` prefix (`aic:progress`, `aic:theme`, `aic:sound`, `aic:name`, `aic:motion-paused`, `aic:check:<id>`). Lesson completion lives in `src/scripts/progress.ts`. `LessonComplete` dispatches an `aic:progress` document event when a lesson is completed.

**Formatting helper.** `src/lib/format.ts` is a tiny markdown-ish formatter for chat bubbles and examples. It supports paragraphs, `- `/`1. ` lists, `**bold**`, `` `code` ``, and `[placeholder]`, which renders as a highlighted `<mark>`. It can also wrap each word in a span for the "streaming" typing effect.

**Styles.** `src/styles/global.css` is vanilla CSS with cascade layers (`reset, tokens, base, layout, components, utilities`), design tokens (`--space-*`, `--step-*`, `--accent`, …), `light-dark()` theming, and modern features such as the Popover API, anchor positioning, `@starting-style`, and scroll-driven animations. Component styles are scoped `<style>` blocks that use the same tokens and native CSS nesting.

## Content conventions

- When you change a lesson, update both the `it/` and `en/` versions.
- When you add a UI string, add the key to both `ui.it` and `ui.en`. The `UIKey` type is derived from `ui.it`.
- The course is product-agnostic. Lessons mention several assistants (ChatGPT, Claude, Gemini, Le Chat, Copilot) and don't favor one.
