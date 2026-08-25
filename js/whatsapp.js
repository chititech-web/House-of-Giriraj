// Giriraj Jewellery — WhatsApp Smart Funnel
// Guided conversion: Intent → Name → Context-aware prefilled message

const WHATSAPP_PHONE = "919885055550";

const WhatsAppFunnel = {
  productName: null,
  productId: null,
  category: null,
  sourcePage: null,
  userName: null,
  selectedIntent: null,
  _isOpen: false,
  _clickCooldown: false,

  /* ---- Detect page context on load ---- */
  init() {
    this.detectContext();
    this.attachListeners();
    this.attachKeyboard();
  },

  detectContext() {
    const path = window.location.pathname;
    const body = document.body;
    if (body.dataset.productId) {
      this.sourcePage = "house-piece";
      this.productId = body.dataset.productId;
      this.productName = body.dataset.productName || (document.querySelector("h1") ? document.querySelector("h1").textContent.trim() : null);
      this.category = body.dataset.collection;
      this.ref = body.dataset.ref;
    } else if (path.includes("product.html")) {
      this.sourcePage = "product";
      const h1 = document.querySelector("h1");
      if (h1) this.productName = h1.textContent.trim();
      const params = new URLSearchParams(window.location.search);
      this.productId = params.get("id");
    } else if (path.includes("collections.html") || path.includes("-collection.html") || path.includes("-court.html") || path.includes("-diamonds.html") || path.includes("-salon.html") || path.includes("-atelier.html")) {
      this.sourcePage = "collections";
      const activeFilter = document.querySelector(".filter-btn.active");
      if (activeFilter && activeFilter.dataset.filter !== "all") {
        this.category = activeFilter.textContent.trim().toLowerCase();
      }
    } else {
      this.sourcePage = "homepage";
    }
  },

  /* ---- Attach click handlers to all WhatsApp buttons ---- */
  attachListeners() {
    document.querySelectorAll(".whatsapp-btn, [data-wa-btn]").forEach((btn) => {
      // Remove any existing cloned listeners by using onclick
      btn.onclick = (e) => {
        e.preventDefault();
        if (this._isOpen || this._clickCooldown) return;
        if (btn.dataset.waProduct) this.productName = btn.dataset.waProduct;
        if (btn.dataset.waCategory) this.category = btn.dataset.waCategory;
        this._clickCooldown = true;
        setTimeout(() => (this._clickCooldown = false), 400);
        this.haptic();
        this.showIntentModal();
      };
    });
  },

  attachKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.querySelector(".wa-modal");
        if (modal) this.closeModal(modal);
      }
    });
  },

  haptic() {
    if (navigator.vibrate) navigator.vibrate(10);
  },

  /* ---- Step 1: Intent Selection Modal ---- */
  showIntentModal() {
    const existing = document.querySelector(".wa-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.className = "wa-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "How can we help?");
    modal.innerHTML = `
      <div class="wa-modal-backdrop"></div>
      <div class="wa-modal-body">
        <button class="wa-modal-close-btn" aria-label="Close">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
        <p class="wa-modal-eyebrow">How can we help?</p>
        <h3 class="wa-modal-title">Choose Your Path</h3>
        <div class="wa-intent-grid">
          <button data-intent="buy" class="wa-intent-btn">
            <span class="wa-intent-icon">
              <span class="material-symbols-outlined">diamond</span>
            </span>
            <div class="wa-intent-text">
              <span class="wa-label">Purchase Inquiry</span>
              <span class="wa-desc">Inquire about pricing and availability</span>
            </div>
          </button>
          <button data-intent="custom" class="wa-intent-btn">
            <span class="wa-intent-icon">
              <span class="material-symbols-outlined">brush</span>
            </span>
            <div class="wa-intent-text">
              <span class="wa-label">Custom Design</span>
              <span class="wa-desc">Bespoke commission</span>
            </div>
          </button>
          <button data-intent="browse" class="wa-intent-btn">
            <span class="wa-intent-icon">
              <span class="material-symbols-outlined">collections_bookmark</span>
            </span>
            <div class="wa-intent-text">
              <span class="wa-label">Just Browsing</span>
              <span class="wa-desc">See popular designs</span>
            </div>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("active"));
      this._isOpen = true;
    });

    // Close handlers
    modal.querySelector(".wa-modal-backdrop").addEventListener("click", () => this.closeModal(modal));
    modal.querySelector(".wa-modal-close-btn").addEventListener("click", () => this.closeModal(modal));

    // Intent selection
    modal.querySelectorAll("[data-intent]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.haptic();
        this.selectedIntent = btn.dataset.intent;
        this.closeModal(modal);
        setTimeout(() => this.showNameModal(), 300);
      });
    });
  },

  /* ---- Step 2: Name Capture Modal ---- */
  showNameModal() {
    const existing = document.querySelector(".wa-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.className = "wa-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "What's your name?");
    modal.innerHTML = `
      <div class="wa-modal-backdrop"></div>
      <div class="wa-modal-body">
        <button class="wa-modal-close-btn" aria-label="Close">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
        <p class="wa-modal-eyebrow">Almost there</p>
        <h3 class="wa-modal-title">What's your name?</h3>
        <input type="text" id="wa-name-input" placeholder="Your name" autocomplete="given-name" />
        <button id="wa-continue-btn" class="wa-continue">
          <span class="material-symbols-outlined text-lg">chat</span>
          Continue to WhatsApp
        </button>
        <p class="wa-privacy">We'll use your name to personalise the conversation.</p>
      </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("active"));
      this._isOpen = true;
    });

    const input = modal.querySelector("#wa-name-input");
    const continueBtn = modal.querySelector("#wa-continue-btn");

    const proceed = () => {
      const name = input.value.trim();
      if (!name) {
        input.classList.add("wa-input-error");
        input.focus();
        setTimeout(() => input.classList.remove("wa-input-error"), 1500);
        return;
      }
      this.userName = name;
      this.closeModal(modal);
      setTimeout(() => this.sendToWhatsApp(), 300);
    };

    continueBtn.addEventListener("click", proceed);
    input.addEventListener("input", () => {
      if (input.classList.contains("wa-input-error")) input.classList.remove("wa-input-error");
    });
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") proceed();
    });

    setTimeout(() => input.focus(), 100);

    // Allow skip — "Guest" if they just click continue
    continueBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.userName = "Guest";
      this.closeModal(modal);
      setTimeout(() => this.sendToWhatsApp(), 300);
    });
  },

  /* ---- Generate context-aware message ---- */
  generateMessage() {
    const name = this.userName || "Guest";
    let message = "";

    if (this.sourcePage === "house-piece" && this.productName) {
      message = `Hello House of Giriraj, I'm ${name}.\n\nI'm inquiring about the "${this.productName}"${this.ref ? " (Ref: " + this.ref + ")" : ""} from the ${this.category || "House"} collection.\n\nCould you please share private viewing availability and further details?\n\nThank you.`;
    } else if (this.sourcePage === "product" && this.productName) {
      const pd = window.__waProductData;
      if (pd && pd.description) {
        message = `Hello, I'm ${name}.\n\nI'm interested in "${this.productName}" — ${pd.description}\n\n`;
        if (pd.specs) {
          const s = pd.specs;
          message += `Details: ${s.stone || ""}, ${s.metal || ""}, ${s.weight || ""}${s.cert ? ", " + s.cert : ""}\n`;
        }
        if (pd.category) message += `Category: ${pd.category}\n`;
        message += `Reference: ${pd.name}\n\nCould you please share pricing and availability?\n\nThank you.`;
      } else {
        message = `Hello, I'm ${name}.\n\nI'm interested in the "${this.productName}" piece I saw on your website.\n\nCould you please share pricing, availability, and any available certification details?\n\nThank you.`;
      }
    } else if (this.sourcePage === "collections" && this.category) {
      message = `Hello, I'm ${name}.\n\nI was browsing your ${this.category} collection and would love to see what's available.\n\nCould you share options along with pricing?\n\nThank you.`;
    } else {
      switch (this.selectedIntent) {
        case "buy":
          message = `Hello, I'm ${name}.\n\nI'm looking to purchase a piece of fine jewellery and would like to see your latest collection.\n\nCould you help me explore what's available?\n\nThank you.`;
          break;
        case "custom":
          message = `Hello, I'm ${name}.\n\nI'm interested in commissioning a bespoke jewellery piece and would love to learn about the process.\n\nCould we schedule a consultation?\n\nThank you.`;
          break;
        case "browse":
        default:
          message = `Hello, I'm ${name}.\n\nI'm exploring your collections and would love to see your most popular designs.\n\nThank you.`;
          break;
      }
    }

    return message;
  },

  /* ---- Send to WhatsApp + track lead ---- */
  sendToWhatsApp() {
    const message = this.generateMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;

    // Track lead (if analytics is loaded) — anonymized
    if (typeof trackLead === "function") {
      trackLead({
        intent: this.selectedIntent,
        source: this.sourcePage,
        product: this.productName,
        category: this.category,
        timestamp: new Date().toISOString(),
        device: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
      });
    }

    // Open WhatsApp
    window.open(url, "_blank");

    // Reset state
    this._isOpen = false;
  },

  /* ---- Utility: close modal ---- */
  closeModal(modal) {
    if (modal) {
      modal.classList.remove("active");
      this._isOpen = false;
      setTimeout(() => modal.remove(), 300);
    }
  },
};

/* ---- Legacy compatibility: expose old API ---- */
window.whatsappQuickOptions = {
  toggleModal: () => WhatsAppFunnel.showIntentModal(),
  closeModal: () => {
    const modal = document.querySelector(".wa-modal");
    if (modal) WhatsAppFunnel.closeModal(modal);
  },
  openChat: (type) => {
    WhatsAppFunnel.selectedIntent = type === "bespoke" ? "custom" : type === "appointment" ? "buy" : "browse";
    WhatsAppFunnel.showNameModal();
  },
};
