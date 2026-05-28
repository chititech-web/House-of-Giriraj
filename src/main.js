import "./styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import houseCollection from "./data/house-collection.js";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const translations = {
  en: {
    nav_collections: "Collections",
    nav_bespoke: "Bespoke",
    nav_heritage: "Heritage",
    nav_contact: "Contact",
    search_placeholder: "Search Archive",
    the_inquiry: "The Inquiry"
  },
  hi: {
    nav_collections: "Collections",
    nav_bespoke: "Bespoke",
    nav_heritage: "Heritage",
    nav_contact: "Contact",
    search_placeholder: "Search Archive",
    the_inquiry: "The Inquiry"
  }
};

const searchItems = [
  {
    title: "The Ekta Lineage Bracelet",
    meta: "High Jewelry / 12ct D-Flawless",
    href: "/product.html?id=diamond-tennis"
  },
  {
    title: "The Maharani Viraasat Necklace",
    meta: "Masterpiece / Burmese Rubies",
    href: "/product.html?id=maharani-viraasat"
  },
  {
    title: "The Raj Tilak Emerald Parure",
    meta: "Bespoke / Kashmir Blue",
    href: "/product.html?id=raj-tilak-emerald"
  },
  {
    title: "Private Viewing",
    meta: "Appointment / Diamond Specialist",
    href: "/bespoke.html"
  }
];

function splitWords(root) {
  if (!root || root.dataset.splitReady === "true") return;

  const splitTargets = root.querySelectorAll(".split-line");
  const targets = splitTargets.length ? splitTargets : [root];

  targets.forEach((target) => {
    const words = target.textContent.trim().split(/\s+/);
    target.innerHTML = words
      .map((word) => `<span class="split-word"><span>${word}</span></span>`)
      .join(" ");
  });

  root.dataset.splitReady = "true";
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light");
    updateThemeIcons();
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.documentElement.classList.toggle("light");
      const isLight = document.documentElement.classList.contains("light");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      updateThemeIcons();
    });
  });
}

function updateThemeIcons() {
  const isLight = document.documentElement.classList.contains("light");
  document.querySelectorAll("#theme-icon, #theme-icon-mobile").forEach((icon) => {
    icon.textContent = isLight ? "dark_mode" : "light_mode";
  });
}

function initLanguageSelectors() {
  const savedLanguage = localStorage.getItem("language") || "en";
  document.documentElement.lang = savedLanguage;
  updateTranslations(savedLanguage);

  document.querySelectorAll("[data-language-select]").forEach((select) => {
    select.value = savedLanguage;
    select.addEventListener("change", () => {
      localStorage.setItem("language", select.value);
      document.documentElement.lang = select.value;
      updateTranslations(select.value);
      document.querySelectorAll("[data-language-select]").forEach((peer) => {
        peer.value = select.value;
      });
    });
  });
}

function updateTranslations(language) {
  const copy = translations[language] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (copy[key]) {
      element.textContent = copy[key];
    }
  });
}

function initMenu() {
  const menu = document.querySelector("[data-menu]");
  const openers = document.querySelectorAll("[data-menu-open]");
  const closers = document.querySelectorAll("[data-menu-close]");
  if (!menu) return;

  function openMenu() {
    menu.classList.add("is-open");
    document.body.classList.add("menu-open");
    openers.forEach((button) => button.setAttribute("aria-expanded", "true"));
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    openers.forEach((button) => button.setAttribute("aria-expanded", "false"));
  }

  openers.forEach((button) => button.addEventListener("click", openMenu));
  closers.forEach((button) => button.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

function initSearch() {
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  if (!modal || !input || !results) return;

  const openers = document.querySelectorAll("[data-search-open]");
  const closers = document.querySelectorAll("[data-search-close]");

  function renderResults(query = "") {
    const normalized = query.trim().toLowerCase();
    const matches = normalized
      ? searchItems.filter((item) =>
          `${item.title} ${item.meta}`.toLowerCase().includes(normalized)
        )
      : searchItems;

    results.innerHTML = matches
      .map(
        (item) => `
          <a class="search-result" href="${item.href}">
            <strong>${item.title}</strong>
            <span class="metadata block mt-1">${item.meta}</span>
          </a>
        `
      )
      .join("");
  }

  function openSearch() {
    renderResults();
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => input.focus());
  }

  function closeSearch() {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    input.value = "";
  }

  openers.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("[data-menu]")?.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      openSearch();
    });
  });

  closers.forEach((button) => button.addEventListener("click", closeSearch));
  input.addEventListener("input", () => renderResults(input.value));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeSearch();
    }
  });
}

