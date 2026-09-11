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

## v80 mobile scroll geometry
- roll left: -108px
- roll width: 175px
- roll height: 78.5svh
- roll top: 20.5svh
- visible roll width: 67px
- paper left: 0px
- paper width: 404px
- paper top: 31.2svh
- paper height: 54.8svh
- backplate left: 8px
- backplate width: 699px
- backplate top: 29.2svh
- backplate height: 58.5svh


## v81 update
- Mobile Page 3 scroll illustration enlarged slightly so the top of the artwork fills the scroll paper more naturally.


## v82 update
- On mobile, Page 3 now opens the scroll automatically as soon as the section becomes active; a second swipe is no longer required.
