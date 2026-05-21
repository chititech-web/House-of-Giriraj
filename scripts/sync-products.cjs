const fs = require("fs");
const path = require("path");

const PRODUCTS_DIR = path.join(__dirname, "..", "products");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data.js");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;

  const yaml = match[1];
  const body = match[2].trim();

  const fields = {};
  for (const line of yaml.split("\n")) {
    const idx = line.indexOf(": ");
    if (idx === -1) continue;
    let key = line.slice(0, idx).trim();
    let val = line.slice(idx + 2).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val === "true") val = true;
    else if (val === "false") val = false;
    fields[key] = val;
  }
  return { ...fields, body };
}

function readAllProducts() {
  const products = [];

  if (!fs.existsSync(PRODUCTS_DIR)) return products;

  const categories = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

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
      products.push({
        id: data.id,
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        priceRange: data.priceRange || "",
        shortDesc: data.shortDesc || "",
        description: data.body || data.description || "",
        image: data.imagePath ? `/assets/images/${data.imagePath}` : "",
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
