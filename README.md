# Parlare con l’AI / Talking to AI

An interactive course for using AI assistants well, not tied to any one product. Italian is the default language (`/`) and English is secondary (`/en/`).

**Live:** https://moebiusmania.github.io/ai-assistant-101/

- **Accessible:** built to meet WCAG 2.1 AA in both the light and dark themes.
- **Installable and offline:** it's a PWA. After the first visit every lesson works without a connection.
- **Private:** progress is saved only in your browser.

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
- PWA: `src/pwa/` (manifests, service worker template, and the build integration that generates `dist/sw.js`).

## Deployment

Every push to `main` builds the site and deploys it to GitHub Pages (`.github/workflows/deploy.yml`). The workflow runs on Ubuntu 26.04 with Node 24 LTS and Bun, and every action is pinned to a commit SHA. The URL base path comes from the Pages settings at build time, so the same build works under `/<repo>/` or on a custom domain.

## License

- **Code:** [MIT](LICENSE).
- **Course content** (lessons, glossary, quiz and exercise text): [CC BY-NC-SA 4.0](LICENSE-CONTENT). You can share and adapt it for non-commercial purposes with credit, and adaptations must use the same license.

Some concepts come from the AI Fluency Framework by Rick Dakan and Joseph Feller (CC BY-NC-SA 4.0).
