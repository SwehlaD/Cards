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

function initCarousel() {
  if (!UI.scrollContainer) return;
  allCards = Array.from(UI.scrollContainer.querySelectorAll(".release-card"));
  UI.scrollContainer.scrollLeft = 0;
  updateCarouselVisuals();
}

function updateCarouselVisuals() {
  if (!UI.scrollContainer) return;

  const containerRect = UI.scrollContainer.getBoundingClientRect();
  const containerMid = containerRect.left + containerRect.width / 2;

  allCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardMid = rect.left + rect.width / 2;
    const distance = Math.abs(cardMid - containerMid);
    const maxDist = containerRect.width * 0.7;
    const t = Math.min(distance / maxDist, 1);

    const scale = card.classList.contains("showcase") ? 1 : 1 - t * 0.45;
    const opacity = card.classList.contains("showcase") ? 1 : 1 - t * 0.5;

    card.style.transform = `scale(${scale}) translateZ(${100 - t * 200}px)`;
    card.style.opacity = opacity;
    card.style.zIndex = card.classList.contains("showcase") ? 10 : 1;

    const inner = card.querySelector(".album-inner");
    if (inner) {
      inner.style.transform = card.classList.contains("flipped")
        ? "rotateY(180deg)"
        : `rotateY(${((cardMid - containerMid) / maxDist) * 20}deg)`;
    }
  });
}

UI.scrollContainer?.addEventListener("scroll", () => {
  requestAnimationFrame(updateCarouselVisuals);
});

// ========================= CARD CLICK =========================
// ========================= CARD CLICK: FLIP & SHOWCASE =========================
UI.scrollContainer?.addEventListener("click", e => {
  const card = e.target.closest(".release-card");
  if (!card) return;

  // Center clicked card
  const containerRect = UI.scrollContainer.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const offset =
    cardRect.left -
    containerRect.left -
    containerRect.width / 2 +
    cardRect.width / 2;

  UI.scrollContainer.scrollBy({ left: offset, behavior: "smooth" });

  // Reset all cards first
  allCards.forEach(c => {
    c.classList.remove("showcase", "flipped");
  });

  // Activate clicked card
  card.classList.add("showcase", "flipped");

  updateCarouselVisuals();

  // Open devotion if linked
  const devotionId = card.dataset.devotionId;
  if (devotionId) {
    toggleDevotion(document.getElementById(devotionId));
  }
});

// ========================= DEVOTIONS =========================
function toggleDevotion(targetDev) {
  if (!targetDev) return;
  const isOpening = !targetDev.classList.contains("open");

  // Close all other devotions
  UI.devotions.forEach(dev => {
    dev.classList.remove("active", "open");
    const body = dev.querySelector(".devotion-body");
    if (body) body.style.maxHeight = null;
  });

  if (isOpening) {
    targetDev.classList.add("active", "open");
    UI.devotionsSection?.classList.add("active");

    const body = targetDev.querySelector(".devotion-body");
    if (body) body.style.maxHeight = body.scrollHeight + "px";

    setTimeout(() => targetDev.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  } else {
    UI.devotionsSection?.classList.remove("active");
  }
}

// Click anywhere on devotion container to toggle
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

// ========================= INIT =========================
window.addEventListener("load", () => {
  initCarousel();
  updateCarouselVisuals();
});
window.addEventListener("resize", updateCarouselVisuals);
