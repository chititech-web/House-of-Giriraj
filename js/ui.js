// Giriraj Jewellery — UI Module
// Theme toggle, language, scroll animations, search

/* ===== TRANSLATIONS ===== */
const translations = {
  en: {
    nav_collections: "Collections",
    nav_bespoke: "Bespoke",
    nav_heritage: "Heritage",
    nav_contact: "Contact",
    search_placeholder: "SEARCH ARCHIVE",
    the_inquiry: "The Inquiry",
    hero_tagline: "Established 1995",
    hero_headline: "Where Value Takes Form.",
    hero_subtitle: "Fine jewelry crafted to preserve beauty, rarity, and legacy.",
    hero_cta_primary: "Request Private Viewing",
    hero_cta_secondary: "Explore Collections",
    philosophy_headline: "An inheritance of absolute rarity. We do not merely create; we archive the earth's silent wonders.",
    curation_title: "Curation",
    curation_desc: "Every stone in our vault undergoes a rigorous selection process, ensuring only the top 0.1% of global yields find a home at Shree Giriraj.",
    longevity_title: "Longevity",
    longevity_desc: "Our design philosophy rejects ephemeral trends in favor of structural integrity and timeless silhouettes that endure through generations.",
    stone_quote: "The stone dictates the form.",
    portfolio_label: "The Portfolio",
    collections_headline: "Curated Collections",
    view_all: "View All Archives",
    atelier_label: "The Atelier",
    atelier_headline: "The Precision of Ten Thousand Hours.",
    atelier_desc: "Each piece is the culmination of heritage techniques.",
    unrivaled_setting: "Unrivaled Setting",
    unrivaled_desc: "Proprietary micro-pave techniques.",
    artisanal_casting: "Artisanal Casting",
    artisanal_desc: "High-density platinum and 18k gold alloys.",
    cta_headline: "Begin Your Private Acquisition",
    cta_subtitle: "Consult with our senior diamond specialists.",
    cta_primary: "Speak to a Diamond Expert",
    cta_secondary: "Visit Our Atelier",
    trust_promise: "Our Promise",
    trust_certified: "Certified. Transparent. Trusted.",
    footer_rights: "© 2026 Shree Giriraj Gems and Jewels. All Rights Reserved.",
  },
  hi: {
    nav_collections: "संग्रह",
    nav_bespoke: "कस्टम",
    nav_heritage: "विरासत",
    nav_contact: "संपर्क",
    search_placeholder: "खोजें",
    the_inquiry: "पूछताछ",
    hero_tagline: "स्थापित 1995",
    hero_headline: "जहाँ मूल्य रूप लेता है।",
    hero_subtitle: "सौंदर्य, दुर्लभता और विरासत को संरक्षित करने के लिए तैयार किए गए उत्कृष्ट गहने।",
    hero_cta_primary: "निजी प्रदर्शन का अनुरोध",
    hero_cta_secondary: "संग्रह देखें",
    philosophy_headline: "निरपेक्ष दुर्लभता की विरासत। हम केवल नहीं बनाते; हम पृथ्वी के मौन आश्चर्यों को संरक्षित करते हैं।",
    curation_title: "चयन",
    curation_desc: "श्री गिरिराज की तिजोरी में हर पत्थर एक कठोर चयन प्रक्रिया से गुजरता है।",
    longevity_title: "दीर्घायु",
    longevity_desc: "हमारी डिज़ाइन दर्शन क्षणिक रुझानों को अस्वीकार करता है।",
    stone_quote: "आकार पत्थर देता है।",
    portfolio_label: "पोर्टफोलियो",
    collections_headline: "चयनित संग्रह",
    view_all: "सभी संग्रह देखें",
    atelier_label: "कार्यशाला",
    atelier_headline: "दस हजार घंटों की सटीकता।",
    atelier_desc: "हमारी कार्यशाला में जन्मा प्रत्येक टुकड़ा विरासत तकनीकों का परिणाम है।",
    unrivaled_setting: "अतुलनीय सेटिंग",
    unrivaled_desc: "स्वामित्व माइक्रो-पेव तकनीकें।",
    artisanal_casting: "कारीगरी ढलाई",
    artisanal_desc: "उच्च घनत्व वाला प्लैटिनम और 18k सोना।",
    cta_headline: "अपना निजी अधिग्रहण शुरू करें",
    cta_subtitle: "दुनिया के सबसे महत्वपूर्ण रत्नों के लिए परामर्श करें।",
    cta_primary: "हीरे के विशेषज्ञ से बात करें",
    cta_secondary: "हमारी कार्यशाला देखें",
    trust_promise: "हमारा वादा",
    trust_certified: "प्रमाणित। पारदर्शी। विश्वसनीय।",
    footer_rights: "© 2026 श्री गिरिराज जेम्स एंड ज्वेल्स। सर्वाधिकार सुरक्षित।",
  },
};

let currentLang = localStorage.getItem("language") || "en";

/* ===== AUDIO FEEDBACK ===== */
function playTickSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 2000;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.015);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.015);
  } catch (e) {}
}

function playErrorSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 300;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
}

/* ===== LANGUAGE ===== */
function updateTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLang] && translations[currentLang][key]) {
      if (el.tagName === "INPUT" && el.placeholder) {
        el.placeholder = translations[currentLang][key];
      } else {
        el.textContent = translations[currentLang][key];
      }
    }
  });
  document.querySelectorAll('select[id*="lang-selector"]').forEach((sel) => {
    sel.value = currentLang;
  });
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem("language", lang);
  document.documentElement.lang = lang;
  updateTranslations();
  playTickSound();
}

/* ===== THEME ===== */
function updateThemeIcons(iconName) {
  const icon = document.getElementById("theme-icon");
  const mobileIcon = document.getElementById("theme-icon-mobile");
  if (icon) icon.textContent = iconName;
  if (mobileIcon) mobileIcon.textContent = iconName;
}

function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle("light");
  const isLight = html.classList.contains("light");
  updateThemeIcons(isLight ? "dark_mode" : "light_mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  playTickSound();
  if (navigator.vibrate) navigator.vibrate(10);
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in-up, .process-step, .section-reveal").forEach((el) => {
    observer.observe(el);
  });
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          playTickSound();
        }
      }
    });
  });
}

/* ===== NAV HIDE ON SCROLL ===== */
function initNavHide() {
  const nav = document.querySelector("nav.fixed");
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

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", function () {
  initNavHide();
  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light");
    updateThemeIcons("dark_mode");
  }

  // Load saved language
  const savedLang = localStorage.getItem("language") || "en";
  if (savedLang !== "en") {
    currentLang = savedLang;
    const langSelect = document.getElementById("lang-selector");
    const langSelectMobile = document.getElementById("lang-selector-mobile");
    if (langSelect) langSelect.value = savedLang;
    if (langSelectMobile) langSelectMobile.value = savedLang;
    updateTranslations();
  }

  // Bind language selectors
  document.querySelectorAll('select[id*="lang-selector"]').forEach((sel) => {
    sel.addEventListener("change", function () {
      setLanguage(this.value);
    });
  });

  // Init animations and smooth scroll
  initScrollAnimations();
  initSmoothScroll();
});

/* ===== EXPORT TO WINDOW ===== */
window.setLanguage = setLanguage;
window.toggleTheme = toggleTheme;
window.playTickSound = playTickSound;
window.playErrorSound = playErrorSound;
window.getCurrentLanguage = () => currentLang;
window.getAvailableLanguages = () => ["en", "hi"];
