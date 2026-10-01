const body = document.body;
const menuButton = document.querySelector(".menu-button");
const navTargets = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");

menuButton?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navTargets.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));
