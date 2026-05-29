const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ENTRIES_DIR = path.resolve(__dirname, "../data/house-collection-entries");
const OUTPUT = path.resolve(__dirname, "../data/house-collection.js");

function extractFilenames(images) {
  if (!images || !Array.isArray(images)) return [];
  return images.map((item) => {
    const src = typeof item === "string" ? item : item.image;
    if (!src) return null;
    return path.basename(src.replace(/\\/g, "/"));
  }).filter(Boolean);
}

function build() {
  const files = fs.readdirSync(ENTRIES_DIR).filter((f) => f.endsWith(".md"));
  const pieces = files.map((file) => {
    const raw = fs.readFileSync(path.join(ENTRIES_DIR, file), "utf-8");
    const { data } = matter(raw);
    return {
      id: data.id,
      slug: data.id,
      title: data.title,
      ref: data.ref,
      category: data.category,
      description: data.description,
      hero: data.hero,
      images: extractFilenames(data.images),
      onHomepage: data.onHomepage ?? true,
      row: data.onHomepage ? (data.row != null ? data.row : null) : undefined,
      homepageOrder: data.onHomepage ? (data.homepageOrder != null ? data.homepageOrder : 1) : undefined,
      isHero: data.isHero ?? false,
      trailer: data.trailer || null,
    };
  });

  pieces.sort((a, b) => {
    if (a.onHomepage !== b.onHomepage) return a.onHomepage ? -1 : 1;
    const rowDiff = (a.row || 0) - (b.row || 0);
    if (rowDiff !== 0) return rowDiff;
    return (a.homepageOrder || 1) - (b.homepageOrder || 1);
  });

  const code = `const houseCollection = ${JSON.stringify(pieces, null, 2)};\n\nexport default houseCollection;\n`;
  fs.writeFileSync(OUTPUT, code, "utf-8");
  console.log(`Generated ${OUTPUT} — ${pieces.length} pieces`);
}

build();
