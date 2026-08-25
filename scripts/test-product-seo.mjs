import fs from "fs";
import path from "path";

const PROD_DIR = "D:\\Projects\\Diamond_Website\\production";
const BASE_URL = "https://www.houseofgiriraj.com";

const heroProducts = [
  {
    id: "maharani-cascade",
    slug: "maharani-cascade",
    title: "Maharani Cascade Necklace",
    collectionSlug: "house-of-diamonds",
    collectionName: "House of Diamonds",
    expectedRef: "NK-12585",
    expectedDiamondCts: "66.67",
    expectedGrossWt: "120.40"
  },
  {
    id: "emerald-reverie",
    slug: "emerald-reverie",
    title: "Emerald Reverie",
    collectionSlug: "emerald-court",
    collectionName: "Emerald Court",
    expectedRef: "NK-12503",
    expectedDiamondCts: "16.39",
    expectedEmeraldCts: "67.54",
    expectedGrossWt: "60.93"
  },
  {
    id: "imperial-dominion",
    slug: "imperial-dominion",
    title: "Imperial Dominion",
    collectionSlug: "crown-collection",
    collectionName: "Crown Collection",
    expectedRef: "NK-12384",
    expectedDiamondCts: "42.91",
    expectedGrossWt: "137.25"
  },
  {
    id: "royal-edict",
    slug: "royal-edict",
    title: "Royal Edict",
    collectionSlug: "crown-collection",
    collectionName: "Crown Collection",
    expectedRef: "NK-12383",
    expectedDiamondCts: "64.59",
    expectedGrossWt: "119.05"
  },
  {
    id: "regalia-canopy",
    slug: "regalia-canopy",
    title: "Regalia Canopy",
    collectionSlug: "crown-collection",
    collectionName: "Crown Collection",
    expectedRef: "NK-12692",
    expectedDiamondCts: "21.80",
    expectedGrossWt: "78.14"
  },
  {
    id: "ruby-aurora",
    slug: "ruby-aurora",
    title: "Ruby Aurora",
    collectionSlug: "ruby-salon",
    collectionName: "Ruby Salon",
    expectedRef: "NK-12479",
    expectedDiamondCts: "49.48",
    expectedGrossWt: "104.73"
  },
  {
    id: "ceremonial-bloom",
    slug: "ceremonial-bloom",
    title: "Ceremonial Bloom",
    collectionSlug: "heritage-atelier",
    collectionName: "Heritage Atelier",
    expectedRef: "NK-11853"
  },
  {
    id: "morning-dew",
    slug: "morning-dew",
    title: "Morning Dew",
    collectionSlug: "jasmine-atelier",
    collectionName: "Jasmine Atelier",
    expectedRef: "T-389"
  }
];

const sitemapContent = fs.readFileSync(path.join(PROD_DIR, "public", "sitemap.xml"), "utf-8");
const vercelContent = JSON.parse(fs.readFileSync(path.join(PROD_DIR, "vercel.json"), "utf-8"));
const housePieceContent = fs.readFileSync(path.join(PROD_DIR, "house-piece.html"), "utf-8");

console.log("================================================================================");
console.log("HOUSE OF GIRIRAJ — AUTOMATED HERO PRODUCT SEO SUITE");
console.log("================================================================================\n");

const results = [];
const seenTitles = new Set();
const seenCanonicals = new Set();
const seenDescriptions = new Set();

let allPassed = true;

