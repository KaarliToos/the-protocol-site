(() => {
  'use strict';
  if (!window.profileLumiAvatar) return;
  const domains = ['sommeil', 'mental', 'routine', 'nutrition', 'performance'];
  const params = new URLSearchParams(location.search);
  const rawDomain = document.body.dataset.domain || params.get('domain');
  const domain = domains.includes(rawDomain) ? rawDomain : null;
  const query = domain ? '?domain=' + domain : '';
  const page = document.body.dataset.page || location.pathname.split('/').pop().replace('.html', '');
  const home = document.getElementById('home-lumi');
  const t = (fr, en, hu = fr) => ({ en, hu }[document.documentElement.lang] || fr);
  let enabled = true;
  try { enabled = localStorage.getItem('site2-lumi-helper') !== 'off'; } catch {}
  document.body.classList.add('has-live-lumi');

  const menu = document.createElement('div');
  menu.className = 'floating-menu'; menu.dataset.noTranslate = '';
  menu.innerHTML = '<button type="button" class="menu-trigger" aria-expanded="false" aria-controls="protocol-menu">☰ Menu</button><nav id="protocol-menu" hidden></nav>';
  const nav = menu.querySelector('nav'), trigger = menu.querySelector('.menu-trigger');
  const prefs = document.createElement('div'); prefs.className = 'menu-preferences';
  document.body.append(menu);
  function closeMenu(focus = false) { nav.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (focus) trigger.focus(); }
  trigger.onclick = () => { nav.hidden = !nav.hidden; trigger.setAttribute('aria-expanded', String(!nav.hidden)); };
  document.addEventListener('click', e => { if (!menu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) { e.preventDefault(); closeMenu(true); } });
  function buildMenu() {
    const items = [
      ['⌂ ' + t('Accueil', 'Home', 'Kezdőlap'), 'index.html'],
      ['🌈 ' + t('Les cinq domaines', 'Five domains', 'Az öt terület'), 'index.html#choisir-domaines'],
      ['🧰 ' + t('Boîte à outils', 'Toolbox', 'Eszköztár'), 'toolbox.html' + query],
      ['📖 ' + t('Apprendre', 'Learn', 'Tanulás'), 'apprendre.html' + query],
      ['📚 ' + t('Livres & guides', 'Books & guides', 'Könyvek és útmutatók'), 'bibliotheque.html' + query],
      ['📅 ' + t('Défi 31 jours', '31-day challenge', '31 napos kihívás'), 'programme.html' + query],
      ['✨ ' + t('Mon profil', 'My profile', 'Profilom'), 'profil.html'],
      ['🛍️ ' + t('Boutique', 'Shop', 'Bolt'), domain ? 'shop-domaine.html' + query : 'shop-domaines.html']
    ];
    nav.replaceChildren();
    nav.setAttribute('aria-label', t('Menu du site', 'Site menu', 'Oldalmenü'));
    for (const [label, href] of items) {
      const a = document.createElement('a'); a.href = href; a.textContent = label;
      if (new URL(href, location.href).pathname === location.pathname && !href.includes('#')) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', () => closeMenu()); nav.append(a);
    }
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'helper-toggle';
    toggle.onclick = () => { enabled = !enabled; try { localStorage.setItem('site2-lumi-helper', enabled ? 'on' : 'off'); } catch {} updateEnabled(); };
    nav.append(toggle, prefs); updateEnabled(); movePreferences();
  }
  function movePreferences() {
    const toolbar = document.querySelector('.site-preferences');
    if (toolbar && toolbar.parentElement !== prefs) prefs.append(toolbar);
  }
  function updateEnabled() {
    document.body.classList.toggle('lumi-disabled', !enabled);
    const toggle = nav.querySelector('.helper-toggle');
    if (!toggle) return;
    toggle.textContent = enabled ? t('✨ Lumi : activée', '✨ Lumi: on', '✨ Lumi: bekapcsolva') : t('✨ Lumi : désactivée', '✨ Lumi: off', '✨ Lumi: kikapcsolva');
    toggle.setAttribute('aria-pressed', String(enabled));
  }

  const messages = {
    domain: ['Touche une carte.\nOn regarde ensemble\nce qui peut t’aider.', 'Tap a card.\nLet’s explore together\nwhat might help.', 'Koppints egy kártyára.\nNézzük meg együtt,\nmi segíthet.'],
    profil: ['Voici tes petits progrès.\nTes repères personnels sont ici.\nPuis choisis ta prochaine mission ✨', 'Here are your small wins.\nYour personal insights are here.\nThen choose your next mission ✨'],
    toolbox: domain ? ['Choisis ton outil.\nÉcris, respire ou prépare\nton prochain petit pas ✨', 'Choose your tool.\nWrite, breathe or plan\nyour next small step ✨'] : ['Choisis ton domaine.\nJe te montrerai\nles outils qui vont avec 🌈', 'Choose your domain.\nI’ll show you\nthe matching tools 🌈'],
    apprendre: ['Une explication à la fois.\nPuis essaie un petit outil\npour passer à l’action ✨', 'One explanation at a time.\nThen try a small tool\nto take action ✨'],
    guide: ['Ouvre une étape du guide.\nChaque lien t’emmène\nvers la bonne action 📖', 'Open one guide step.\nEach link takes you\nto the right action 📖'],
    programme: ['Choisis un jour.\nEssaie sa petite mission.\nCoche-la quand tu as fini ✨', 'Choose a day.\nTry its small mission.\nTick it when you’re done ✨'],
    outil: ['Cet outil garde tes notes\ndans ce navigateur.\nReviens quand tu veux ✨', 'This tool keeps your notes\nin this browser.\nCome back anytime ✨'],
    'nutrition-notes': ['Pose tes idées ici.\nEnregistre tes notes,\npuis prépare tes courses 🥗', 'Write your ideas here.\nSave your notes,\nthen plan your groceries 🥗'],
    bibliotheque: ['Choisis le guide\ndu domaine qui te parle.\nOn avance à ton rythme 📚', 'Choose the guide\nfor your chosen domain.\nWe’ll go at your pace 📚'],
    applications: ['Un outil, un petit pas.\nChoisis ce que tu veux\nessayer aujourd’hui ✨', 'One tool, one small step.\nChoose what you’d like\nto try today ✨']
  };
  const helper = document.createElement('aside'); helper.className = 'live-helper'; helper.dataset.noTranslate = ''; helper.setAttribute('aria-label', 'Lumi');
  let bubbleOpen = false;
  function helperContent() {
    const message = messages[page] || ['Je suis là pour t’aider.\nRetrouve tes outils\net ton prochain petit pas ✨', 'I’m here to help.\nFind your tools\nand your next small step ✨'];
    const toolGrid=document.querySelector('.tool-grid');if(toolGrid)toolGrid.id='my-tools';const choices=document.querySelector('.domain-choices');if(choices&&!choices.id)choices.id='choose-domain';
    const url = page === 'toolbox' ? (toolGrid?'#my-tools':'#choose-domain') : page === 'bibliotheque' ? (domain?'guide.html'+query:'#choose-domain') : page === 'profil' ? 'profil-lumi.html' : page === 'outil' || page === 'nutrition-notes' ? 'toolbox.html' + query : page === 'programme' ? 'profil.html' : 'toolbox.html' + query;
    const label = page === 'toolbox' ? (toolGrid?t('Choisir un outil ↓','Choose a tool ↓'):t('Choisir mon domaine ↓','Choose my domain ↓')) : page === 'bibliotheque' ? t('Choisir mon guide →','Choose my guide →') : page === 'profil' ? t('Mes repères personnels →', 'My personal insights →') : page === 'programme' ? t('Voir mes progrès →', 'See my progress →') : t('Retrouver mes outils →', 'Open my tools →');
    helper.innerHTML = `<button type="button" class="helper-character" aria-expanded="${bubbleOpen}" aria-controls="lumi-helper-speech">${window.profileLumiAvatar}<small>LUMI</small></button><div class="helper-speech" id="lumi-helper-speech" ${bubbleOpen ? '' : 'hidden'}><p></p><a href="${url}"></a><button type="button" class="helper-dismiss">×</button></div>`;
    helper.querySelector('p').textContent = t(...message);
    helper.querySelector('a').textContent = label;
    const character = helper.querySelector('.helper-character');
    character.setAttribute('aria-label', t('Parler à Lumi', 'Talk to Lumi', 'Beszélgetés Lumival'));
    character.onclick = () => { bubbleOpen = !bubbleOpen; helperContent(); helper.querySelector('.helper-character').focus({preventScroll:true}); wiggle(helper); };
    helper.querySelector('.helper-dismiss').setAttribute('aria-label', t('Masquer cette bulle', 'Hide this bubble', 'Buborék elrejtése'));
    helper.querySelector('.helper-dismiss').onclick = () => { bubbleOpen = false; helperContent(); helper.querySelector('button').focus(); };
  }
  function placeHelper() {
    if (home || helper.isConnected) return;
    const cue = document.getElementById('sleep-lumi-cue');
    const old = document.querySelector('.lumi-message');
    const profile = document.querySelector('.profile-intro');
    if (cue || old || profile) {
      helper.classList.add('inline-helper'); bubbleOpen = true;
      if (cue) cue.append(helper); else if (old) old.replaceWith(helper); else profile.after(helper);
    } else { helper.classList.remove('inline-helper'); document.body.append(helper); }
    helperContent();
  }
  function wiggle(node) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.classList.remove('lumi-react'); void node.offsetWidth; node.classList.add('lumi-react');
    setTimeout(() => node.classList.remove('lumi-react'), 900);
  }
  document.addEventListener('pointerover', e => { const character = e.target.closest('.welcome-character'); if (character && !character.contains(e.relatedTarget)) wiggle(character); });
  document.addEventListener('click', e => { const character = e.target.closest('.welcome-character'); if (character) wiggle(character); });
  // Preserve the domain for tools, reading, catalogue and timer links.
  const scoped = new Set(['toolbox.html', 'apprendre.html', 'bibliotheque.html', 'applications.html', 'programme.html', 'guide.html', 'pomodoro.html', 'calendar.html']);
  function scopeLinks() {
    if (!domain) return;
    document.querySelectorAll('a[href]').forEach(a => {
      const u = new URL(a.href, location.href), file = u.pathname.split('/').pop();
      if(u.origin===location.origin&&file==='shop.html'&&!u.hash){a.setAttribute('href','shop-domaine.html'+query);return;}
      if (u.origin !== location.origin || !scoped.has(file) || u.searchParams.has('domain')) return;
      u.searchParams.set('domain', domain); a.setAttribute('href', file + u.search + u.hash);
    });
  }
  buildMenu(); placeHelper(); scopeLinks();
  let pending = false;
  new MutationObserver(() => {
    if (pending) return; pending = true;
    queueMicrotask(() => { pending = false; movePreferences(); placeHelper(); scopeLinks(); });
  }).observe(document.body, { childList: true, subtree: true });
  new MutationObserver(() => { buildMenu(); helperContent(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
