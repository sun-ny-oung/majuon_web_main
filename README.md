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


## v83 update
- Mobile page 3 opens the scroll automatically on scroll-snap arrival via IntersectionObserver + scrollend/touchend fallback.
- Mobile hamburger color switches to the page 3 dark tone as soon as page 3 crosses the viewport midpoint.


## v84 update
- Mobile Page 3 illustration enlarged to meet the paper top/left seam more naturally.
- Horizontal swipe now moves both directions and loops Spring ↔ Winter in either direction.
- Vertical swipes are left for page scrolling; season changes require a horizontal gesture.


## v85 update
- Page 3 headline copy now breaks after “블렌드 커피.”


## v86 update
- Mobile Page 3 illustrations now preserve the original aspect ratio with no cropping.
- Artwork is anchored to the top-left edge of the scroll paper; any extra space remains on the right/bottom instead of cropping.


## v87 update
- Refined mobile page 3 illustration and text layout.
- Illustration now keeps original aspect ratio, sits against the top and left of the scroll paper, and is enlarged without cropping.
- Text block on mobile is re-balanced with cleaner spacing and left alignment.


## v88 update
- Reworked mobile page 3 so the illustration and text share one continuous paper/background area.
- Illustration is placed larger in the upper-right zone while preserving aspect ratio and avoiding crop.
- Copy sits naturally in the lower-left / lower area, matching the provided guide direction.


## v89 update
- Mobile page 3 text shifted right so the scroll roll no longer clips the copy.
- Added paper-blend gradients on the left and bottom of the illustration area.
- Illustration aligned to the top and right edges while preserving aspect ratio and avoiding crop.


## v90 update
- Fixed mobile page 3 copy block position (shifted back left).
- Replaced the problematic single overlay with separate left and bottom gradient masks.
- Kept the illustration aligned to the top/right while preserving aspect ratio and avoiding crop.


## v91 update
- Mobile page 3 copy block pulled left again after v90 overshot.
- Removed the problematic broad overlay effect and replaced it with softer left/bottom paper fades.
- Illustration kept on the top/right edges with preserved aspect ratio and no crop.


## v92 update
- Fixed the intrusive horizontal mask band on mobile page 3.
- Left and bottom gradients are now much tighter and softer, anchored only to the illustration edges.
- Preserved the improved text position from v91.
