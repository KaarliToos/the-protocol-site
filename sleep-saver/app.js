import { screens } from './screens.js';
import { routes, Illustration } from './components.js';

const routeNames = new Map(Object.entries(routes).map(([name,path]) => [path, name]));
const app = document.querySelector('#app');
let timers = [];
let paused = false;
let soundEnabled = false;
let remainingTasks = [];

const normalize = path => path.endsWith('/') ? path : `${path}/`;
const later = (fn, delay) => {
  const task = {fn, due: Date.now() + delay, remaining: delay, timer: null};
  task.timer = window.setTimeout(() => { timers = timers.filter(t => t !== task); fn(); }, delay);
  timers.push(task);
  return task;
};

function clearTimers() {
  timers.forEach(task => clearTimeout(task.timer));
  timers = [];
  remainingTasks = [];
}

function navigate(url, replace=false) {
  const parsed = new URL(url, location.origin);
  const path = normalize(parsed.pathname);
  if (!routeNames.has(path)) return;
  history[replace ? 'replaceState' : 'pushState']({}, '', `${path}${parsed.search}`);
  render();
}

function routeName() {
  return routeNames.get(normalize(location.pathname)) || 'home';
}

function bindNavigation() {
  document.querySelectorAll('[data-link]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.href);
  }));
  document.querySelector('[data-pause]')?.addEventListener('click', togglePause);
  document.querySelector('[data-sound]')?.addEventListener('click', event => {
    soundEnabled = !soundEnabled;
    event.currentTarget.classList.toggle('is-active', soundEnabled);
    event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Couper le son' : 'Activer le son');
  });
}

function togglePause(event) {
  paused = !paused;
  event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
  event.currentTarget.setAttribute('aria-label', paused ? 'Reprendre' : 'Mettre en pause');
  document.querySelector('.app')?.classList.toggle('is-paused', paused);
  if (paused) {
    const now = Date.now();
    remainingTasks = timers.map(task => ({...task, remaining: Math.max(0, task.due - now)}));
    timers.forEach(task => clearTimeout(task.timer));
    timers = [];
  } else {
    const tasks = remainingTasks;
    remainingTasks = [];
    tasks.forEach(task => later(task.fn, task.remaining));
  }
}

function initBreathing() {
  const stage = document.querySelector('[data-breath-stage]');
  const count = document.querySelector('[data-breath-count]');
  const instruction = document.querySelector('[data-breath-instruction]');
  const moon = document.querySelector('.breathing-moon');
  const forced = new URLSearchParams(location.search).get('state');
  let elapsed = forced === 'exhale' ? 4 : 0;
  const tick = () => {
    const inPhase = elapsed % 10 < 4;
    const unit = elapsed % 10;
    stage.textContent = inPhase ? 'INSPIRE' : 'EXPIRE';
    count.textContent = inPhase ? 4 - unit : 10 - unit;
    instruction.textContent = inPhase ? 'Inspire doucement.' : 'Expire encore plus doucement.';
    moon.classList.toggle('is-exhaling', !inPhase);
    document.querySelector('.app').classList.toggle('is-exhaling', !inPhase);
    if (forced) return;
    elapsed += 1;
    if (elapsed >= 100) return completeBreathing();
    later(tick, 1000);
  };
  tick();
}

function completeBreathing() {
  document.querySelector('.breathing-moon').hidden = true;
  document.querySelector('[data-breath-instruction]').hidden = true;
  document.querySelector('[data-completion]').hidden = false;
}

const bodySteps = [
  ['jaw','MÂCHOIRE','Relâche ta mâchoire.<br>Laisse-la devenir lourde.'],
  ['shoulders','ÉPAULES','Laisse tomber tes épaules.'],
  ['hands','MAINS','Relâche tes mains et tes doigts.'],
  ['belly','VENTRE','Laisse ton ventre devenir souple.'],
  ['legs','JAMBES','Laisse tes jambes devenir lourdes.']
];

function initBody() {
  const figure = document.querySelector('[data-body-part]');
  const title = document.querySelector('[data-body-title]');
  const copy = document.querySelector('[data-body-copy]');
  const forced = new URLSearchParams(location.search).get('state');
  let index = Math.max(0, bodySteps.findIndex(step => step[0] === forced));
  const tick = () => {
    const [part,label,text] = bodySteps[index];
    figure.dataset.bodyPart = part;
    title.textContent = label;
    copy.innerHTML = text;
    if (forced) return;
    index += 1;
    if (index >= bodySteps.length) return later(() => {
      figure.hidden = true; title.hidden = true; copy.hidden = true;
      document.querySelector('[data-completion]').hidden = false;
    }, 9000);
    later(tick, 9000);
  };
  tick();
}

function initThought() { later(() => navigate(routes.observe), 9000); }

function initObserve() {
  const copy = document.querySelector('[data-observe-copy]');
  const phrases = ['…','Une pensée est arrivée ?','Observe-la.\nLaisse-la passer.','Et maintenant…','Quelle sera\nla suivante ?'];
  let round = 0;
  let index = 0;
  const tick = () => {
    copy.textContent = phrases[index];
    index += 1;
    if (index >= phrases.length) { index = 0; round += 1; }
    if (round >= 3) return later(() => {
      copy.hidden = true;
      document.querySelector('[data-completion]').hidden = false;
    }, 9000);
    later(tick, index === 1 ? 11000 : 7000);
  };
  tick();
}

const imaginationSteps = [
  ['leaf','Une feuille qui tombe doucement.'],['cloud','Un nuage qui avance lentement.'],
  ['stone','Une pierre au bord de l’eau.'],['star','Une étoile dans un ciel calme.'],['house','Une maison silencieuse au loin.']
];

function initImagination() {
  const holder = document.querySelector('[data-imagination-object]');
  const copy = document.querySelector('[data-imagination-copy]');
  const forced = new URLSearchParams(location.search).get('state');
  let index = Math.max(0, imaginationSteps.findIndex(step => step[0] === forced));
  const tick = () => {
    const [kind,text] = imaginationSteps[index];
    holder.classList.remove('is-visible');
    later(() => { holder.innerHTML = Illustration(kind); copy.textContent = text; holder.classList.add('is-visible'); }, 800);
    if (forced) return;
    index += 1;
    if (index >= imaginationSteps.length) return later(() => navigate(routes.check), 10000);
    later(tick, 10000);
  };
  tick();
}

function initGoodnight() {
  later(() => document.querySelector('[data-goodnight]')?.classList.add('is-visible'), 4000);
  later(() => document.querySelector('.goodnight')?.classList.add('is-gone'), 10000);
}

function render() {
  clearTimers();
  paused = false;
  const name = routeName();
  app.innerHTML = screens[name]();
  document.body.dataset.route = name;
  window.scrollTo(0,0);
  bindNavigation();
  ({breathing:initBreathing,body:initBody,thought:initThought,observe:initObserve,imagination:initImagination,goodnight:initGoodnight}[name])?.();
}

window.addEventListener('popstate', render);

render();
