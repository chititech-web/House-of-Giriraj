// Giriraj Jewellery — Analytics & Lead Tracking
// Tracks WhatsApp clicks, page views, product views, form submissions
// Sends to Google Analytics only. No PII stored client-side.

// Webhook URL — configure via server environment, not exposed in client code
const WEBHOOK_URL = "";

// GA Measurement ID from HTML gtag snippet
function getGaId() {
  const el = document.querySelector('script[async][src*="googletagmanager"]');
  if (!el) return null;
  const m = el.src.match(/id=([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

/* ---- Lead Tracking (WhatsApp funnel) — anonymized ---- */
function trackLead(data) {
  const payload = {
    type: "whatsapp_click",
    timestamp: data.timestamp || new Date().toISOString(),
    intent: data.intent || "Unknown",
    source: data.source || "Unknown",
    product: data.product || "",
    category: data.category || "",
    device: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
    page: window.location.pathname,
  };

  if (typeof gtag !== "undefined") {
    gtag("event", "whatsapp_click", {
      event_category: "conversion",
      event_label: payload.intent,
      value: 1,
    });
  }
}

/* ---- Page View Tracking ---- */
function trackPageView() {
  const gaId = getGaId();
  if (typeof gtag !== "undefined" && gaId) {
    gtag("config", gaId, {
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}

/* ---- Product View Tracking ---- */
function trackProductView(productId) {
  if (typeof gtag !== "undefined") {
    gtag("event", "product_view", {
      event_category: "engagement",
      event_label: productId,
    });
  }
}

/* ---- Form Submission Tracking — anonymized ---- */
function trackFormSubmit(formType) {
  if (typeof gtag !== "undefined") {
    gtag("event", "form_submit", {
      event_category: "conversion",
      event_label: formType,
    });
  }
}

/* ---- Auto-track form submissions ---- */
function initFormTracking() {
  const bespokeForm = document.getElementById("bespoke-form");
  if (bespokeForm) {
    bespokeForm.addEventListener("submit", function () {
      trackFormSubmit("bespoke");
    });
  }

  const appointmentForm = document.getElementById("appointment-form");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", function () {
      trackFormSubmit("appointment");
    });
  }
}

/* ---- Init on page load ---- */
  // Track product views
  const body = document.body;
  if (body.dataset.productId) {
    if (typeof gtag !== "undefined") {
      gtag("event", "view_item", {
        currency: "INR",
        items: [{
          item_id: body.dataset.productId,
          item_name: body.dataset.productName || document.title,
          item_category: body.dataset.collection || "High Jewellery",
          item_brand: "House of Giriraj"
        }]
      });
    }
  } else if (window.location.pathname.includes("product.html")) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    if (productId) trackProductView(productId);
  }

  // Hook into forms
  initFormTracking();
});

/* ---- Expose to global scope ---- */
window.trackLead = trackLead;
window.trackPageView = trackPageView;
window.trackProductView = trackProductView;
window.trackFormSubmit = trackFormSubmit;
