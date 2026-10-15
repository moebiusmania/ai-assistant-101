# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Parlare con l’AI / Talking to AI" is a static Astro + MDX site: an interactive course on using AI assistants that isn't tied to any one product. Italian is the default locale and is served at `/`. English is served at `/en/` and Spanish at `/es/`. Some concepts come from the AI Fluency Framework by Rick Dakan and Joseph Feller (CC BY-NC-SA 4.0). The site targets WCAG 2.1 AA in both themes, is an installable PWA that works offline, and deploys to https://moebiusmania.github.io/ai-assistant-101/.

## Commands

Uses Bun:

```sh
bun install
bun run dev      # http://localhost:4321
bun run build    # static output in dist/
bun run preview
bun run check    # astro check (type-check .astro/.ts; needs @astrojs/check, not yet in deps)
```

There is no test suite or linter. To verify a change, run `bun run build` and check the generated pages. To test the GitHub Pages sub-path locally, build with `SITE=https://moebiusmania.github.io BASE=/ai-assistant-101 bun run build`.

## Architecture

**Multilingual routing.** `astro.config.mjs` sets up i18n for `it`, `en` and `es`, with `it` as the default locale and no prefix. The page files are thin per-locale wrappers that render shared views from `src/views/`:
- `src/pages/index.astro` / `src/pages/en/index.astro` / `src/pages/es/index.astro` → `HomeView`
- `src/pages/lezioni/[slug].astro` / `src/pages/en/lessons/[slug].astro` / `src/pages/es/lecciones/[slug].astro` → `LessonView`
- `src/pages/glossario.astro` / `src/pages/en/glossary.astro` / `src/pages/es/glosario.astro` → `GlossaryView`

Views get the language from `getLang(Astro.currentLocale)`. Always build URLs with `routes.*` in `src/i18n/ui.ts`, never by hand: the paths differ by locale (`/lezioni/`, `/en/lessons/`, `/es/lecciones/`). Use `alternates(route)` for a page's per-language URLs. To add a language: add it to `languages`, `paths` and `ui` in `ui.ts`, to the locales in `astro.config.mjs`, to every `pick()` call and glossary entry, add its pages, lessons and manifest route, and draw its flag in `src/components/Flag.astro`.

The header language menu is a flag button that opens a popover list of languages (`Base.astro`).

**Base path.** `astro.config.mjs` reads `site` and `base` from the `SITE` and `BASE` env vars (default `/`), because GitHub Pages serves the site under `/ai-assistant-101/`. Never hard-code a root-relative URL such as `href="/favicon.svg"`. Use `routes.*` for pages and `url('/path')` from `src/i18n/ui.ts` for everything else. In client scripts, use `import.meta.env.BASE_URL`.

**Lessons content collection.** `src/content.config.ts` uses a glob loader over `src/content/lessons/**/*.mdx`. Its frontmatter schema is `title`, `description`, `order`, `minutes`, `icon`, an optional `tag`, and an optional `optional` flag for bonus lessons, which are listed but left out of the progress count and the lesson numbering. Entry ids look like `it/basics`, and `splitId()` turns them into `{ lang, slug }`. A lesson must use the same slug (file name) in `it/`, `en/` and `es/` because hreflang alternates and the language switcher rely on it. `order` sets the position in the prev/next pager and the home list. `icon` must be a key of the `paths` map in `src/components/Icon.astro`.

**Widgets in MDX.** `src/components/widgets/index.ts` exports `lessonComponents`, which `LessonView` passes to `<Content components={...}>`. That makes every widget, plus `Callout` and `Term`, usable in any lesson without an import. When you add a new widget, register it there. Widgets follow this pattern:
- The server side wraps its markup in `Widget.astro` (label/icon/title/hint chrome) inside a custom element such as `<quiz-box>`.
- Localized strings come from the `w.*` keys in `ui.ts` through `t(lang)`, or from inline `pick(lang, { it: …, en: …, es: … })` lookups (never two-way ternaries, which silently break for a third language). They are serialized into `data-i18n` and read on the client with `strings(this)` from `src/scripts/ui.ts`. Structured props go through `data-config` and `data(el)`.
- The client side is a `<script>` that defines a custom element class (`class QuizBox extends HTMLElement`) and imports helpers from `src/scripts/` (`sound`, `confetti`, `storage`, `progress`).

**Missions.** The bonus lesson `mission` lets the learner pick one of several tasks with `<Mission>`. Content specific to one task goes inside `<Track id="…">`, and only the chosen track is shown (`DEFAULT_MISSION` in `src/scripts/mission.ts` is the one rendered visible). `<MissionDone>` marks the chosen mission accomplished and can restart it.

**Glossary.** `src/i18n/glossary.ts` maps ids to `{ it, en, es }` entries. In MDX, `<Term id="...">text</Term>` renders a popover definition. An unknown id silently renders plain text.

