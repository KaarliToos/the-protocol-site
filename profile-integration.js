(() => {
  'use strict';
  const key = 'site2-lumi-profile-v1';
  const t = (fr, en, hu = fr) => ({ en, hu }[document.documentElement.lang] || fr);
  const home = document.getElementById('home-lumi');
  let returned = false, opener = null, previousOverflow = '';
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; } };
  const dialog = document.createElement('dialog');
  dialog.className = 'profile-popup';
  dialog.dataset.noTranslate = '';
  dialog.innerHTML = '<button type="button" class="popup-close">✕</button><iframe title="Profil avec Lumi" src="about:blank"></iframe>';
  const frame = dialog.querySelector('iframe');
  document.body.append(dialog);
  function labels() {
    dialog.setAttribute('aria-label', t('Ton profil avec Lumi', 'Your profile with Lumi', 'Profilod Lumival'));
    frame.title = dialog.getAttribute('aria-label');
    dialog.querySelector('button').setAttribute('aria-label', t('Fermer le profil', 'Close profile', 'Profil bezárása'));
  }
  function updateWelcome() {
    if (!home) return;
    const state = read();
    const started = state.done || state.step > 1;
    const message = home.querySelector('.welcome-message');
    message.textContent = returned || state.done
      ? t('Ton profil est ici ✨\nTu peux y revenir quand tu veux.\nOn continue la visite ensemble ?', 'Your profile is here ✨\nCome back whenever you like.\nShall we keep exploring?', 'Itt a profilod ✨\nBármikor visszatérhetsz.\nFolytassuk a felfedezést?')
      : t('Coucou, je suis Lumi 👋\nClique sur moi pour créer ton profil !', 'Hi, I’m Lumi 👋\nClick me to create your profile!', 'Szia, Lumi vagyok 👋\nKattints rám a profilod elkészítéséhez!');
    home.querySelector('.welcome-start').textContent = state.done
      ? t('✨ Retrouver mon profil', '✨ My profile', '✨ Profilom')
      : started ? t('✨ Reprendre mon profil', '✨ Resume my profile', '✨ Profil folytatása') : t('✨ Créer mon profil', '✨ Create my profile', '✨ Profil létrehozása');
    home.querySelector('.welcome-character').setAttribute('aria-label', home.querySelector('.welcome-start').textContent);
    home.querySelector('.welcome-continue').textContent = t('Continuer ma visite ↓', 'Continue exploring ↓', 'Tovább a felfedezéshez ↓');
  }
  function open(source) {
    if (read().done) {
      location.href = 'mon-profil.html';
      return;
    }
    if (dialog.open) return;
    opener = source instanceof HTMLElement ? source : document.activeElement;
    previousOverflow = document.body.style.overflow;
    const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
    frame.src = 'profil-lumi.html?embed=1&lang=' + lang + '&theme=' + (document.documentElement.dataset.theme || 'light');
    labels(); dialog.showModal(); document.body.style.overflow = 'hidden';
  }
  function close() { if (dialog.open) dialog.close(); }
  dialog.querySelector('button').onclick = close;
  dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    returned = true; updateWelcome();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('message', e => {
    if (e.source !== frame.contentWindow || e.origin !== location.origin) return;
    if (e.data?.type === 'lumi-profile-close') close();
  });
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button > 0) return;
    const trigger = e.target.closest('[data-profile-open],a[href]');
    if (!trigger) return;
    if (!trigger.hasAttribute('data-profile-open')) {
      const url = new URL(trigger.href, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('/profil-lumi.html') || trigger.target === '_blank') return;
    }
    e.preventDefault(); open(trigger);
  });
  if (home) {
    home.dataset.noTranslate = '';
    home.innerHTML = `<section class="welcome-lumi"><button type="button" class="welcome-character" data-profile-open>${window.profileLumiAvatar}<small>LUMI</small></button><div class="welcome-dialog"><p class="welcome-message"></p><div class="welcome-actions"><button type="button" class="welcome-start" data-profile-open></button><a class="welcome-continue" href="#choisir-domaines"></a></div></div></section>`;
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) home.classList.add('lumi-arrived');
    }, { threshold: .1 }).observe(home);
    else home.classList.add('lumi-arrived');
  }
  if (document.body.dataset.page === 'profil') {
    const entry = document.createElement('a');
    entry.href = 'profil-lumi.html'; entry.className = 'profile-entry'; entry.dataset.noTranslate = '';
    const update = () => { entry.textContent = t('✨ Mes repères personnels avec Lumi →', '✨ My personal insights with Lumi →', '✨ Személyes adataim Lumival →'); };
    document.getElementById('experience-root').prepend(entry); update();
    new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  window.ProtocolProfile = { open, close };
  labels(); updateWelcome();
  new MutationObserver(() => { labels(); updateWelcome(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
