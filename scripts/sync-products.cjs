const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const PRODUCTS_DIR = path.join(__dirname, "..", "products");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data.js");

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

  const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith(".md"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(PRODUCTS_DIR, file), "utf-8");
    const data = parseFrontmatter(content);
    if (!data) {
      console.warn(`  ⚠ Skipping ${file} — invalid frontmatter`);
      continue;
    }

    const gallery = Array.isArray(data.gallery) ? data.gallery.map(g => ({
      image: resolveImage(g.image),
      caption: g.caption || ""
    })) : [];
    const imageUrl = data.image ? resolveImage(data.image) : (gallery.length > 0 ? gallery[0].image : (data.imagePath ? `/assets/images/${data.imagePath}` : ""));
    const videos = Array.isArray(data.videos) ? data.videos.map(v => ({
      video: v.video || "",
      poster: v.poster ? resolveImage(v.poster) : ""
    })) : [];

    products.push({
      id: data.id,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
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

  // Sort by category order then by id
  const catOrder = ["chokers", "necklaces", "chandeliers", "bracelets", "bangles", "rings", "studs"];
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