**Client state.** All persistence is in `localStorage`, accessed only through the safe `read`/`write` wrappers in `src/scripts/storage.ts`. Keys use the `aic:` prefix (`aic:progress`, `aic:theme`, `aic:sound`, `aic:name`, `aic:motion-paused`, `aic:check:<id>`, `aic:mission`, `aic:missions`). Lesson completion lives in `src/scripts/progress.ts`. `LessonComplete` dispatches an `aic:progress` document event when a lesson is completed.

**Formatting helper.** `src/lib/format.ts` is a tiny markdown-ish formatter for chat bubbles and examples. It supports paragraphs, `- `/`1. ` lists, `**bold**`, `` `code` ``, and `[placeholder]`, which renders as a highlighted `<mark>`. It can also wrap each word in a span for the "streaming" typing effect.

**PWA.** `src/pwa/manifest.ts` builds a web app manifest per locale. It's served by `src/pages/manifest.webmanifest.ts`, `src/pages/en/manifest.webmanifest.ts` and `src/pages/es/manifest.webmanifest.ts`, and all share the same `id` and `scope`. `src/pwa/integration.mjs` is an Astro integration. After the build, it fills the `src/pwa/sw.js` template with the list of every file in `dist/` (except fonts, which are cached on first use) and a content-hash cache version, then writes `dist/sw.js`. Pages are network-first with a cache fallback, and assets are cache-first. `Base.astro` registers the worker in production only and shows the header install button when the browser fires `beforeinstallprompt`. The icons in `public/icons/` were rendered from `public/favicon.svg`: keep the maskable icon's glyph inside the central 80% safe zone.

**Styles.** `src/styles/global.css` is vanilla CSS with cascade layers (`reset, tokens, base, layout, components, utilities`), design tokens (`--space-*`, `--step-*`, `--accent`, …), `light-dark()` theming, and modern features such as the Popover API, anchor positioning, `@starting-style`, and scroll-driven animations. Component styles are scoped `<style>` blocks that use the same tokens and native CSS nesting.

## Accessibility conventions

The site targets WCAG 2.1 AA in both light and dark themes. When changing UI:
- **Colour.** `--teal`, `--amber` and `--coral` are decorative. For text, icons and control indicators, use `--teal-ink`, `--amber-ink` or `--coral-ink`, which reach 4.5:1 on every surface. Use `--on-status` for text or icons on a solid `--ok`/`--bad` fill, and `--border-control` for borders that identify an input or checkbox. `--border-strong` is too faint for those. Check new colours in both themes.
- **Motion.** Nothing may loop for more than 5 seconds without a pause control. Use a finite `animation-iteration-count`, or hook into the home hero's pause button (`data-paused`, `aic:motion-paused`). Respect `prefers-reduced-motion`.
- **Not colour alone.** A result such as right/wrong or found/missed needs a visible symbol and text for screen readers (`.visually-hidden`), not only a highlight.
- **States and roles.** Toggles use `aria-pressed`. Tab widgets need `aria-controls`/`aria-labelledby` and arrow-key navigation, as in `FourD` and `PromptCompare`. Don't override a button's role.
- **Focus.** If a focused button gets hidden or disabled, move focus to a sensible control. Never leave it on `<body>`. Don't remove focus outlines without a visible replacement.
- **Status messages.** Announce changes with `role="status"` or `aria-live`. The live element must already be in the DOM and must not be `display: none`. `.feedback:empty` collapses its padding for this reason.
- **Reflow.** Content must work at 320px wide (400% zoom), with no hidden navigation and no text truncated with an ellipsis.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` (or a manual run) and deploys with GitHub Pages, whose source is set to "GitHub Actions". It runs on `ubuntu-26.04` with pinned Node (current LTS) and Bun versions. `actions/configure-pages` supplies `SITE`/`BASE` to the build. Actions are pinned to commit SHAs with the release tag in a comment: when updating one, resolve the new tag's SHA rather than using a tag reference.

## Licensing

The code is MIT (`LICENSE`). The course content is CC BY-NC-SA 4.0 (`LICENSE-CONTENT`): lessons, glossary text, and quiz, exercise, example and prompt-template text. The ShareAlike licence is required because some concepts are adapted from the AI Fluency Framework, so don't change the content licence to one without ShareAlike. Keep the framework attribution in the footer (`footer.credit`) and in `LICENSE-CONTENT`.

## Content conventions

- When you change a lesson, update the `it/`, `en/` and `es/` versions.
- When you add a UI string, add the key to `ui.it`, `ui.en` and `ui.es`. The `UIKey` type is derived from `ui.it`.
- The course is product-agnostic. Lessons mention several assistants (ChatGPT, Claude, Gemini, Mistral, Copilot) and don't favor one.
