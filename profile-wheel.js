(function (root) {
  const definitions = [
    ['sommeil', '🌙', 'Sommeil', 'Sleep', '#4d8feb', [
      ['Je me réveille reposé·e', 'I wake up rested'], ['Mes horaires sont réguliers', 'My sleep schedule is regular'], ['Je prends le temps de ralentir le soir', 'I take time to unwind at night']
    ]],
    ['nutrition', '🥗', 'Nutrition', 'Nutrition', '#2ecc8a', [
      ['Je varie mes repas', 'I eat a variety of meals'], ['J’ai de l’eau à portée de main', 'I keep water within reach'], ['Je prévois des repas qui me conviennent', 'I plan meals that work for me']
    ]],
    ['performance', '👟', 'Mouvement', 'Movement', '#ff5c6c', [
      ['Je bouge au fil de la journée', 'I move throughout the day'], ['Je trouve une activité qui me plaît', 'I find movement I enjoy'], ['Je prévois du temps pour récupérer', 'I make time to recover']
    ]],
    ['mental', '🧠', 'Mental', 'Mind', '#7c59d1', [
      ['Je prends des pauses quand j’en ai besoin', 'I take breaks when I need them'], ['Je fais de la place pour apprendre', 'I make time to learn'], ['Je sais vers qui me tourner pour du soutien', 'I know where to turn for support']
    ]],
    ['routine', '🌱', 'Routine', 'Routine', '#ffda43', [
      ['Je sais quelle petite action faire ensuite', 'I know my next small action'], ['Je prends un moment pour organiser ma journée', 'I take a moment to plan my day'], ['Je reprends mes habitudes après un imprévu', 'I get back to my habits after a setback']
    ]]
  ];
  const score = answers => {
    const selected = answers.filter(value => [0, 1, 2].includes(value));
    return selected.length ? Math.round(100 * selected.reduce((total, value) => total + value, 0) / (2 * selected.length)) : null;
  };

  function render(target, data, t, save) {
    let active = null;
    const values = definitions.map(([id]) => score(data[id] || []));
    const point = (index, radius) => {
      const angle = index * 2 * Math.PI / definitions.length;
      return [125 + Math.sin(angle) * radius, 110 - Math.cos(angle) * radius];
    };
    const grid = [28, 56, 84].map(radius => '<polygon points="' + definitions.map((_, i) => point(i, radius).join(',')).join(' ') + '"/>').join('');
    const spokes = definitions.map(([, , , , color], i) => {
      const [x, y] = point(i, 84);
      const value = values[i];
      const [sx, sy] = point(i, 84 * (value ?? 0) / 100);
      return '<path d="M125 110 L' + x + ' ' + y + '"/>' + (value === null ? '' : '<path d="M125 110 L' + sx + ' ' + sy + '" style="stroke:' + color + ';stroke-width:6"/><circle cx="' + sx + '" cy="' + sy + '" r="5" fill="' + color + '"/>');
    }).join('');
    target.innerHTML = '<h2>🧭 ' + t('Ma roue de vie', 'My life wheel') + '</h2><svg class="life-wheel-chart" viewBox="0 0 250 210" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-opacity=".24">' + grid + spokes + '</g></svg><div class="life-wheel-options">' +
      definitions.map(([id, emoji, fr, en, color], i) => '<button type="button" data-pillar="' + id + '" aria-expanded="false" aria-controls="pillar-questions" style="--pillar-color:' + color + '"><span aria-hidden="true">' + emoji + '</span> ' + t(fr, en) + '<small>' + (values[i] === null ? t('À découvrir', 'To explore') : values[i] + ' / 100') + '</small></button>').join('') +
      '</div><p class="quiet">' + t('Chaque réponse vaut 0, 1 ou 2 points. Le score indique la moyenne de tes réponses, ramenée sur 100. Les questions ignorées ne comptent pas.', 'Each answer is worth 0, 1 or 2 points. The score is your average scaled to 100. Skipped questions are excluded.') + '</p><div id="pillar-questions"></div>';
    const panel = target.querySelector('#pillar-questions');
    const buttons = [...target.querySelectorAll('[data-pillar]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.pillar;
      const opening = active !== id;
      active = opening ? id : null;
      buttons.forEach(item => item.setAttribute('aria-expanded', String(opening && item === button)));
      if (!opening) {
        panel.replaceChildren();
        return;
      }
      const [, emoji, fr, en, , questions] = definitions.find(entry => entry[0] === id);
      panel.innerHTML = '<h3 tabindex="-1">' + emoji + ' ' + t(fr, en) + '</h3><p>' + t('Lumi : pense à tes derniers jours. Tu peux laisser des questions de côté.', 'Lumi: think about the past few days. You can skip any question.') + '</p>' +
        questions.map(([qFr, qEn], index) => '<fieldset><legend>' + t(qFr, qEn) + '</legend><div class="pillar-answer-options">' + [t('Passer', 'Skip'), t('Rarement', 'Rarely'), t('Parfois', 'Sometimes'), t('Souvent', 'Often')].map((label, position) => {
          const value = position - 1;
          return '<button type="button" data-question="' + index + '" data-answer="' + value + '" aria-pressed="' + ((data[id]?.[index] ?? -1) === value) + '">' + label + '</button>';
        }).join('') + '</div></fieldset>').join('') +
        '<a href="toolbox.html?domain=' + id + '" target="_top">' + t('Voir les outils de ce pilier →', 'See tools for this pillar →') + '</a><button type="button" class="text-button" data-close-pillar>' + t('Revenir à la roue', 'Back to the wheel') + '</button>';
      panel.querySelector('h3').focus();
      panel.querySelector('[data-close-pillar]').onclick = () => {
        render(target, data, t, save);
        target.querySelector('[data-pillar="' + id + '"]').focus();
      };
      panel.querySelectorAll('[data-answer]').forEach(option => option.addEventListener('click', () => {
        if (!data[id]) data[id] = [];
        const value = Number(option.dataset.answer);
        data[id][Number(option.dataset.question)] = value === -1 ? null : value;
        option.closest('fieldset').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === option)));
        const total = score(data[id]);
        button.querySelector('small').textContent = total === null ? t('À découvrir', 'To explore') : total + ' / 100';
        save();
        const updatedChart = document.createElement('div');
        render(updatedChart, data, t, save);
        target.querySelector('svg').replaceWith(updatedChart.querySelector('svg'));
      }));
    }));
  }
  const api = { score, render };
  if (typeof module !== 'undefined') module.exports = api;
  else root.ProfileWheel = api;
})(typeof window !== 'undefined' ? window : globalThis);
