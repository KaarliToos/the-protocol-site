const languages = {
 fr: ['Bienvenue','Créer. Jouer. Évoluer.','Bienvenue dans THE PROTOCOL','Domaines','Programme','Calendrier','Shop','Outils','Sommeil & récupération','Mental & apprentissage','Routine & motivation','Santé & nutrition','Corps & performance','Ton prochain petit pas.','Choisis un domaine, découvre une action et retrouve-la dans ton parcours.','Découvrir les outils','Suivre mes 31 jours','Comment ça marche','Choisir un domaine','Faire une action','Suivre sa progression','Gumi, ton compagnon','De quoi as-tu envie aujourd’hui ?','Me reposer','Me concentrer','Créer une habitude','Bouger','Concentration','Journal','Une idée à garder aujourd’hui ?','Enregistrer','Enregistré sur cet appareil','Démarrer','Pause','Réinitialiser','31 jours, à ton rythme.','Coche chaque journée où tu as réalisé ton action.','Les objets du protocole','Collection en préparation. Les achats ne sont pas encore disponibles.','Retour aux domaines','Une action pour aujourd’hui','Prends un moment pour préparer ton rituel du soir.','Choisis une seule tâche et accorde-lui un moment sans distraction.','Choisis une petite action que tu souhaites répéter demain.','Note une idée de repas que tu aimerais préparer.','Choisis un mouvement adapté à ton énergie du jour.','Fermer','Langue','Mode sombre','Mode clair','Ton journal reste dans ce navigateur.','Les visuels de collection sont présentés en français.'],
 en: ['Welcome','Create. Play. Evolve.','Welcome to THE PROTOCOL','Domains','Programme','Calendar','Shop','Tools','Sleep & recovery','Mind & learning','Routine & motivation','Health & nutrition','Body & performance','Your next small step.','Choose a domain, discover an action and bring it into your journey.','Explore the tools','Track my 31 days','How it works','Choose a domain','Take one action','Track your progress','Gumi, your companion','What would you like today?','Rest','Focus','Build a habit','Move','Focus','Journal','An idea worth keeping today?','Save','Saved on this device','Start','Pause','Reset','31 days, at your pace.','Mark each day when you completed your action.','The protocol collection','Collection in preparation. Purchases are not available yet.','Back to domains','One action for today','Take a moment to prepare your evening ritual.','Choose one task and give it some distraction-free time.','Choose one small action you would like to repeat tomorrow.','Write down a meal you would like to prepare.','Choose a movement that suits your energy today.','Close','Language','Dark mode','Light mode','Your journal stays in this browser.','Collection artwork is presented in French.'],
 es: ['Bienvenido','Crea. Juega. Evoluciona.','Bienvenido a THE PROTOCOL','Ámbitos','Programa','Calendario','Tienda','Herramientas','Sueño y recuperación','Mente y aprendizaje','Rutina y motivación','Salud y nutrición','Cuerpo y rendimiento','Tu próximo pequeño paso.','Elige un ámbito, descubre una acción e incorpórala a tu recorrido.','Explorar herramientas','Seguir mis 31 días','Cómo funciona','Elegir un ámbito','Realizar una acción','Seguir tu progreso','Gumi, tu compañero','¿Qué te apetece hoy?','Descansar','Concentrarme','Crear un hábito','Moverme','Concentración','Diario','¿Una idea para recordar hoy?','Guardar','Guardado en este dispositivo','Iniciar','Pausa','Reiniciar','31 días, a tu ritmo.','Marca cada día en el que hayas realizado tu acción.','Los objetos del protocolo','Colección en preparación. Las compras aún no están disponibles.','Volver a los ámbitos','Una acción para hoy','Dedica un momento a preparar tu ritual nocturno.','Elige una tarea y dedícale un momento sin distracciones.','Elige una pequeña acción para repetir mañana.','Anota una comida que te gustaría preparar.','Elige un movimiento adecuado a tu energía de hoy.','Cerrar','Idioma','Modo oscuro','Modo claro','Tu diario permanece en este navegador.','Las imágenes de la colección están en francés.'],
 de: ['Willkommen','Gestalten. Spielen. Wachsen.','Willkommen bei THE PROTOCOL','Bereiche','Programm','Kalender','Shop','Werkzeuge','Schlaf & Erholung','Denken & Lernen','Routine & Motivation','Gesundheit & Ernährung','Körper & Leistung','Dein nächster kleiner Schritt.','Wähle einen Bereich, entdecke eine Aktion und integriere sie in deinen Alltag.','Werkzeuge entdecken','Meine 31 Tage verfolgen','So funktioniert es','Bereich wählen','Eine Aktion ausführen','Fortschritt verfolgen','Gumi, dein Begleiter','Was möchtest du heute tun?','Ausruhen','Konzentrieren','Gewohnheit aufbauen','Bewegen','Konzentration','Tagebuch','Eine Idee für heute?','Speichern','Auf diesem Gerät gespeichert','Starten','Pause','Zurücksetzen','31 Tage, in deinem Tempo.','Markiere jeden Tag, an dem du deine Aktion ausgeführt hast.','Die Protokoll-Kollektion','Kollektion in Vorbereitung. Einkäufe sind noch nicht verfügbar.','Zurück zu den Bereichen','Eine Aktion für heute','Nimm dir Zeit für dein Abendritual.','Wähle eine Aufgabe und widme ihr Zeit ohne Ablenkung.','Wähle eine kleine Aktion, die du morgen wiederholen möchtest.','Notiere eine Mahlzeit, die du zubereiten möchtest.','Wähle eine Bewegung passend zu deiner heutigen Energie.','Schließen','Sprache','Dunkler Modus','Heller Modus','Dein Tagebuch bleibt in diesem Browser.','Die Kollektionsbilder sind auf Französisch.']
};
const files = ['sommeil','mental','routine','nutrition','performance'];
const colors = ['#0875ed','#d87900','#913bce','#00866f','#df2940'];
const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
let lang = read('protocol-language','fr');
if (!languages[lang]) lang = 'fr';
let dark = read('protocol-theme','light') === 'dark';
const storedSeconds = Number(read('protocol-timer-seconds', '1500'));
let seconds = Number.isFinite(storedSeconds) && storedSeconds >= 0 && storedSeconds <= 1500 ? Math.floor(storedSeconds) : 1500;
const storedDeadline = Number(read('protocol-timer-deadline', '0'));
let deadline = Number.isFinite(storedDeadline) && storedDeadline >= 0 && storedDeadline <= Date.now() + 1500000 ? storedDeadline : 0;
let timer;
function persistTimer() {
 save('protocol-timer-seconds', String(seconds));
 save('protocol-timer-deadline', String(deadline));
}
const page = location.pathname.split('/').pop().replace('.html','') || 'index';
let journalDraft = read('protocol-journal','');
const icons = {moon:'<i data-lucide="moon"></i>',sun:'<i data-lucide="sun"></i>',globe:'<i data-lucide="globe"></i>'};
const iconLibrary = document.createElement('script');
iconLibrary.src = 'assets/lucide.min.js';
iconLibrary.onload = () => window.lucide.createIcons();
document.head.append(iconLibrary);
function render() {
 clearInterval(timer); timer = null;
 const t = languages[lang];
 document.documentElement.lang = lang;
 document.documentElement.dataset.theme = dark ? 'dark' : 'light';
 const link = (file,text) => `<a href="${file}.html">${text}</a>`;
 const cards = files.map((f,i) => `<a class="domain" style="--accent:${colors[i]}" href="${f}.html"><div class="art art-${i}" role="img" aria-label="${t[8+i]}"></div><div class="domain-label"><h3>${t[8+i]}</h3><span aria-hidden="true">↗</span></div></a>`).join('');
 const nav = [['index#domaines',3],['programme',4],['outils',7],['calendrier',5],['shop',6]].map(([f,k])=>`<a ${page===f?'aria-current="page"':''} href="${f==='index#domaines'?'index.html#domaines':f+'.html'}">${t[k]}</a>`).join('');
 let content = '';
 if (page === 'index') content = `<section class="hero"><video autoplay muted loop playsinline poster="assets/domains-page.png"><source src="assets/hero-video.mp4" type="video/mp4"></video><div class="hero-copy"><h1>${t[0]}</h1><p>${t[1]}</p></div></section><section id="domaines" class="wrap"><h2>${t[2]}</h2><div class="domains">${cards}</div></section><section class="manifesto"><h2>ONE TOOL. ONE DAY. ONE ACTION.</h2>${link('programme',t[17]+' ↗')}</section>`;
 const domainIndex = files.indexOf(page);
 if (domainIndex >= 0) content = `<section class="wrap"><a class="back" href="index.html#domaines">← ${t[39]}</a><div class="domain-heading" style="--accent:${colors[domainIndex]}"><h1>${t[8+domainIndex]}</h1><div class="art art-${domainIndex}" role="img" aria-label="${t[8+domainIndex]}"></div></div><section class="action"><h2>${t[40]}</h2><p>${t[41+domainIndex]}</p><div class="actions">${link('outils',t[15]+' ↗')}${link('calendrier',t[16]+' ↗')}</div></section><h2>${t[3]}</h2><div class="related">${files.filter(f=>f!==page).map(f=>link(f,t[8+files.indexOf(f)])).join('')}</div></section>`;
 if (page === 'programme') content = `<section class="wrap"><p class="eyebrow">THE PROTOCOL / ${t[4]}</p><h1>${t[35]}</h1><p class="lead">${t[14]}</p><ol class="steps"><li><h2>${t[18]}</h2>${link('index',t[3]+' ↗')}</li><li><h2>${t[19]}</h2>${link('outils',t[7]+' ↗')}</li><li><h2>${t[20]}</h2>${link('calendrier',t[5]+' ↗')}</li></ol><div class="domains">${cards}</div></section>`;
 if (page === 'calendrier') content = `<section class="wrap"><p class="eyebrow">THE PROTOCOL / ${t[5]}</p><h1>${t[35]}</h1><p class="lead">${t[36]}</p><p id="progress" aria-live="polite"></p><div class="days">${Array.from({length:31},(_,i)=>`<button data-day="${i+1}" aria-pressed="${read('protocol-day-'+(i+1),'0')==='1'}">${i+1}</button>`).join('')}</div><div class="actions">${link('outils',t[15])}${link('programme',t[17])}</div></section>`;
 if (page === 'outils') content = `<section class="wrap"><p class="eyebrow">THE PROTOCOL / ${t[7]}</p><h1>${t[13]}</h1><div class="tools"><section id="focus"><h2>${t[27]}</h2><output id="clock">25:00</output><div class="actions"><button id="start">${t[32]}</button><button id="reset">${t[34]}</button></div></section><section><h2>${t[28]}</h2><label for="journal">${t[29]}</label><textarea id="journal" rows="7"></textarea><p>${t[50]}</p><button id="save">${t[30]}</button><p id="saved" role="status"></p></section></div><div class="actions">${link('calendrier',t[16])}${link('programme',t[17])}</div></section>`;
 if (page === 'shop') content = `<section class="wrap"><p class="eyebrow">THE PROTOCOL / ${t[6]}</p><h1>${t[37]}</h1><p class="lead">${t[38]}</p><p>${t[51]}</p><div class="products"><article><img src="assets/calendar-product.png" alt="${t[5]}"><h2>${t[5]}</h2>${link('calendrier',t[20]+' ↗')}</article><article><img src="assets/domains-cards.png" alt="THE PROTOCOL"><h2>${t[3]}</h2>${link('index',t[18]+' ↗')}</article></div></section>`;
 document.body.innerHTML = `<header><a class="brand" href="index.html"><span>THE</span><strong>PROTOCOL<span class="cross"> ×</span></strong></a><nav aria-label="THE PROTOCOL">${nav}</nav><div class="settings"><button id="theme" title="${dark?t[49]:t[48]}" aria-label="${dark?t[49]:t[48]}" aria-pressed="${dark}">${dark?icons.sun:icons.moon}</button><label class="language"><span aria-hidden="true">${icons.globe}</span><select aria-label="${t[47]}" id="language">${[['fr','Français'],['en','English'],['es','Español'],['de','Deutsch']].map(([v,n])=>`<option value="${v}" ${lang===v?'selected':''}>${n}</option>`).join('')}</select></label></div></header><main>${content}</main><footer><strong>THE PROTOCOL</strong><div>${nav}</div></footer><button id="gumi-launch" aria-expanded="false" aria-controls="gumi-panel" title="${t[21]}"><span class="gumi" aria-hidden="true"><i></i><i></i><b></b></span><span>Gumi</span></button><aside id="gumi-panel" hidden aria-label="${t[21]}"><button id="gumi-close" aria-label="${t[46]}">×</button><h2>${t[21]}</h2><p>${t[22]}</p><div class="gumi-links">${link('sommeil',t[23])}${link('mental',t[24])}${link('routine',t[25])}${link('performance',t[26])}${link('programme',t[17])}${link('outils',t[7])}</div></aside>`;
 window.lucide?.createIcons();
 const pageTitles = {programme:4, calendrier:5, shop:6, outils:7};
 document.title = `THE PROTOCOL — ${domainIndex>=0?t[8+domainIndex]:t[pageTitles[page] ?? 0]}`;
 document.querySelector('#theme').onclick=()=>{
  dark=!dark;save('protocol-theme',dark?'dark':'light');
  document.documentElement.dataset.theme=dark?'dark':'light';
  const button=document.querySelector('#theme');
  button.innerHTML=dark?icons.sun:icons.moon;
  button.title=dark?t[49]:t[48];
  button.setAttribute('aria-label',button.title);
  button.setAttribute('aria-pressed',String(dark));
  window.lucide?.createIcons();
 };
 document.querySelector('#language').onchange=e=>{lang=e.target.value;save('protocol-language',lang);render();};
 const launcher=document.querySelector('#gumi-launch'), panel=document.querySelector('#gumi-panel');
 const close=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();};
 launcher.onclick=()=>{panel.hidden=!panel.hidden;launcher.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)document.querySelector('#gumi-close').focus();};
 document.querySelector('#gumi-close').onclick=close;
 document.onkeydown=e=>{if(e.key==='Escape'&&!panel.hidden)close();};
 const progress=()=>{const count=document.querySelectorAll('[data-day][aria-pressed="true"]').length; const p=document.querySelector('#progress'); if(p)p.textContent=`${count} / 31`;};
 const storageError={fr:'Enregistrement impossible sur cet appareil. Tes changements ne sont pas sauvegardés.',en:'Unable to save on this device. Your changes have not been saved.',es:'No se puede guardar en este dispositivo. Los cambios no se han guardado.',de:'Speichern auf diesem Gerät nicht möglich. Deine Änderungen wurden nicht gespeichert.'}[lang];
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{
  const checked=b.getAttribute('aria-pressed')!=='true';
  if(!save('protocol-day-'+b.dataset.day,checked?'1':'0')){document.querySelector('#progress').textContent=storageError;return;}
  b.setAttribute('aria-pressed',String(checked));progress();
 });progress();
 const journal=document.querySelector('#journal');
 if(journal){journal.value=journalDraft;journal.oninput=()=>{journalDraft=journal.value;document.querySelector('#saved').textContent='';};document.querySelector('#save').onclick=()=>{document.querySelector('#saved').textContent=save('protocol-journal',journal.value)?t[31]:storageError;};
 const clock = () => {
  if (deadline) {
   seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
   if (!seconds) { deadline = 0; clearInterval(timer); timer = null; persistTimer(); }
  }
  document.querySelector('#clock').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  document.querySelector('#start').textContent = deadline ? t[33] : t[32];
 };
 clock();
 if (deadline) timer = setInterval(clock, 250);
 document.querySelector('#start').onclick = () => {
  clock();
  if (deadline) { deadline = 0; clearInterval(timer); timer = null; }
  else { if (!seconds) seconds = 1500; deadline = Date.now() + seconds * 1000; timer = setInterval(clock, 250); }
  persistTimer(); clock();
 };
 document.querySelector('#reset').onclick = () => {
  clearInterval(timer); timer = null; deadline = 0; seconds = 1500; persistTimer(); clock();
 };
 }
 window.ProtocolLumi?.mount({page, lang, t, cards, files, colors, read});
 window.ProtocolUpgrade?.mount({page,lang,t});
}
render();
window.addEventListener('beforeunload',event=>{
 if(page==='outils' && journalDraft!==read('protocol-journal','')){event.preventDefault();event.returnValue='';}
});
