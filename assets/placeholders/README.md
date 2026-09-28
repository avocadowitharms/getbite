# Replaceable Bite images

These SVGs are explicitly labelled layout placeholders, not real app screenshots. Example meals and nutrition values are presentation content, not a nutrition database.

Replace the corresponding `img src` in `index.html` with your PNG/WebP image and update its alt text. Keep the image's width/height attributes in the same aspect ratio as the replacement. No JavaScript changes are needed.

| File | Slot | Suggested ratio |
| --- | --- | --- |
| `today.svg` | Main Today screenshot | 360 × 740 |
| `cook.svg` | Hero and Cook Mode screenshot | 360 × 740 |
| `editor.svg` | Meal editor screenshot | 360 × 740 |
| `gallery.svg` | Bissen-Galerie screenshot | 360 × 740 |
| `timer.svg` | Compact floating timer | 220 × 240 |
| `meal.svg` | Recipe and collectible photographs | 400 × 320 |
| `health.svg` | Body, weight trend and range UI fragments | 1200 × 290 |

Screen images sit inside a CSS device frame; use captures without a device bezel. The shared meal placeholder has several independent `img` elements so each recipe can receive its own photograph. Update the adjacent sample names and nutrition to match the supplied content.

The website is plain HTML/CSS/JS. Preview from the repository root with `python -m http.server 4173 --bind 127.0.0.1`, then visit http://127.0.0.1:4173. Run `node site.test.cjs` for the dependency-free interaction/content check.
