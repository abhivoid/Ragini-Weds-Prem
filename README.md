# Ragini & Prem · Reception invite

Static site (no build step needed). Files:

- `index.html` – structure and copy
- `css/style.css` – design (fonts, colours, layout, animations)
- `js/app.js` – page-by-page navigation (swipe / scroll / keys / buttons), arch-expand transition, counters, tilt
- `assets/art.jpg` – floral artwork from the printed card
- `build.py` – optional: makes a single-file preview in `dist/invite.html`

## Deploy on GitHub Pages
1. Create a repo, upload the contents of this folder (keep `index.html` at the root).
2. Settings → Pages → Deploy from branch → `main` / root.

## Things to edit
- Reception time / venue / map link: `index.html` (section `s3`).
- Wedding date logic (future / today / past wording): top of `js/app.js` (`ds`).

## About hiding the code
Anything a browser can run can be read by visitors, so the code cannot be made truly secret on a public site.
Later options: minify + obfuscate the JS in a GitHub Action before publishing, or keep the repo private and
host from Netlify / Cloudflare Pages.
