const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const PRODUCTS_DIR = path.join(__dirname, "..", "products");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data.js");
const SITEMAP_PATH = path.join(__dirname, "..", "public", "sitemap.xml");
const BASE_URL = "https://houseofgiriraj.vercel.app";

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;

  const fields = yaml.load(match[1]) || {};
  const body = match[2].trim();
  return { ...fields, body };
}

function resolveImage(path) {
  if (!path) return "";
  return path.startsWith("/") ? path : `/assets/images/products/${path}`;
}

function readAllProducts() {
  const products = [];

  if (!fs.existsSync(PRODUCTS_DIR)) return products;

  const catOrder = ["chokers", "necklaces", "chandeliers", "bracelets", "bangles", "rings", "studs"];
  const categories = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && catOrder.includes(d.name));

  for (const cat of categories) {
    const catPath = path.join(PRODUCTS_DIR, cat.name);
    const files = fs.readdirSync(catPath).filter(f => f.endsWith(".md"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(catPath, file), "utf-8");
      const data = parseFrontmatter(content);
      if (!data) {
        console.warn(`  ⚠ Skipping ${cat.name}/${file} — invalid frontmatter`);
        continue;
      }

      const gallery = Array.isArray(data.gallery) ? data.gallery.map(g => ({
        image: resolveImage(g.image),
        caption: g.caption || ""
      })) : [];
      const imageUrl = data.image ? resolveImage(data.image) : (gallery.length > 0 ? gallery[0].image : "");
      const videos = Array.isArray(data.videos) ? data.videos.map(v => ({
        video: v.video || "",
        poster: v.poster ? resolveImage(v.poster) : ""
      })) : [];

      products.push({
        id: data.id,
        name: data.name,
        category: cat.name,
        subcategory: data.subcategory || "",
        priceRange: data.priceRange || "",
        shortDesc: data.shortDesc || "",
        description: data.body || data.description || "",
        image: imageUrl,
        gallery,
        videos,
        specs: {
          stone: data.stone || "",
          metal: data.metal || "",
          weight: data.weight || "",
          cert: data.cert || "",
        },
        featured: data.featured === true,
      });
    }
  }

  products.sort((a, b) => {
    const ci = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
    if (ci !== 0) return ci;
    return a.id.localeCompare(b.id);
  });

  return products;
}

const products = readAllProducts();

if (products.length === 0) {
  console.error("No products found. Run `node scripts/csv-to-md.cjs` first to generate .md files.");
  process.exit(1);
}

const code = `// Auto-generated from products/*.md — do not edit directly
// Run: node scripts/sync-products.cjs

export const products = ${JSON.stringify(products, null, 2)};

export function getProductById(id) {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category) {
  if (category === "all") return products;
  return products.filter(p => p.category === category);
}

export function getProductsBySubcategory(subcategory) {
  return products.filter(p => p.subcategory === subcategory);
}

export function getFeaturedProducts() {
  return products.filter(p => p.featured);
}

export function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .sort(() => 0.5 - Math.random())
    .slice(0, limit);
}

export function getAllCategories() {
  const categories = [...new Set(products.map(p => p.category))];
  return categories.map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: products.filter(p => p.category === cat).length
  }));
}
`;

fs.writeFileSync(OUTPUT_PATH, code, "utf-8");
console.log(`✓ Generated ${OUTPUT_PATH} (${products.length} products from ${PRODUCTS_DIR})`);

// Generate sitemap
const staticPages = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/collections.html", priority: "0.9", changefreq: "weekly" },
  { url: "/bespoke.html", priority: "0.7", changefreq: "monthly" },
  { url: "/heritage.html", priority: "0.7", changefreq: "monthly" },
  { url: "/contact.html", priority: "0.6", changefreq: "monthly" },
  { url: "/admin/index.html", priority: "0.3", changefreq: "monthly" },
];

const catOrder = ["chokers", "necklaces", "chandeliers", "bracelets", "bangles", "rings", "studs"];

const urls = [...staticPages];
for (const cat of catOrder) {
  urls.push({ url: `/collections.html?category=${cat}`, priority: "0.8", changefreq: "weekly" });
}
for (const p of products) {
  urls.push({ url: `/product.html?id=${p.id}`, priority: "0.8", changefreq: "weekly" });
}

const now = new Date().toISOString();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

fs.writeFileSync(SITEMAP_PATH, sitemap, "utf-8");
console.log(`✓ Generated ${SITEMAP_PATH} (${urls.length} URLs)`);
