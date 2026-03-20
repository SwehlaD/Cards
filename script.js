// ========================= UI SELECTION =========================
const UI = {
  nav: document.querySelector("nav"),
  toggle: document.getElementById("menu-toggle"),
  navLinks: document.getElementById("nav-links"),
  scrollContainer: document.querySelector(".music-scroll"),
  devotionsSection: document.getElementById("devotions"),
  devotions: document.querySelectorAll(".devotion"),
};

// ========================= MENU TOGGLE =========================
UI.toggle.addEventListener("click", e => {
  e.stopPropagation();
  UI.navLinks.classList.toggle("show");
});
document.addEventListener("click", e => {
  if (!UI.nav.contains(e.target)) {
    UI.navLinks.classList.remove("show");
  }
});

// ========================= SMOOTH SCROLL =========================
document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", e => {
    const targetId = link.getAttribute("href");
    if (!targetId.startsWith("#")) return;

    e.preventDefault();
    const target = document.getElementById(targetId.slice(1));
    if (!target) return;

    const headerHeight = UI.nav.offsetHeight;
    const elementTop = target.getBoundingClientRect().top;
    const scrollPosition = window.pageYOffset + elementTop - headerHeight;

    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
    UI.navLinks.classList.remove("show");
  });
});

// ========================= DYNAMIC BACKGROUND =========================
let ticking = false;
function updateGradient() {
  const scrollY = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return;

  const t = Math.pow(Math.min(scrollY / scrollHeight, 1), 0.5);
  const dark = { r: 18, g: 18, b: 18 };
  const top = { r: 74, g: 46, b: 29 };
  const bottom = { r: 149, g: 122, b: 105 };
  const mix = (a, b, t) => Math.round(a + (b - a) * t);

  const c1 = { r: mix(dark.r, top.r, t), g: mix(dark.g, top.g, t), b: mix(dark.b, top.b, t) };
  const c2 = { r: mix(dark.r, bottom.r, t), g: mix(dark.g, bottom.g, t), b: mix(dark.b, bottom.b, t) };

  document.body.style.background = `
    linear-gradient(to bottom, 
      rgb(${c1.r},${c1.g},${c1.b}) 0%, 
      rgb(${c1.r},${c1.g},${c1.b}) 50%, 
      rgb(${c2.r},${c2.g},${c2.b}) 100%)
  `;
}
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => { updateGradient(); ticking = false; });
    ticking = true;
  }
});
updateGradient();

// ========================= CAROUSEL =========================
let allCards = [];
let scrollTimeout;

function initCarousel() {
  if (!UI.scrollContainer) return;

  allCards = Array.from(UI.scrollContainer.querySelectorAll(".release-card"));
  UI.scrollContainer.scrollLeft = 0;

  updateCarouselVisuals();
  applyCardBackColors?.();
}

// --- CENTER CALC (more accurate) ---
function getCenteredCard() {
  const container = UI.scrollContainer;
  const containerCenter = container.scrollLeft + container.offsetWidth / 2;

  let closest = null;
  let closestDist = Infinity;

  allCards.forEach(card => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const dist = Math.abs(containerCenter - cardCenter);

    if (dist < closestDist) {
      closestDist = dist;
      closest = card;
    }
  });

  return closest;
}

// --- SNAP TO CENTER ---
function snapToCenter() {
  const card = getCenteredCard();
  if (!card) return;

  const container = UI.scrollContainer;
  const target =
    card.offsetLeft +
    card.offsetWidth / 2 -
    container.offsetWidth / 2;

  container.scrollTo({ left: target, behavior: "smooth" });
}

// --- VISUAL UPDATE (lighter math) ---
function updateCarouselVisuals() {
  if (!UI.scrollContainer) return;

  const container = UI.scrollContainer;
  const center = container.scrollLeft + container.offsetWidth / 2;

  allCards.forEach(card => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const dist = Math.abs(center - cardCenter);

    const maxDist = container.offsetWidth * 0.6;
    const t = Math.min(dist / maxDist, 1);

    const scale = card.classList.contains("showcase") ? 1 : 1 - t * 0.35;
    const opacity = card.classList.contains("showcase") ? 1 : 1 - t * 0.4;

    card.style.transform = `scale(${scale})`;
    card.style.opacity = opacity;

    const inner = card.querySelector(".album-inner");
    if (inner) {
      inner.style.transform = card.classList.contains("flipped")
        ? "rotateY(180deg)"
        : `rotateY(${(cardCenter - center) / maxDist * 15}deg)`;
    }
  });
}

// --- SCROLL HANDLER (debounced + smooth) ---
UI.scrollContainer?.addEventListener("scroll", () => {
  requestAnimationFrame(updateCarouselVisuals);

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    snapToCenter();
  }, 120); // adjust for feel
});


// ========================= CARD CLICK =========================
UI.scrollContainer?.addEventListener("click", e => {
  const card = e.target.closest(".release-card");
  if (!card) return;

  const container = UI.scrollContainer;
  const containerWidth = container.offsetWidth;
  const scrollTarget = card.offsetLeft + card.offsetWidth / 2 - containerWidth / 2;

  container.scrollTo({ left: scrollTarget, behavior: "smooth" });

  if (card.classList.contains("showcase")) {
    card.classList.toggle("flipped");
    requestAnimationFrame(updateCarouselVisuals);
    return;
  }

  // Reset all cards
  allCards.forEach(c => c.classList.remove("showcase", "flipped"));

  // Activate clicked card
  card.classList.add("showcase", "flipped");
  requestAnimationFrame(updateCarouselVisuals);

  // Open linked devotion if any
  const devotionId = card.dataset.devotionId;
  if (devotionId) toggleDevotion(document.getElementById(devotionId));

});

// ========================= DEVOTIONS =========================
function toggleDevotion(targetDev) {
  if (!targetDev) return;

  const isOpening = !targetDev.classList.contains("open");

  UI.devotions.forEach(dev => {
    dev.classList.remove("active", "open");
    dev.classList.add("hidden");
    const body = dev.querySelector(".devotion-body");
    if (body) body.style.maxHeight = null;
  });

  if (isOpening) {
    targetDev.classList.remove("hidden");
    targetDev.classList.add("active", "open");
    UI.devotionsSection?.classList.add("active");

    const body = targetDev.querySelector(".devotion-body");
    if (body) body.style.maxHeight = body.scrollHeight + "px";
  } else {
    UI.devotionsSection?.classList.remove("active");
    
    allCards.forEach(c => c.classList.remove("showcase", "flipped"));

  }
}

UI.devotions.forEach(dev => {
  dev.addEventListener("click", () => toggleDevotion(dev));
});

// ========================= CAROUSEL BUTTONS =========================
document.querySelectorAll(".carousel-btn.left").forEach(btn => {
  btn.addEventListener("click", () => {
    UI.scrollContainer.scrollBy({ left: -UI.scrollContainer.offsetWidth * 0.5, behavior: "smooth" });
  });
});
document.querySelectorAll(".carousel-btn.right").forEach(btn => {
  btn.addEventListener("click", () => {
    UI.scrollContainer.scrollBy({ left: UI.scrollContainer.offsetWidth * 0.5, behavior: "smooth" });
  });
});

// ========================= CARD BACK COLOR EXTRACTION =========================

// ========================= INIT =========================
window.addEventListener("load", () => {
  initCarousel();
  updateCarouselVisuals();
});
window.addEventListener("resize", updateCarouselVisuals);