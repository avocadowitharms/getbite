# Bite images

The page uses the supplied PNG screenshots in `assets/`: `today.png`, `cooktimer.png`, `recommendation.png`, `receiptDetail.png`, `pizzarecipt.png`, and `gallery.png`. They include device frames and transparent margins; `.real-device` crops those margins without adding another frame.

The health section uses the original responsive HTML cards and animated trend, with illustrative values. The supplied `Bodyspecs.png` is retained as an unused asset.

Only the collectible cards still use `meal.svg` as a photo placeholder. Replace their image sources and update the sample names and nutrition together when final collectible artwork is available. The remaining SVG mockups are unused.

Preview from the repository root with `python -m http.server 4173 --bind 127.0.0.1`. Run `node site.test.cjs` for the interaction/content check.
