# Production Journal

## 2026-05-21

### Re-anchored Project State

- Confirmed the workspace has both `production/` and `production-luxury/`.
- Treated `production-luxury/` as the preferred luxury visual direction.
- Treated `production/` as the deployable production folder because it already
  had the multi-page funnel, package lock, Vite config, and installed
  dependencies.

### Luxury Homepage Port

- Copied the luxury homepage into `production/index.html`.
- Copied `production-luxury/src/main.js` into `production/src/main.js`.
- Copied `production-luxury/src/styles.css` into `production/src/styles.css`.
- Copied `production-luxury/public/assets/` into `production/public/assets/`.
- Generated responsive AVIF/WebP variants with `npm run optimize:images`.

### Preserved Production Funnel

- Kept these pages in place:
  - `collections.html`
  - `product.html`
  - `bespoke.html`
  - `heritage.html`
  - `contact.html`
- Kept existing funnel scripts:
  - `js/data.js`
  - `js/ui.js`
  - `js/whatsapp.js`
  - `js/analytics.js`
- Added a Vite build hook to copy legacy `js/`, `images/`, and `videos/` folders
  into `dist/`.

### Homepage Integration Fixes

- Replaced stale `/product-detail.html` links with production product routes.
- Added the floating WhatsApp CTA to the luxury homepage.
- Loaded `js/analytics.js` and `js/whatsapp.js` on the homepage.
- Added WhatsApp button and modal styles to `src/styles.css`.
- Fixed the CTA image source set to use the generated `diamond-macro-1080`
  variant instead of a missing `diamond-macro-1280` variant.
- Added static hero fallback sizing so the hero image fills the viewport when
  the video is disabled for mobile, reduced-data, or reduced-motion users.

### Broken Path Cleanup

- Replaced fragile parent-directory media paths in `bespoke.html` and
  `heritage.html`.
- `bespoke.html` now references `/assets/videos/atelier.mp4` for the hero video.
- `bespoke.html` and `heritage.html` now use `/assets/images/diamond-macro.jpeg`
  instead of `../website/images/product_image1.jpeg`.

### Size Pass

- Initial luxury merge build was about 107 MB.
- After legacy path cleanup it was about 97 MB.
- Temporarily removed `hero2.mp4` and `atelier.mp4`, reducing the build to about
  18.7 MB.
- User requested the hero and atelier videos back.
- Restored:
  - `public/assets/videos/hero2.mp4`
  - `public/assets/videos/atelier.mp4`
- Restored homepage hero video and atelier video references.
- Restored `public/assets/asset-manifest.json` video entries.

### Verification

- `cmd /c npm run build` completed successfully.
- Local dev server was started at `http://localhost:5173/`.
- Confirmed route health for:
  - `/`
  - `/collections.html`
  - `/product.html?id=maharani-viraasat`
  - `/product.html?id=raj-tilak-emerald`
  - `/bespoke.html`
  - `/heritage.html`
  - `/contact.html`
- Confirmed local `href` and `src` references were reachable after cleanup.
- Confirmed core scripts and assets returned `200`.

### Current Caveats

- `hero2.mp4` is about 61 MB and `atelier.mp4` is about 21 MB. Final deployment
  should compress these videos if performance is a priority.
- Vite warnings about non-module legacy scripts are expected because those files
  are copied as static compatibility assets instead of bundled.
- Browser automation was not available in this environment, so checks were done
  through build, route, asset, and markup inspection.

### Header Check Against Approved `website/`

- Compared `production/index.html` header against approved `website/index.html`.
- Confirmed the production header preserves the approved essentials:
  - logo link
  - Collections, Bespoke, Heritage, Contact links
  - Search Archive control
  - language selector
  - theme toggle
  - The Inquiry CTA
  - mobile menu with Home and page links
- Added approved compatibility details to the production luxury header:
  - `data-i18n` keys on header links and CTA text
  - `id="lang-selector"` and `id="lang-selector-mobile"`
  - `id="theme-icon"` and `id="theme-icon-mobile"`
  - styled `archive-search-text` to match the approved search control intent
- Updated `src/main.js` so theme icons sync between light and dark modes and
  header text updates through the same `data-i18n` mechanism.

### Product Management System

- Created a CSV-driven product management workflow.
- **Folder structure:** `products/{category}/{product-id}/` — 7 categories,
  21 products, each with a dedicated folder for images and videos.
- **Master catalog:** `product-inventory.csv` — single source of truth with
  columns: id, category, subcategory, name, shortDesc, description, priceRange,
  stone, metal, weight, cert, featured, imagePath, videoPath.
- **Sync script:** `scripts/sync-products.cjs` — reads the CSV and regenerates
  `src/data.js` automatically.
- **Workflow:** Edit CSV in Excel → drop real product images into product
  folders → run `node scripts/sync-products.cjs` → `npm run build`.
- Verified build passes after CSV-to-JS sync.

### Decap CMS — Client Product Management UI

- Installed Decap CMS at `/admin` for client-facing product editing.
- **`public/admin/index.html`** — CMS entry point (loads decap-cms-app).
- **`public/admin/config.yml`** — Product model with all fields (id, name, category,
  subcategory, price, specs, featured, images, description via markdown editor).
  Includes category filters, editorial workflow, and sort options.
- **`api/oauth.js`** — Vercel serverless function for GitHub OAuth authentication.
- Products are now stored as individual markdown files in `products/{category}/{id}.md`
  with YAML frontmatter. The CMS reads/writes these files directly on GitHub.
- **`scripts/csv-to-md.cjs`** — One-time migration script (CSV → markdown files).
- **Updated `scripts/sync-products.cjs`** — Now reads from `products/*.md` files
  instead of CSV, generates `src/data.js` for the Vite build.
- CSV is preserved as a human-readable reference / bulk-import format.
- Updated `vercel.json` with `api/oauth.js` function config.

**Setup required for production (manual, one-time):**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set Homepage URL to `https://houseofgiriraj.vercel.app`
3. Set Callback URL to `https://houseofgiriraj.vercel.app/api/oauth?provider=github`
4. Copy Client ID and generate Client Secret
5. Add to Vercel env vars: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
6. Redeploy
