# MAJUON landing prototype

Git/GitHub Pages ready split build based on the latest v62 preview.

## Structure

- `index.html` — page markup
- `css/styles.css` — all page styles, including desktop/mobile split
- `js/app.js` — interactions, 4-second seasonal auto loop, scroll/swipe controls
- `assets/images/` — logo and four seasonal WebP illustrations
- `assets/models/majuon-scroll.glb` — scroll 3D model

## Run locally

Because the page loads a 3D web component and local assets, serve the folder instead of double-clicking the HTML file.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Current interaction settings

- Seasonal loop: 화담 → 청류 → 풍연 → 설한 → 화담
- Hold time: about 4 seconds per blend
- Transition: about 0.82 seconds
- Manual wheel/swipe pauses auto-play before it resumes
- Desktop and mobile scroll-model sizing are separated
- Mobile scroll model: 175px wide / 78.5svh high / top 20.5svh / left -96px

External dependencies currently used: Google Fonts and Google's `<model-viewer>` CDN.
