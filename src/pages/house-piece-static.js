import "../../css/style.css";

function initStaticSlideshow() {
  const main = document.getElementById("main-content");
  if (!main) return;

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
      goTo(parseInt(dot.dataset.dot, 10));
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStaticSlideshow);
} else {
  initStaticSlideshow();
}
