import "../../css/style.css";
import houseCollection from "../data/house-collection.js";

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRelated(piece, count = 4) {
  const sameCategory = houseCollection.filter(
    (p) => p.id !== piece.id && p.category === piece.category
  );
  const others = houseCollection.filter(
    (p) => p.id !== piece.id && p.category !== piece.category
  );
  const pool = sameCategory.length >= count ? sameCategory : [...sameCategory, ...others];
  return shuffle(pool).slice(0, count);
}

function buildImagePath(pieceId, filename) {
  return `/assets/images/collection/${pieceId}/${filename}`;
}

function initHousePiece() {
  const main = document.getElementById("main-content");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const piece = id ? houseCollection.find((p) => p.id === id) : null;

  if (!piece) {
    main.innerHTML = `
      <section class="pt-32 pb-20 px-6 text-center">
        <span class="material-symbols-outlined text-6xl text-[#999081] mb-4">search_off</span>
        <h1 class="font-serif text-2xl md:text-3xl text-on-surface mb-2">Piece Not Found</h1>
        <p class="text-on-surface-variant mb-8">This piece may have been moved or is no longer available.</p>
        <a href="signature-collection.html" class="inline-block px-8 py-3 border border-primary text-primary font-label text-sm tracking-[0.2em] uppercase hover:bg-primary hover:text-on-primary transition-all">View the House Collection</a>
      </section>
    `;
    return;
  }

  document.title = `${piece.title} | House of Giriraj`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = piece.description;

  const categoryParts = piece.category.split(" · ");
  const categoryName = categoryParts[0] || "High Jewellery";
  const stone = categoryParts[1] || piece.category;

  const images = piece.images && piece.images.length > 0 ? piece.images : [];
  const hasSlideshow = images.length > 0;
  const mainImage = hasSlideshow ? buildImagePath(piece.id, images[0]) : "/assets/images/collection/placeholder.jpg";

  const related = getRelated(piece, 4);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.title,
    description: piece.description,
    image: images.map((img) => buildImagePath(piece.id, img)),
    category: piece.category,
    offers: {
      "@type": "Offer",
      price: "Upon Request",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock"
    }
  };

  main.innerHTML = `
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    <\/script>

    <nav class="pt-24 pb-4 px-6 md:px-12 bg-surface-container-low">
      <div class="max-w-[1440px] mx-auto">
        <div class="flex items-center gap-2 text-xs tracking-widest text-outline">
          <a href="index.html" class="hover:text-primary">HOME</a>
          <span>/</span>
          <a href="signature-collection.html" class="hover:text-primary">THE HOUSE COLLECTION</a>
          <span>/</span>
          <span class="text-on-surface">${esc(piece.title).toUpperCase()}</span>
        </div>
      </div>
    </nav>

    <section class="px-6 md:px-12 py-8 md:py-12 bg-background">
      <div class="max-w-[1440px] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div class="piece-gallery" data-piece-gallery>
            <div class="piece-gallery-slideshow">
              <div class="house-slideshow">
                ${hasSlideshow ? images.map((img, i) => `
                  <div class="slide${i === 0 ? " active" : ""}" data-slide>
                    <img src="${esc(buildImagePath(piece.id, img))}" alt="${esc(piece.title)}" width="1100" height="1375" ${i === 0 ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'} />
                  </div>
                `).join("") : `
                  <div class="slide active" data-slide>
                    <img src="/assets/images/collection/placeholder.jpg" alt="${esc(piece.title)}" width="1100" height="1375" />
                  </div>
                `}
              </div>
              ${hasSlideshow ? `
              <button class="slide-btn slide-prev" type="button" data-slide-prev aria-label="Previous image">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
              </button>
              <button class="slide-btn slide-next" type="button" data-slide-next aria-label="Next image">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              </button>
              ` : ""}
            </div>
            ${hasSlideshow ? `
            <div class="piece-dots" data-slide-dots>
              ${images.map((_, i) => `
                <button class="dot${i === 0 ? " active" : ""}" type="button" data-dot="${i}" aria-label="View image ${i + 1}"></button>
              `).join("")}
            </div>
            ` : ""}
          </div>

          <div class="flex flex-col justify-center">
            <div class="mb-2">
              <span class="text-[10px] tracking-[0.3em] uppercase text-primary">${esc(categoryName)}</span>
            </div>
            <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl text-on-surface mb-4">${esc(piece.title)}</h1>
            <p class="text-on-surface-variant mb-6 leading-relaxed">${esc(piece.description)}</p>

            <div class="flex flex-wrap gap-3 mb-8">
              <span class="px-3 py-1 bg-surface-container text-xs tracking-widest text-outline">${esc(stone)}</span>
              <span class="px-3 py-1 bg-surface-container text-xs tracking-widest text-outline">${esc(categoryName)}</span>
            </div>

            <div class="mb-8">
              <span class="text-xs tracking-widest text-outline uppercase mb-2 block">Reference</span>
              <span class="font-serif text-lg text-on-surface">${esc(piece.ref)}</span>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="bespoke.html" class="px-10 md:px-12 py-3 md:py-4 bg-primary text-on-primary font-label text-sm tracking-[0.2em] uppercase hover:translate-y-[-4px] transition-all duration-500 text-center">Request Private Viewing</a>
              <a href="signature-collection.html" class="px-10 md:px-12 py-3 md:py-4 border border-primary text-primary font-label text-sm tracking-[0.2em] uppercase hover:bg-primary hover:text-on-primary transition-all duration-500 text-center">View the House Collection</a>
            </div>

            <div class="flex flex-wrap gap-6 text-xs tracking-widest text-outline">
              <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">workspace_premium</span> GIA Certified</span>
              <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">handshake</span> Bespoke Commission</span>
              <span class="flex items-center gap-2"><span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">visibility</span> Private Viewing</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 md:px-12 py-12 md:py-16 bg-surface-container">
      <div class="max-w-[1440px] mx-auto">
        <h3 class="font-serif text-2xl text-on-surface mb-8">Specifications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-surface-container-low p-6">
            <h4 class="font-label text-xs tracking-widest uppercase text-outline mb-4">Piece Details</h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-surface-variant/30"><span class="text-outline">Category</span><span class="text-on-surface">${esc(categoryName)}</span></div>
              <div class="flex justify-between py-2 border-b border-surface-variant/30"><span class="text-outline">Reference</span><span class="text-on-surface">${esc(piece.ref)}</span></div>
              <div class="flex justify-between py-2"><span class="text-outline">Stone</span><span class="text-on-surface">${esc(stone)}</span></div>
            </div>
          </div>
          <div class="bg-surface-container-low p-6">
            <h4 class="font-label text-xs tracking-widest uppercase text-outline mb-4">Craft Details</h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-surface-variant/30"><span class="text-outline">Craft</span><span class="text-on-surface">Handmade</span></div>
              <div class="flex justify-between py-2 border-b border-surface-variant/30"><span class="text-outline">Setting</span><span class="text-on-surface">Micro-pave</span></div>
              <div class="flex justify-between py-2"><span class="text-outline">Finish</span><span class="text-on-surface">High Polish</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${related.length > 0 ? `
    <section class="px-6 md:px-12 py-16 md:py-24 bg-background">
      <div class="max-w-[1440px] mx-auto">
        <h3 class="font-serif text-2xl md:text-3xl text-on-surface mb-8">Related Pieces</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${related.map((p) => {
            const img = p.images && p.images.length > 0
              ? buildImagePath(p.id, p.images[0])
              : "/assets/images/collection/placeholder.jpg";
            return `
            <a href="/house-piece.html?id=${encodeURIComponent(p.id)}" class="piece-related-link">
              <div class="piece-related-card">
                <div class="image-wrapper">
                  <img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy" />
                </div>
                <div class="p-4 border-t border-surface-variant/30">
                  <h4 class="font-serif text-base text-on-surface mb-1">${esc(p.title)}</h4>
                  <p class="text-[10px] tracking-widest uppercase text-outline">${esc(p.ref)}</p>
                </div>
              </div>
            </a>
            `;
          }).join("")}
        </div>
      </div>
    </section>
    ` : ""}

    <section class="px-6 py-16 md:py-24 bg-stone-950 text-center">
      <div class="max-w-2xl mx-auto">
        <h3 class="font-serif text-3xl md:text-4xl text-hero-primary mb-4">Begin Your Private Acquisition</h3>
        <p class="text-hero-secondary mb-8">Consult with our senior diamond specialists for a confidential viewing.</p>
        <a href="bespoke.html" class="inline-block px-10 md:px-12 py-3 md:py-4 bg-primary text-on-primary font-label text-sm tracking-[0.2em] uppercase hover:translate-y-[-4px] transition-all duration-500">Speak to a Diamond Expert</a>
      </div>
    </section>
  `;

  if (!hasSlideshow) return;

  const slides = main.querySelectorAll("[data-slide]");
  const dots = main.querySelectorAll("[data-dot]");
  const prev = main.querySelector("[data-slide-prev]");
  const next = main.querySelector("[data-slide-next]");
  const gallery = main.querySelector("[data-piece-gallery]");

  if (slides.length <= 1) return;

  let current = 0;
  let interval;
  const DELAY = 5000;

  function goTo(index) {
    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    if (dots[current]) dots[current].classList.add("active");
  }

  function startAuto() {
    stopAuto();
    interval = setInterval(() => goTo(current + 1), DELAY);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  if (prev) prev.addEventListener("click", () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (next) next.addEventListener("click", () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopAuto();
      goTo(parseInt(dot.dataset.dot));
      startAuto();
    });
  });

  if (gallery) {
    gallery.addEventListener("mouseenter", stopAuto);
    gallery.addEventListener("mouseleave", startAuto);
  }

  startAuto();

  if (typeof WhatsAppFunnel !== "undefined") {
    WhatsAppFunnel.init();
  }
  if (typeof initScrollAnimations === "function") {
    initScrollAnimations();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHousePiece);
} else {
  initHousePiece();
}
