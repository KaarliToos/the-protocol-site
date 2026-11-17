(() => {
  'use strict';
  const domains = {
    sommeil: ['😴', 'Sommeil', 'Sleep', 'Alvás', '#dceaff'],
    mental: ['🧠', 'Mental', 'Mind', 'Mentális', '#ffedb5'],
    routine: ['🌱', 'Routine', 'Routine', 'Szokások', '#e6d9ff'],
    nutrition: ['🥗', 'Nutrition', 'Nutrition', 'Táplálkozás', '#c9efdc'],
    performance: ['💪', 'Physique', 'Movement', 'Mozgás', '#ffd1da']
  };
  const labels = {
    toolbox: ['Boîte à outils', 'Toolbox', 'Eszköztár'], guide: ['Mon guide', 'My guide', 'Útmutatóm'],
    apprendre: ['Apprendre', 'Learn', 'Tanulás'], programme: ['Défi 31 jours', '31-day challenge', '31 napos kihívás'],
    bibliotheque: ['Livres & guides', 'Books & guides', 'Könyvek és útmutatók'], applications: ['Applications', 'Apps', 'Alkalmazások'],
    profil: ['Mon évolution', 'My progress', 'Fejlődésem'], outil: ['Mon outil', 'My tool', 'Eszközöm'],
    'nutrition-notes': ['Mes notes nutrition', 'My nutrition notes', 'Táplálkozási jegyzeteim'], 'shop-domaine': ['Les essentiels', 'The essentials', 'Kellékek']
  };
  const t = (fr, en, hu = fr) => document.documentElement.lang === 'en' ? en : document.documentElement.lang === 'hu' ? hu : fr;
  const params = new URLSearchParams(location.search);
  const candidate = document.body.dataset.domain || params.get('domain');
  const domain = Object.hasOwn(domains, candidate) ? candidate : null;
  const page = document.body.dataset.page || location.pathname.split('/').pop().replace('.html', '');
  const home = document.getElementById('home-lumi');
  const make = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
  const safeRead = key => { try { const x = JSON.parse(localStorage.getItem(key) || 'null'); return x && typeof x === 'object' ? x : null; } catch { return null; } };
  const normalize = text => text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function skipLink() {
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
    const link = make('a', 'protocol-skip-link');
    link.dataset.noTranslate = '';
    link.href = '#' + main.id;
    main.setAttribute('tabindex', '-1');
    const updateLabel = () => {
      link.textContent = t('Aller au contenu', 'Skip to content', 'Ugrás a tartalomra');
    };
    updateLabel();
    document.body.prepend(link);
    new MutationObserver(updateLabel).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  }
  function breadcrumb() {
    const content = document.querySelector('.exp-content, .nutrition-editor');
    if (!content || !labels[page] || content.querySelector('.route-trail')) return;
    const nav = make('nav', 'route-trail'); nav.dataset.noTranslate = ''; nav.setAttribute('aria-label', t('Fil de navigation', 'Breadcrumb', 'Navigáció'));
    const a = make('a', '', t('Accueil', 'Home', 'Kezdőlap')); a.href = 'index.html#domaines'; nav.append(a);
    if (domain) { nav.append(make('span', '', '/')); const d = make('a', '', t(...domains[domain].slice(1, 4))); d.href = domain + '.html'; nav.append(d); }
    nav.append(make('span', '', '/')); const current = make('span', '', t(...labels[page])); current.setAttribute('aria-current', 'page'); nav.append(current);
    content.prepend(nav);
  }
  function homeHeading() {
    const hub = document.querySelector('.home-actions.new-hub');
    if (!hub || document.querySelector('.home-hub-heading')) return;
    const section = make('div', 'home-hub-heading'); section.dataset.noTranslate = '';
    section.append(make('span', 'section-eyebrow', t('À TOI DE JOUER', 'YOUR NEXT MOVE', 'TE JÖSSZ')), make('h2', '', t('Ton prochain petit pas.', 'Your next small step.', 'A következő kis lépésed.')), make('p', '', t('Un outil, une idée ou un défi. Choisis ce qui te donne envie d’avancer.', 'A tool, an idea or a challenge. Choose what makes you want to move forward.', 'Egy eszköz, ötlet vagy kihívás. Válaszd, ami előrevisz.')));
    hub.before(section);
  }
  function resume() {
    if (!home || document.querySelector('.resume-journey')) return;
    const last = safeRead('site2-last-journey');
    if (!last || !labels[last.page] || !Object.hasOwn(domains, last.domain)) return;
    let route;try{route=new URL(last.href||'',location.href);}catch{return;}
    const allowed = ['toolbox.html', 'guide.html', 'apprendre.html', 'programme.html', 'outil.html', 'nutrition-outils.html'];
    if (route.origin !== location.origin || !allowed.includes(route.pathname.split('/').pop()) || route.searchParams.get('domain') !== last.domain) return;
    const card = make('section', 'resume-journey'); card.dataset.noTranslate = '';
    const copy = make('div'); copy.append(make('span', 'section-eyebrow', t('ON REPREND ?', 'PICK UP WHERE YOU LEFT OFF', 'FOLYTATJUK?')), make('h2', '', domains[last.domain][0] + ' ' + t(...labels[last.page])), make('p', '', t(...domains[last.domain].slice(1, 4))));
    const link = make('a', 'solid-button', t('Reprendre →', 'Continue →', 'Folytatás →')); link.href = route.pathname.split('/').pop() + route.search;
    card.append(copy, link); document.querySelector('.pillar-board')?.after(card);
  }
  function remember() {
    if (!domain || !['toolbox', 'guide', 'apprendre', 'programme', 'outil', 'nutrition-notes'].includes(page)) return;
    const q = new URLSearchParams(); q.set('domain', domain);
    if (page === 'outil' && ['focus', 'journal', 'checklist', 'respiration', 'courses', 'focus-card'].includes(params.get('tool'))) q.set('tool', params.get('tool'));
    if (page === 'nutrition-notes' && ['recipes', 'plan', 'tracker', 'water'].includes(params.get('outil'))) q.set('outil', params.get('outil'));
    try { localStorage.setItem('site2-last-journey', JSON.stringify({ page, domain, href: location.pathname.split('/').pop() + '?' + q.toString() })); } catch {}
  }
  function personalPillars() {
    if (page !== 'profil' || document.querySelector('.profile-personal-card')) return;
    const data = safeRead('site2-lumi-profile-v1');
    const selected = Array.isArray(data?.answers?.pillars) ? [...new Set(data.answers.pillars.filter(k => Object.hasOwn(domains, k)))].slice(0, 3) : [];
    if (!selected.length) return;
    const card = make('section', 'profile-personal-card'); card.dataset.noTranslate = '';
    card.append(make('span', 'section-eyebrow', t('TON CAP', 'YOUR DIRECTION', 'AZ IRÁNYOD')), make('h2', '', t('Tes piliers, à portée de main.', 'Your pillars, one tap away.', 'Területeid egy érintésre.')));
    const links = make('div', 'profile-pillar-links');
    selected.forEach(k => { const a = make('a', '', domains[k][0] + ' ' + t(...domains[k].slice(1, 4))); a.href = k + '.html'; a.style.setProperty('--chip', domains[k][4]); links.append(a); });
    card.append(links); const edit = make('a', 'text-link', t('Modifier mes choix avec Lumi →', 'Edit my choices with Lumi →', 'Választásaim módosítása Lumival →')); edit.href = 'profil-lumi.html'; card.append(edit);
    document.querySelector('.profile-page .profile-stats')?.before(card);
  }
  let rememberedFilter='all';
  function toolSearch() {
    const grid = document.querySelector('.tool-grid');
    if (!grid || document.querySelector('.tool-discovery')) return;
    const water=document.querySelector('.nutrition-shortcuts a[href*="outil=water"] .clay-icon');if(water){const icon=make('span','refined-water-icon','💧');icon.setAttribute('aria-hidden','true');water.replaceWith(icon);}
    const panel = make('section', 'tool-discovery'); panel.dataset.noTranslate = '';
    const label = make('label', '', t('Qu’as-tu envie d’essayer ?', 'What would you like to try?', 'Mit próbálnál ki?')); label.htmlFor = 'tool-search';
    const input = make('input'); input.id = 'tool-search'; input.type = 'search'; input.autocomplete = 'off'; input.placeholder = t('Journal, respiration, checklist…', 'Journal, breathing, checklist…', 'Napló, légzés, lista…');
    const filters = make('div', 'tool-filter-options'); filters.setAttribute('role', 'group'); filters.setAttribute('aria-label', t('Filtrer les outils', 'Filter tools', 'Eszközszűrő'));
    const options = [['all', 'Tous', 'All', 'Mind'], ['write', '✍️ Écrire', '✍️ Write', '✍️ Írás'], ['breathe', '🫧 Souffler', '🫧 Breathe', '🫧 Légzés'], ['plan', '🧭 M’organiser', '🧭 Plan', '🧭 Tervezés']];
    const status = make('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    let selected = rememberedFilter;
    function apply() {
      let count = 0; const query = normalize(input.value);
      document.querySelectorAll('.tool-grid .tool-tile,.nutrition-shortcuts>a').forEach(tile => {
        const u = new URL(tile.href, location.href); const id = u.searchParams.get('outil') || u.searchParams.get('tool') || 'focus';
        const category = ['journal','tracker'].includes(id) ? 'write' : id === 'respiration' ? 'breathe' : 'plan';
        const show = (selected === 'all' || selected === category) && normalize(tile.textContent).includes(query);
        tile.hidden = !show; if (show) count++;
      });
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === selected)));
      status.textContent = count ? t(count + (count === 1 ? ' outil à explorer' : ' outils à explorer'), count + (count === 1 ? ' tool to explore' : ' tools to explore'), count + ' eszköz') : t('Aucun outil trouvé. Essaie un autre mot ou le filtre « Tous ».', 'No tools found. Try another word or select “All”.', 'Nincs találat. Próbálj más szót, vagy válaszd a „Mind” szűrőt.');
    }
    options.forEach(([id, ...texts]) => { const b = make('button', '', t(...texts)); b.type = 'button'; b.dataset.filter = id; b.onclick = () => { selected = id; rememberedFilter=id; apply(); }; filters.append(b); });
    input.addEventListener('input', apply); panel.append(label, input, filters, status); const shortcuts=document.querySelector('.nutrition-shortcuts');if(shortcuts)shortcuts.before(panel);else grid.before(panel);apply();
  }
  function domainSteps() {
    const nav = document.querySelector('.phase-nav');
    if (!nav || nav.dataset.refined) return;
    nav.dataset.refined = 'true';
    nav.querySelectorAll('[data-reveal]').forEach(button => { button.textContent = button.textContent.replace(/\s*\+\s*$/, ' ↘'); button.setAttribute('aria-controls', button.dataset.reveal); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const active = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (active) nav.querySelectorAll('[data-reveal]').forEach(b => b.setAttribute('aria-current', String(b.dataset.reveal === active.target.id)));
      }, { rootMargin: '-10% 0px -45% 0px', threshold: [0, .1, .3] });
      ['problems', 'solutions', 'benefits'].forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    }
  }
  function enhance() { breadcrumb(); homeHeading(); resume(); personalPillars(); toolSearch(); domainSteps(); }
  skipLink();
  remember(); enhance();
  window.addEventListener('storage',e=>{if(e.key==='site2-lumi-profile-v1'){document.querySelector('.profile-personal-card')?.remove();personalPillars();}});
  let pending = false;
  new MutationObserver(() => { if (pending) return; pending = true; queueMicrotask(() => { pending = false; enhance(); }); }).observe(document.getElementById('experience-root') || document.querySelector('main') || document.body, { childList: true, subtree: true });
  new MutationObserver(() => {
    const query = document.querySelector('#tool-search')?.value || '';rememberedFilter=document.querySelector('.tool-filter-options [aria-pressed=true]')?.dataset.filter||rememberedFilter;
    document.querySelectorAll('.route-trail,.home-hub-heading,.resume-journey,.profile-personal-card,.tool-discovery').forEach(el => el.remove());
    enhance(); const input = document.querySelector('#tool-search'); if (input) { input.value = query; input.dispatchEvent(new Event('input')); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