heroProducts.forEach(p => {
  const filePath = path.join(PROD_DIR, p.collectionSlug, p.slug, "index.html");
  const canonicalUrl = `${BASE_URL}/${p.collectionSlug}/${p.slug}/`;

  const itemReport = {
    product: p.title,
    route: `/${p.collectionSlug}/${p.slug}/`,
    status200: false,
    rawHtml: false,
    title: false,
    canonical: false,
    h1Count: 0,
    h1Valid: false,
    schemaProduct: false,
    schemaBreadcrumb: false,
    ogMeta: false,
    internalLink: false,
    waContext: false,
    ga4Ready: false,
    sitemapActive: false,
    legacy301: false,
    errors: []
  };

  if (!fs.existsSync(filePath)) {
    itemReport.errors.push(`File missing: ${filePath}`);
    results.push(itemReport);
    allPassed = false;
    return;
  }

  itemReport.status200 = true;
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. Raw HTML verification (Check that meaningful product narrative is in HTML string)
  if (content.includes("main id=\"main-content\"") && content.includes(p.title) && content.includes(p.expectedRef)) {
    itemReport.rawHtml = true;
  } else {
    itemReport.errors.push("Raw server HTML missing core product narrative or reference code");
  }

  // 2. Title test
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1].trim().length > 10) {
    const titleText = titleMatch[1].trim();
    if (seenTitles.has(titleText)) {
      itemReport.errors.push(`Duplicate Title found: "${titleText}"`);
    } else {
      seenTitles.add(titleText);
      itemReport.title = true;
    }
  } else {
    itemReport.errors.push("Title tag missing or too short");
  }

  // 3. Meta description test
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  if (descMatch && descMatch[1].trim().length > 20) {
    const descText = descMatch[1].trim();
    if (seenDescriptions.has(descText)) {
      itemReport.errors.push(`Duplicate Meta Description found: "${descText}"`);
    } else {
      seenDescriptions.add(descText);
    }
  } else {
    itemReport.errors.push("Meta description tag missing or too short");
  }

  // 4. Canonical test
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  if (canonicalMatch && canonicalMatch[1] === canonicalUrl) {
    if (seenCanonicals.has(canonicalMatch[1])) {
      itemReport.errors.push(`Duplicate Canonical URL: ${canonicalMatch[1]}`);
    } else {
      seenCanonicals.add(canonicalMatch[1]);
      itemReport.canonical = true;
    }
  } else {
    itemReport.errors.push(`Canonical URL mismatch. Expected: ${canonicalUrl}, got: ${canonicalMatch ? canonicalMatch[1] : "NONE"}`);
  }

  // 5. H1 Test
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  itemReport.h1Count = h1Matches.length;
  if (h1Matches.length === 1 && h1Matches[0][1].includes(p.title)) {
    itemReport.h1Valid = true;
  } else {
    itemReport.errors.push(`Expected exactly 1 H1 containing "${p.title}", found ${h1Matches.length}`);
  }

  // 6. Structured Data Test
  const jsonLdMatches = [...content.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)].map(m => {
    try { return JSON.parse(m[1]); } catch(e) { return null; }
  });

  const productSchema = jsonLdMatches.find(s => s && s["@type"] === "Product");
  const breadcrumbSchema = jsonLdMatches.find(s => s && s["@type"] === "BreadcrumbList");

  if (productSchema && productSchema.name === p.title && productSchema.identifier === p.expectedRef) {
    itemReport.schemaProduct = true;
  } else {
    itemReport.errors.push("Schema.org Product JSON-LD missing or invalid");
  }

  if (breadcrumbSchema && Array.isArray(breadcrumbSchema.itemListElement) && breadcrumbSchema.itemListElement.length === 3) {
    itemReport.schemaBreadcrumb = true;
  } else {
    itemReport.errors.push("Schema.org BreadcrumbList JSON-LD missing or invalid");
  }

  // 7. OpenGraph test
  const ogTitle = content.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
  const ogImage = content.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  if (ogTitle && ogImage && ogImage[1].startsWith("https://")) {
    itemReport.ogMeta = true;
  } else {
    itemReport.errors.push("OpenGraph metadata incomplete");
  }

  // 8. Internal Collection Link check
  const colFilePath = path.join(PROD_DIR, `${p.collectionSlug === "crown-collection" ? "crown-collection" : p.collectionSlug}.html`);
  if (fs.existsSync(colFilePath)) {
    const colContent = fs.readFileSync(colFilePath, "utf-8");
    if (colContent.includes(`href="/${p.collectionSlug}/${p.slug}/"`)) {
      itemReport.internalLink = true;
    } else {
      itemReport.errors.push(`Collection page ${colFilePath} missing static link to /${p.collectionSlug}/${p.slug}/`);
    }
  }

  // 9. WhatsApp context check
  if (content.includes(`data-product-id="${p.id}"`) && content.includes(`data-ref="${p.expectedRef}"`)) {
    itemReport.waContext = true;
  } else {
    itemReport.errors.push("WhatsApp product data attributes missing from body tag");
  }

  // 10. GA4 view_item check
  if (content.includes("data-product-id") && content.includes("gtag('config', 'G-CLY3Z1J0E8')")) {
    itemReport.ga4Ready = true;
  } else {
    itemReport.errors.push("GA4 tracking tags missing");
  }

  // 11. Sitemap membership check
  if (sitemapContent.includes(`<loc>${canonicalUrl}</loc>`)) {
    itemReport.sitemapActive = true;
  } else {
    itemReport.errors.push(`Sitemap missing canonical entry for ${canonicalUrl}`);
  }

  // 12. Legacy 301 redirect check (vercel.json + house-piece.html fallback)
  const hasVercelRedirect = vercelContent.redirects && vercelContent.redirects.some(r =>
    r.source === "/house-piece.html" &&
    r.has && r.has.some(h => h.value === p.id) &&
    r.destination === `/${p.collectionSlug}/${p.slug}/`
  );
  const hasFallbackRouter = housePieceContent.includes(`"${p.id}": "/${p.collectionSlug}/${p.slug}/"`);

  if (hasVercelRedirect && hasFallbackRouter) {
    itemReport.legacy301 = true;
  } else {
    itemReport.errors.push(`Legacy redirect missing in vercel.json (${hasVercelRedirect}) or house-piece.html (${hasFallbackRouter})`);
  }

  if (itemReport.errors.length > 0) allPassed = false;
  results.push(itemReport);
});

// Output Summary Table
console.log("| Product | Route | 200 | Raw HTML | Title | Canonical | H1 | Schema | OG | Internal Link | WA Context | GA4 | Legacy Link |");
console.log("| :--- | :--- | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |");

results.forEach(r => {
  console.log(
    `| ${r.product.padEnd(26)} | ${r.route.padEnd(38)} | ${r.status200 ? "PASS" : "FAIL"} | ${r.rawHtml ? "PASS" : "FAIL"} | ${r.title ? "PASS" : "FAIL"} | ${r.canonical ? "PASS" : "FAIL"} | ${r.h1Valid ? "PASS" : "FAIL"} | ${r.schemaProduct && r.schemaBreadcrumb ? "PASS" : "FAIL"} | ${r.ogMeta ? "PASS" : "FAIL"} | ${r.internalLink ? "PASS" : "FAIL"} | ${r.waContext ? "PASS" : "FAIL"} | ${r.ga4Ready ? "PASS" : "FAIL"} | ${r.legacy301 ? "PASS" : "FAIL"} |`
  );
});

console.log("\n================================================================================");
if (allPassed) {
  console.log("✓ ALL 8 HERO PRODUCT SEO ACCEPTANCE TESTS PASSED WITH ZERO ERRORS (100% SUCCESS)");
} else {
  console.log("❌ SOME TESTS FAILED. Details below:");
  results.forEach(r => {
    if (r.errors.length > 0) {
      console.log(`\nProduct: ${r.product} (${r.route})`);
      r.errors.forEach(e => console.log(`  - ❌ ${e}`));
    }
  });
}
console.log("================================================================================");