function initMotion() {
  document.querySelectorAll("[data-split]").forEach(splitWords);

  if (reducedMotion) {
    gsap.set("[data-reveal], .promise-card, .portfolio-card", {
      clearProps: "all",
      opacity: 1
    });
    return;
  }

  gsap.set(".split-word > span", { yPercent: 110 });
  gsap.set("[data-reveal]", { y: 42, opacity: 0 });

  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTimeline
    .from(".nav-shell", { y: -18, opacity: 0, duration: 1.1 })
    .to(".hero-title .split-word > span", {
      yPercent: 0,
      duration: 1.25,
      stagger: 0.055
    }, 0.25)
    .from(".hero-kicker", { y: 16, opacity: 0, duration: 0.95 }, 0.38)
    .from(".hero-subtitle", { y: 18, opacity: 0, duration: 1 }, 0.74)
    .from(".hero-actions .button", {
      y: 16,
      opacity: 0,
      duration: 0.95,
      stagger: 0.12
    }, 0.92);

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    gsap.to(element, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
        once: true
      }
    });
  });

  document.querySelectorAll(".promise-card").forEach((card, index) => {
    gsap.from(card, {
      y: 34,
      opacity: 0,
      duration: 0.9,
      delay: index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".promise-grid",
        start: "top 78%",
        once: true
      }
    });
  });

  document.querySelectorAll(".portfolio-card").forEach((card) => {
    gsap.from(card, {
      y: 52,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 84%",
        once: true
      }
    });

    const media = card.querySelector(".portfolio-media video, .portfolio-media img");
    if (media) {
      gsap.fromTo(
        media,
        { scale: 1 },
        {
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        }
      );
    }
  });

  document.querySelectorAll("[data-split-scroll]").forEach((element) => {
    gsap.to(element.querySelectorAll(".split-word > span"), {
      yPercent: 0,
      duration: 1,
      stagger: 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
        once: true
      }
    });
  });
}

function initVideoFallbacks() {
  const shouldUseStaticHero =
    window.matchMedia("(max-width: 760px)").matches ||
    window.matchMedia("(prefers-reduced-data: reduce)").matches ||
    reducedMotion;

  if (shouldUseStaticHero) {
    document.querySelector("[data-hero-video]")?.remove();
  }

  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("error", () => {
      video.closest(".media-frame, .portfolio-media, .hero-media")?.classList.add("media-error");
    });
  });
}

