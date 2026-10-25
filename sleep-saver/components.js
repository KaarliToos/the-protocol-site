export const routes = {
  home: "/sleep-saver/", breathing: "/sleep-saver/respiration/", body: "/sleep-saver/body-scan/",
  thought: "/sleep-saver/thought/", observe: "/sleep-saver/thought-observe/", imagination: "/sleep-saver/imagination/",
  check: "/sleep-saver/check/", goodnight: "/sleep-saver/goodnight/", reset: "/sleep-saver/reset/",
  science: "/sleep-saver/science/", benefits: "/sleep-saver/benefits/", test: "/sleep-saver/test/", images: "/sleep-saver/images/"
};

export const Brand = ({quiet=false}={}) => `<a class="brand ${quiet?'brand--quiet':''}" data-link href="${routes.home}" aria-label="THE PROTOCOL, accueil"><span class="brand__mark">∞</span><span><b>THE PROTOCOL</b><small>Unlock You</small></span></a>`;

export const Header = ({night=false, controls=false}={}) => `<header class="header ${night?'header--night':''}">${Brand({quiet:night})}${controls?`<nav class="night-controls" aria-label="Contrôles de séance"><button class="icon-control" data-pause aria-label="Mettre en pause">Ⅱ</button><a class="icon-control" data-link href="${routes.home}" aria-label="Arrêter et revenir à l’accueil">×</a></nav>`:''}</header>`;

export const ProgressDots = step => `<div class="progress" aria-label="Étape ${step} sur 4">${[1,2,3,4].map(n=>`<span class="progress__dot ${n===step?'is-active':''}"></span>`).join('')}</div>`;

export const Button = (label, href, {secondary=false, small=false}={}) => `<a class="button ${secondary?'button--secondary':''} ${small?'button--small':''}" data-link href="${href}">${label}</a>`;

export const Moon = ({sleeping=false, size='large'}={}) => `<div class="moon-object moon-object--${size} ${sleeping?'moon-object--sleeping':''}" role="img" aria-label="${sleeping?'Lune endormie':'Lune en laine'}"><span></span>${sleeping?'<i>z</i>':''}</div>`;

export const NightShell = ({step, tone=1, id, content}) => `<div class="app night tone-${tone}" data-screen="${id}">${Header({night:true,controls:true})}<main class="night-main">${step?ProgressDots(step):''}${content}</main></div>`;

export const DayShell = ({id, title, intro='', content, actions=''}) => `<div class="app day" data-screen="${id}">${Header()}<main class="day-main"><a class="back-link" data-link href="${routes.home}" aria-label="Retour à l’accueil">←</a><p class="eyebrow">Sleep Saver</p><h1>${title}</h1>${intro?`<p class="day-intro">${intro}</p>`:''}${content}${actions}</main></div>`;

export const Illustration = (kind, variant='wool') => `<div class="object object--${kind} object--${variant}" aria-hidden="true"><span></span></div>`;
