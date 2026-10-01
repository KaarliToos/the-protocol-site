const body = document.body;
const menuButton = document.querySelector(".menu-button");
const navTargets = document.querySelectorAll(".nav-links a, .header-actions a");
const revealItems = document.querySelectorAll(".reveal");
const filters = document.querySelectorAll("[data-filter]");
const products = document.querySelectorAll(".product-card");
const domainButtons = document.querySelectorAll("[data-domain]");
const domainDetail = document.querySelector(".domain-detail");
const domainKicker = document.querySelector("#domain-kicker");
const domainTitle = document.querySelector("#domain-title");
const domainCopy = document.querySelector("#domain-copy");
const domainActions = document.querySelector("#domain-actions");
const domainLink = document.querySelector("#domain-link");

const domains = {
  sleep: {
    kicker: "Domaine bleu",
    title: "Sommeil & recuperation",
    copy: "Reprendre de l'energie commence par des nuits plus simples, mieux observees et mieux protegees.",
    actions: ["Sleep Saver", "Respiration du soir", "Journal sommeil"],
    href: "#pourquoi",
  },
  nutrition: {
    kicker: "Domaine vert",
    title: "Nutrition & sante",
    copy: "Manger devient plus clair quand tu construis des reperes simples, visibles et faciles a tenir.",
    actions: ["Assiette simple", "Hydratation", "Liste courses"],
    href: "#shop",
  },
  performance: {
    kicker: "Domaine rouge",
    title: "Corps & performance",
    copy: "Le mouvement devient un jeu de progression: bouger, renforcer, recuperer, recommencer.",
    actions: ["Routine force", "Mobilite", "Suivi energie"],
    href: "#shop",
  },
  mental: {
    kicker: "Domaine orange",
    title: "Mental & apprentissage",
    copy: "Apprendre mieux, penser plus clair, creer davantage: un protocole pour ton attention.",
    actions: ["Focus block", "Notes actives", "Revue hebdo"],
    href: "#shop",
  },
  routine: {
    kicker: "Domaine violet",
    title: "Routine & motivation",
    copy: "Une vie plus stable se construit avec des petites actions visibles, repetables et motivantes.",
    actions: ["Planning rituel", "Tracker", "Reset du soir"],
    href: "#shop",
  },
};

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

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    products.forEach((product) => {
      const show = filter === "all" || product.dataset.category === filter;
      product.classList.toggle("hidden", !show);
    });
  });
});

domainButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const domain = domains[button.dataset.domain];
    if (!domain || !domainDetail) return;

    domainButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });

    domainDetail.dataset.activeDomain = button.dataset.domain;
    domainKicker.textContent = domain.kicker;
    domainTitle.textContent = domain.title;
    domainCopy.textContent = domain.copy;
    domainLink.href = domain.href;
    domainActions.replaceChildren(...domain.actions.map((action) => {
      const item = document.createElement("li");
      item.textContent = action;
      return item;
    }));
  });
});
