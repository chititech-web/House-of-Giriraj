import "../../css/style.css";
import { products } from "../data.js";
import houseCollection from "../data/house-collection.js";

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const houseItems = houseCollection
  .filter(p => p.images && p.images.length > 0)
  .map(p => {
    let subcategory = "necklaces";
    const prefix = (p.ref || "").split("-")[0];
    if (prefix === "CH") subcategory = "chokers";
    const base = `/assets/images/collection/${p.id}/`;
    return {
      id: p.id,
      name: p.title,
      subcategory,
      images: p.images.map(f => base + encodeURIComponent(f)),
      shortDesc: p.ref,
      type: "house"
    };
  });

const productItems = products.map(p => {
  const imgs = [];
  if (p.image) imgs.push(p.image);
  if (p.gallery) p.gallery.forEach(g => { if (g.image) imgs.push(g.image); });
  if (imgs.length === 0) imgs.push("/assets/images/collection/placeholder.jpg");
  return {
    id: p.id,
    name: p.name,
    subcategory: p.subcategory,
    images: imgs,
    shortDesc: p.shortDesc,
    type: "product"
  };
});

const allItems = [...houseItems, ...productItems];
const categories = ["all", ...new Set(allItems.map(i => i.subcategory))];

document.addEventListener("DOMContentLoaded", function () {
  const filterContainer = document.getElementById("filter-buttons");
  const grid = document.getElementById("products-grid");
  const emptyState = document.getElementById("empty-state");
  if (!filterContainer || !grid) return;

  filterContainer.innerHTML = categories.map((cat, i) => `
    <button class="filter-btn px-6 md:px-8 py-3 border border-surface-variant text-[10px] tracking-[0.2em] uppercase hover:border-primary transition-all ${i === 0 ? "active" : ""}" data-filter="${cat}">
      ${esc(cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1))}
    </button>
  `).join("");

  function render(filter = "all") {
    const filtered = filter === "all" ? allItems : allItems.filter(i => i.subcategory === filter);
    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }
    if (emptyState) emptyState.classList.add("hidden");
    grid.innerHTML = filtered.map(item => {
      const href = item.type === "house"
        ? `house-piece.html?id=${encodeURIComponent(item.id)}`
        : `product.html?id=${encodeURIComponent(item.id)}`;
      const multi = item.images.length > 1;
      return `
        <a href="${href}" class="product-card group bg-surface-container block" data-type="${item.type}">
          <div class="aspect-[4/5] overflow-hidden relative">
            <div class="card-images w-full h-full">
              ${item.images.map((img, i) => `
                <img class="card-img w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${i === 0 ? "" : "hidden"}" src="${esc(img)}" alt="${esc(item.name)}" loading="lazy" data-index="${i}" />
              `).join("")}
            </div>
            ${multi ? `
            <button class="card-nav absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white text-stone-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md" type="button" data-dir="prev">
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button class="card-nav absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white text-stone-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md" type="button" data-dir="next">
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            ` : ""}
          </div>
          <div class="p-5 text-center border-t border-surface-variant/30 group-hover:border-primary/30 transition-colors min-h-[120px] flex flex-col justify-center">
            <span class="text-[9px] tracking-[0.3em] uppercase text-primary mb-2">${esc(item.subcategory)}</span>
            <h4 class="font-serif text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">${esc(item.name)}</h4>
            <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-2">${esc(item.shortDesc)}</p>
            <span class="mt-3 text-[10px] tracking-[0.2em] uppercase text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View ${item.type === "house" ? "Collection" : "Masterpiece"}
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </a>
      `;
    }).join("");
  }

  render("all");

  function cycleImage(card, dir) {
    const imgs = card.querySelectorAll(".card-img");
    if (imgs.length < 2) return;
    const cur = card.querySelector(".card-img:not(.hidden)");
    if (!cur) return;
    let idx = parseInt(cur.dataset.index, 10);
    if (dir === "prev") idx = idx > 0 ? idx - 1 : imgs.length - 1;
    else idx = idx < imgs.length - 1 ? idx + 1 : 0;
    imgs.forEach(img => img.classList.add("hidden"));
    imgs[idx].classList.remove("hidden");
  }

  grid.addEventListener("click", function (e) {
    const btn = e.target.closest(".card-nav");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    cycleImage(btn.closest(".product-card"), btn.dataset.dir);
  });

  let touchCard = null, touchStartX = 0, touchStartY = 0, touchSwiped = false;

  grid.addEventListener("touchstart", function (e) {
    const card = e.target.closest(".product-card");
    if (!card || card.querySelectorAll(".card-img").length < 2) { touchCard = null; return; }
    touchCard = card;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchSwiped = false;
  }, { passive: true });

  grid.addEventListener("touchmove", function (e) {
    if (!touchCard) return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy)) touchSwiped = true;
  }, { passive: true });

  grid.addEventListener("touchend", function (e) {
    if (!touchCard) return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (touchSwiped && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      cycleImage(touchCard, dx < 0 ? "next" : "prev");
    }
    touchCard = null;
  }, { passive: false });

  filterContainer.addEventListener("click", function (e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.filter);
  });

  if (typeof WhatsAppFunnel !== "undefined") {
    WhatsAppFunnel.init();
  }
});
