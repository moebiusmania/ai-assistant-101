# Parlare con l’AI / Talking to AI

An interactive course for using AI assistants well, not tied to any one product. Italian is the default language (`/`) and English is secondary (`/en/`).

```sh
bun install
bun run dev      # http://localhost:4321
bun run build    # static site in dist/
bun run preview
```

- Lessons: `src/content/lessons/{it,en}/*.mdx`. A lesson has the same file name (slug) in both languages.
- Interactive widgets: `src/components/widgets/`. Every lesson can use them without importing (see `index.ts`).
- UI strings: `src/i18n/ui.ts`. Glossary: `src/i18n/glossary.ts`.
- Styles: `src/styles/global.css` (vanilla CSS, cascade layers, `light-dark()`, scroll-driven animations).

Some concepts come from the AI Fluency Framework by Rick Dakan and Joseph Feller (CC BY-NC-SA 4.0).
