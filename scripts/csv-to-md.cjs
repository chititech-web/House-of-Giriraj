const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "..", "product-inventory.csv");
const PRODUCTS_DIR = path.join(__dirname, "..", "products");

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = [];
    let current = "";
    let insideQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { insideQuotes = !insideQuotes; continue; }
      if (ch === "," && !insideQuotes) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ""; });
    result.push(obj);
  }
  return result;
}

function toYamlFrontmatter(row) {
  const fields = {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    shortDesc: row.shortDesc,
    priceRange: row.priceRange,
    stone: row.stone,
    metal: row.metal,
    weight: row.weight,
    cert: row.cert,
    featured: row.featured === "TRUE",
    imagePath: row.imagePath || "",
    videoPath: row.videoPath || "",
    image: row.image || "",
  };

  let yaml = "---\n";
  for (const [key, val] of Object.entries(fields)) {
    if (typeof val === "boolean") {
      yaml += `${key}: ${val}\n`;
    } else if (val === "" || val === undefined) {
      // skip empty
    } else if (/[:\[\]{}|>#]/.test(val) || val.includes("\n") || val.includes('"')) {
      yaml += `${key}: "${val.replace(/"/g, '\\"')}"\n`;
    } else {
      yaml += `${key}: ${val}\n`;
    }
  }
  yaml += "---\n\n";
  yaml += row.description || "";
  return yaml;
}

// Read CSV and convert
const rows = parseCSV(fs.readFileSync(CSV_PATH, "utf-8"));

let converted = 0;
for (const row of rows) {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  }
  const filePath = path.join(PRODUCTS_DIR, `${row.id}.md`);
  fs.writeFileSync(filePath, toYamlFrontmatter(row), "utf-8");
  converted++;
  console.log(`  ✓ ${row.id}.md`);
}

console.log(`\nConverted ${converted} products to markdown files in products/`);
