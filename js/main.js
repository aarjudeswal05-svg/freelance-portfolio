/* =========================================================
   Aarju Deswal — Portfolio
   1. Mobile menu
   2. Active section in the navigation
   3. Scroll progress
   ========================================================= */

const header = document.querySelector(".site-header");
const nav = document.getElementById("primary-nav");
const navLinks = [...nav.querySelectorAll("a")];

/* ---------- 1. Mobile menu ---------- */
// A simple disclosure menu: it does not cover the page like a dialog,
// so focus is never trapped inside it.
const menuButton = document.querySelector(".menu-toggle");

// Must match the 760px breakpoint in styles.css
const mobileQuery = window.matchMedia("(max-width: 760px)");

function isMenuOpen() {
  return header.classList.contains("is-open");
}

function setMenu(open, returnFocus = false) {
  header.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  if (!open && returnFocus) menuButton.focus();
}

menuButton.addEventListener("click", () => setMenu(!isMenuOpen()));

// Any link in the header (menu items, logo, "Let's talk") closes the menu
header.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

// Escape closes it; focus goes back to the button if it was inside the menu
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isMenuOpen()) {
    setMenu(false, nav.contains(document.activeElement));
  }
});

// Clicking outside the header, or tabbing away from the button and menu, closes it
document.addEventListener("click", (event) => {
  if (isMenuOpen() && !header.contains(event.target)) setMenu(false);
});

header.addEventListener("focusout", (event) => {
  const next = event.relatedTarget;
  if (isMenuOpen() && next && next !== menuButton && !nav.contains(next)) {
    setMenu(false);
  }
});

// Widening the window to desktop size closes it
mobileQuery.addEventListener("change", (event) => {
  if (!event.matches) setMenu(false);
});

/* ---------- 2. Active section in the navigation ---------- */
// The observer watches a thin line 40% of the way down the screen.
// Whichever section crosses that line is the one being read.
const hero = document.getElementById("top");
const sections = [hero, ...navLinks.map((link) => document.querySelector(link.hash))];
const sectionsOnLine = new Set();
let atBottom = false; // set by the scroll code below

function updateActiveLink() {
  let current = null;

  if (atBottom) {
    // The last section may be too short to reach the line, so the bottom of the page counts as Contact
    current = sections[sections.length - 1];
  } else {
    // If two sections touch the line at once, the later one wins
    sections.forEach((section) => {
      if (sectionsOnLine.has(section)) current = section;
    });
    if (!current) return; // nothing on the line yet: keep the previous state
  }

  navLinks.forEach((link) => {
    if (current !== hero && link.hash === `#${current.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) sectionsOnLine.add(entry.target);
    else sectionsOnLine.delete(entry.target);
  });
  updateActiveLink();
}, { rootMargin: "-40% 0px -59% 0px" });

sections.forEach((section) => sectionObserver.observe(section));

/* ---------- 3. Scroll progress ---------- */
// Work is batched into at most one update per frame.
const progressBar = document.querySelector(".scroll-progress");
let updateQueued = false;

function updateProgress() {
  updateQueued = false;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  // A page too short to scroll is shown as fully read
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 1;
  progressBar.style.transform = `scaleX(${progress})`;

  const nowAtBottom = scrollable > 0 && window.scrollY >= scrollable - 2;
  if (nowAtBottom !== atBottom) {
    atBottom = nowAtBottom;
    updateActiveLink();
  }
}

function queueProgressUpdate() {
  if (updateQueued) return;
  updateQueued = true;
  requestAnimationFrame(updateProgress);
}

window.addEventListener("scroll", queueProgressUpdate, { passive: true });
window.addEventListener("resize", queueProgressUpdate);
updateProgress();
