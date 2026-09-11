# MAJUON website source

Production-style separated source package.

## Structure

- `index.html` — page markup only
- `css/styles.css` — all site styles
- `js/app.js` — site interactions and mobile menu/header logic
- `assets/images/` — hero and seasonal artwork
- `assets/logos/` — original logo/wordmarks
- `assets/models/` — scroll 3D model

## Notes

- The page 3 adjustment GUI and its JavaScript were removed.
- The top-left logo uses the original SVG without color filters. Only the hamburger color changes by section.
- `MAJU:ON` is right-aligned beneath the hero wordmark, uses a lighter 400 weight, and sits closer to the SVG.
- Google Fonts and `<model-viewer>` remain CDN dependencies.
- `story.html` and `store.html` links are kept as existing navigation targets; those pages are not included because they have not been built in this source.
