(() => {
  const requestedMinutes = new URLSearchParams(location.search).get('minutes');
  if (['5','10','15','25','30','45'].includes(requestedMinutes)) {
    document.querySelector('[data-minutes="' + requestedMinutes + '"]')?.click();
  }
  const modes = [...document.querySelectorAll('.mode')];
  modes.forEach(button => {
    button.setAttribute('aria-pressed', button.classList.contains('active'));
    button.addEventListener('click', () => {
      modes.forEach(mode => {mode.classList.toggle('active', mode === button); mode.setAttribute('aria-pressed', mode === button);});
      document.querySelector('.timer-main > p').textContent = 'Temps pour toi · ' + ['Sommeil', 'Nutrition', 'Activite', 'Apprendre', 'Routine'][modes.indexOf(button)];
    });
  });
  const buttons = [...document.querySelectorAll('.product-actions button')];
  if (buttons.length) {
    let cart = {};
    try { cart = JSON.parse(localStorage.getItem('site2-protocol-cart') || '{}'); if (!cart || Array.isArray(cart) || typeof cart !== 'object') cart = {}; } catch {}
    const panel = document.createElement('dialog');
    panel.className = 'cart-panel';
    const heading = document.createElement('h2'); heading.textContent = 'Ton panier';
    const note = document.createElement('p'); note.textContent = 'Démonstration : aucune commande ni aucun paiement ne sont effectués.';
    const list = document.createElement('div');
    const close = document.createElement('button'); close.textContent = 'Continuer la visite'; close.onclick = () => panel.close();
    panel.append(heading, note, list, close); document.body.append(panel);
    const toggle = document.createElement('button'); toggle.className = 'cart-toggle'; toggle.onclick = () => panel.showModal(); document.body.append(toggle);
    const render = () => {
      list.replaceChildren(); let count = 0;
      Object.entries(cart).forEach(([name, quantity]) => {
        if (!Number.isInteger(quantity) || quantity < 1) return;
        count += quantity;
        const row = document.createElement('p'); row.append(document.createTextNode(name + ' × ' + quantity + ' '));
        const remove = document.createElement('button'); remove.textContent = 'Retirer'; remove.onclick = () => {delete cart[name]; save();}; row.append(remove); list.append(row);
      });
      if (!count) list.textContent = 'Ton panier est vide.';
      toggle.textContent = 'Panier (' + count + ')';
    };
    const save = () => {try {localStorage.setItem('site2-protocol-cart', JSON.stringify(cart));} catch {} render();};
    buttons.forEach(button => button.addEventListener('click', () => {
      const name = button.closest('article').querySelector('h2').textContent;
      cart[name] = (Number.isInteger(cart[name]) ? cart[name] : 0) + 1; save(); panel.showModal();
    }));
    render();
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('video').forEach(video => {video.pause();video.removeAttribute('autoplay');video.controls = true;});
})();