function renderHouseCollection(gridSelector = "#house-grid") {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  const isHomepage = grid.id === "house-grid";
  const pieces = isHomepage
    ? houseCollection.filter((p) => p.onHomepage)
    : houseCollection;

  const grouped = {};
  if (isHomepage) {
    pieces.forEach((p) => {
      const r = p.row || 1;
      if (!grouped[r]) grouped[r] = [];
      grouped[r].push(p);
    });
  } else {
    const rows = [[], [], []];
    pieces.forEach((p, i) => {
      if (i < 3) rows[0].push(p);
      else if (i < 6) rows[1].push(p);
      else rows[2].push(p);
    });
    rows.forEach((r, i) => { if (r.length) grouped[i + 1] = r; });
  }

  Object.keys(grouped).forEach((rowKey) => {
    const rowPieces = grouped[rowKey];
    const isFirst = parseInt(rowKey) === 1;
    const rowClass = rowPieces.length === 3 ? "row-equal" : "row-asymmetric";

    const rowDiv = document.createElement("div");
    rowDiv.className = `house-row ${rowClass}`;

    rowPieces.forEach((piece) => {
      const link = document.createElement("div");
      link.className = "house-card-link";
      link.tabIndex = 0;
      link.role = "link";
      link.setAttribute("aria-label", `View ${piece.title}`);
      const pieceUrl = `/house-piece.html?id=${piece.id}`;
      link.addEventListener("click", (e) => {
        if (e.target.closest("button, [data-slide-prev], [data-slide-next], [data-dot]")) return;
        window.location.href = pieceUrl;
      });
      link.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!e.target.closest("button, [data-slide-prev], [data-slide-next], [data-dot]")) {
            window.location.href = pieceUrl;
          }
        }
      });

      const card = document.createElement("article");
      card.className = "house-card";

      const imageArea = document.createElement("div");
      imageArea.className = "house-card-image";

      const wrapper = document.createElement("div");
      wrapper.className = "image-wrapper";

      const multi = piece.images && piece.images.length > 1;

      if (multi) {
        imageArea.setAttribute("data-slideshow", "");

        const slideshow = document.createElement("div");
        slideshow.className = "house-slideshow";

        piece.images.forEach((img, i) => {
          const slide = document.createElement("div");
          slide.className = `slide${i === 0 ? " active" : ""}`;
          slide.setAttribute("data-slide", "");
          const imgEl = document.createElement("img");
          imgEl.src = `/assets/images/collection/${piece.id}/${img}`;
          imgEl.alt = piece.title;
          imgEl.width = 1200;
          imgEl.height = 1600;
          if (i === 0 && isHomepage) {
            imgEl.fetchPriority = "high";
            imgEl.decoding = "sync";
          } else {
            imgEl.loading = "lazy";
            imgEl.decoding = "async";
          }
          slide.appendChild(imgEl);
          slideshow.appendChild(slide);
        });

        wrapper.appendChild(slideshow);

        const prev = document.createElement("button");
        prev.className = "slide-btn slide-prev";
        prev.type = "button";
        prev.setAttribute("data-slide-prev", "");
        prev.setAttribute("aria-label", "Previous image");
        prev.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>';
        imageArea.appendChild(prev);

        const next = document.createElement("button");
        next.className = "slide-btn slide-next";
        next.type = "button";
        next.setAttribute("data-slide-next", "");
        next.setAttribute("aria-label", "Next image");
        next.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>';
        imageArea.appendChild(next);
      } else {
        const imgEl = document.createElement("img");
        imgEl.src = piece.images && piece.images.length === 1
          ? `/assets/images/collection/${piece.id}/${piece.images[0]}`
          : "/assets/images/collection/placeholder.jpg";
        imgEl.alt = piece.title;
        imgEl.width = 1200;
        imgEl.height = 1600;
        imgEl.loading = "lazy";
        imgEl.decoding = "async";
        wrapper.appendChild(imgEl);
      }

      imageArea.appendChild(wrapper);
      card.appendChild(imageArea);

      const caption = document.createElement("div");
      caption.className = "house-card-caption";

      if (multi) {
        const dots = document.createElement("div");
        dots.className = "slide-dots";
        dots.setAttribute("data-slide-dots", "");
        piece.images.forEach((_, i) => {
          const dot = document.createElement("button");
          dot.className = `dot${i === 0 ? " active" : ""}`;
          dot.type = "button";
          dot.setAttribute("data-dot", i.toString());
          dot.setAttribute("aria-label", `View image ${i + 1}`);
          dots.appendChild(dot);
        });
        caption.appendChild(dots);
      }

      const title = document.createElement("h3");
      title.className = "house-piece-title";
      title.textContent = piece.title;
      caption.appendChild(title);

      const desc = document.createElement("p");
      desc.className = "house-piece-desc";
      desc.textContent = piece.description;
      caption.appendChild(desc);

      const ref = document.createElement("span");
      ref.className = "house-ref";
      ref.textContent = piece.ref;
      caption.appendChild(ref);

      card.appendChild(caption);
      link.appendChild(card);
      rowDiv.appendChild(link);
    });

    grid.appendChild(rowDiv);
  });
}

function initHouseSlideshow() {
  const slideshows = document.querySelectorAll("[data-slideshow]");
  if (!slideshows.length) return;

  slideshows.forEach((container) => {
    const slides = container.querySelectorAll("[data-slide]");
    if (!slides.length) return;

    const card = container.closest(".house-card");
    const dots = card ? card.querySelectorAll("[data-dot]") : container.querySelectorAll("[data-dot]");
    const prev = container.querySelector("[data-slide-prev]");
    const next = container.querySelector("[data-slide-next]");

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

    if (prev) {
      prev.addEventListener("click", (e) => { e.stopPropagation(); stopAuto(); goTo(current - 1); startAuto(); });
    }
    if (next) {
      next.addEventListener("click", (e) => { e.stopPropagation(); stopAuto(); goTo(current + 1); startAuto(); });
    }
    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        stopAuto();
        goTo(parseInt(dot.dataset.dot));
        startAuto();
      });
    });

    if (card) {
      card.addEventListener("mouseenter", stopAuto);
      card.addEventListener("mouseleave", startAuto);
    }

    startAuto();
  });
}

function initNavHide() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (currentScroll < 80) {
          nav.classList.remove("nav--hidden");
        } else if (currentScroll > lastScroll) {
          nav.classList.add("nav--hidden");
        } else {
          nav.classList.remove("nav--hidden");
        }
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function init() {
  initTheme();
  initLanguageSelectors();
  initMenu();
  initSearch();
  initMotion();
  initVideoFallbacks();
  initNavHide();
  renderHouseCollection("#house-grid");
  renderHouseCollection("#house-grid-full");
  initHouseSlideshow();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
