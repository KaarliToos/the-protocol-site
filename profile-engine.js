(function(root){
 'use strict';
 const VERSION='1.0.0', KEY='protocol-unlock-v1';
 const option=(label,points)=>({label,points});
 const q=(id,label,max,options,type='choice')=>({id,label,max,type,options:options.map(o=>Array.isArray(o)?option(...o):option(o,null)),version:VERSION});
 const graded=['Jamais','Rarement','Parfois','Souvent','Presque toujours'].map((s,i)=>[s,[0,6,12,19,25][i]]);
 const questionnaires={
 nutrition:{label:'Nutrition',color:'#069e88',emoji:'🥗',questions:[
 q('n1','Combien de portions de fruits et légumes par jour ?',25,[['0',0],['1 à 2',10],['3 à 4',18],['5 ou plus',25]]),
 q('n2','Quels aliments font régulièrement partie de tes repas ?',20,[['Fruits et légumes',0],['Légumineuses',5],['Féculents complets',5],['Protéines végétales ou animales',5],['Huile d’olive, noix, graines, avocat',5]],'multi'),
 q('n3','À quelle fréquence manges-tu des aliments riches en protéines ?',15,[['Rarement',0],['Quelques fois par semaine',7],['Tous les jours',15]]),
 q('n4','Comment t’hydrates-tu pendant la journée ?',15,[['Très peu',0],['Régulièrement, avec des oublis',8],['De l’eau tout au long de la journée',15]]),
 q('n5','Boissons sucrées ou snacks très sucrés ou salés : à quelle fréquence ?',25,[['Rarement',25],['1 à 2 jours par semaine',18],['3 à 4 jours',10],['Presque tous les jours',0]])]},
 activity:{label:'Activité',color:'#ef3454',emoji:'💪',questions:[
 q('a1','Combien de jours d’activité physique par semaine ?',10,[['Aucun',0],['1 à 2',4],['3 à 4',8],['5 ou plus',10]]),
 q('a2','Quelles activités pratiques-tu ?',0,['Marche','Course','Vélo','Musculation','Fitness','Natation','Yoga / mobilité','Sport collectif','Autre'],'multi'),
 {...q('a3','Ton endurance sur une semaine ?',45,[],'cardio'),hint:'Modérée : marche rapide, vélo tranquille. Intense : course ou vélo soutenu. Ne compte pas automatiquement le renforcement comme du cardio.'},
 q('a4','Combien de jours de renforcement musculaire ?',25,[['0',0],['1',12],['2 ou plus',25]]),
 q('a5','Combien bouges-tu chaque jour en dehors du sport ?',20,[['Moins de 15 minutes',0],['15 à 30 minutes',6],['30 à 60 minutes',12],['Plus de 60 minutes',20]])]},
 sleep:{label:'Sommeil',color:'#0964ff',emoji:'🌙',questions:[
 q('s1','Combien d’heures dors-tu habituellement ?',25,[['Moins de 5 h',0],['5 à moins de 6 h',8],['6 à moins de 7 h',17],['7 à 9 h',25],['Plus de 9 h',17]]),
 q('s2','Combien de temps pour t’endormir ?',15,[['Moins de 15 min',15],['15 à 30 min',12],['30 à 60 min',6],['Plus d’une heure',0]]),
 q('s3','Te réveilles-tu pendant la nuit ?',15,[['Jamais ou presque',15],['Parfois',10],['Souvent',5],['Très souvent',0]]),
 q('s4','Tes horaires de sommeil sont-ils réguliers ?',20,[['Très réguliers',20],['Plutôt réguliers',14],['Assez variables',7],['Très variables',0]]),
 q('s5','Comment te sens-tu au réveil ?',25,[['Reposé',25],['Plutôt bien',18],['Fatigué',8],['Épuisé',0]])]},
 mental:{label:'Mental',color:'#ff9b20',emoji:'☀️',questions:[
 q('m1','Quel est ton niveau de stress habituel ?',25,[['Très élevé',0],['Élevé',6],['Moyen',12],['Faible',19],['Très faible',25]]),
 q('m2','Comment est ton humeur générale ?',25,[['Très difficile',0],['Difficile',6],['Variable',12],['Plutôt bonne',19],['Très bonne',25]]),
 q('m3','Arrives-tu à te détendre ?',25,graded),q('m4','As-tu des moments pour récupérer ?',25,graded)]},
 routine:{label:'Routines',color:'#9b44e8',emoji:'✨',questions:[
 q('r1','Planifies-tu ta journée ?',25,graded),q('r2','Arrives-tu à te concentrer sans interruptions ?',25,graded),q('r3','As-tu une routine quotidienne ?',25,graded),q('r4','Avances-tu régulièrement sur tes objectifs ?',25,graded)]}
 };
 function component(question,value){
  if(value===null||value===undefined)return null;
  if(question.type==='cardio'){
   if(!Array.isArray(value)||value.length!==2||!value.every(v=>Number.isFinite(v)&&v>=0&&v<=3000))return null;
   const n=value[0]+2*value[1];return n===0?0:n<75?15:n<150?30:45;
  }
  if(question.type==='multi'){
   if(!Array.isArray(value)||value.some(v=>!Number.isInteger(v)||!question.options[v]))return null;
   return [...new Set(value)].reduce((s,i)=>s+(question.options[i].points||0),0);
  }
  return Number.isInteger(value)&&question.options[value]?question.options[value].points:null;
 }
 function score(pillar,answers={}){
  const def=questionnaires[pillar];if(!def)throw Error('Unknown questionnaire');
  const parts=def.questions.filter(q=>q.max>0).map(q=>({id:q.id,label:q.label,max:q.max,points:component(q,answers[q.id])}));
  const available=parts.reduce((n,p)=>n+(p.points===null?0:p.max),0),points=parts.reduce((n,p)=>n+(p.points||0),0);
  return {score:available>=60?Math.round(points/available*100):null,completeness:available,parts,version:VERSION};
 }
 function metrics(p){
  const age=Number(p.age),height=Number(p.height),weight=Number(p.weight);
  if(!p.age||age<19||age>78||p.special||!p.height||!p.weight||height<100||height>250||weight<30||weight>300)return null;
  const base=10*weight+6.25*height-5*age;
  const rmr=p.sex==='male'?[Math.round(base+5)]:p.sex==='female'?[Math.round(base-161)]:[Math.round(base-161),Math.round(base+5)];
  const factor=[1.2,1.375,1.55,1.725,1.9].includes(Number(p.factor))?Number(p.factor):1.2;
  const bmi=+(weight/((height/100)**2)).toFixed(1);
  return {rmr,tdee:rmr.map(n=>Math.round(n*factor)),factor,bmi,category:age<20?null:bmi<18.5?'Insuffisance pondérale':bmi<25?'Catégorie de référence':bmi<30?'Surpoids':'Obésité',version:'Mifflin-St Jeor 1990'};
 }
 const empty=()=>({profile:null,history:[],measurements:[],missions:[],draft:null,quizDrafts:{}});
 function load(){try{const s=JSON.parse(root.localStorage.getItem(KEY));if(!s||!Array.isArray(s.history)||!Array.isArray(s.missions))return empty();return {...empty(),...s};}catch{return empty();}}
 function save(s){root.localStorage.setItem(KEY,JSON.stringify(s));return s;}
 function latest(s){return Object.fromEntries(Object.keys(questionnaires).map(k=>[k,[...s.history].reverse().find(h=>h.pillar===k)||null]));}
 function wheel(s){const current=latest(s);const values=Object.values(current).map(h=>h?.result?.score??null);return {current,overall:values.every(v=>v!==null)?Math.round(values.reduce((a,b)=>a+b,0)/5):null};}
 function record(pillar,answers){const s=load(),date=new Date().toISOString();const result=score(pillar,answers);s.history.push({id:date+'-'+pillar,pillar,answers:JSON.parse(JSON.stringify(answers)),result,date,scoringVersion:VERSION});delete s.quizDrafts[pillar];save(s);return result;}
 function recommendations(pillar,answers){
  const ranked=score(pillar,answers).parts.filter(p=>p.points!==null).sort((a,b)=>a.points/a.max-b.points/b.max);
  const suggestions={n1:'Ajouter un fruit ou un légume à un repas',n2:'Découvrir une légumineuse ou une céréale complète',n3:'Repérer une source de protéines que tu apprécies',n4:'Prévoir une pause pour boire selon ta soif',n5:'Essayer une collation différente',a1:'Planifier un moment de mouvement accessible',a3:'Essayer une activité d’endurance appréciée',a4:'Découvrir un exercice de renforcement adapté',a5:'Faire une pause active',s1:'Préserver un créneau suffisant pour te reposer',s2:'Préparer un moment calme avant le coucher',s3:'Noter tes réveils dans le journal',s4:'Observer tes horaires pendant trois jours',s5:'Noter ton énergie au réveil',m1:'Prendre deux minutes de pause',m2:'Noter un moment agréable de ta journée',m3:'Essayer une respiration confortable',m4:'Prévoir un moment de récupération',r1:'Choisir une priorité pour demain',r2:'Essayer dix minutes sans notifications',r3:'Associer une petite action à un moment habituel',r4:'Découper un objectif en une petite étape'};
  return ranked.slice(0,3).map(p=>({id:p.id,title:suggestions[p.id],pillar,duration:5,difficulty:'Douce'}));
 }
 function selectMission(m){const s=load();s.missions=s.missions.filter(x=>x.status==='done');s.missions.push({...m,status:'selected',date:new Date().toISOString()});save(s);}
 function completeMission(){const s=load(),m=s.missions.find(x=>x.status==='selected');if(m){m.status='done';m.completedAt=new Date().toISOString();save(s);}return s;}
 const api={VERSION,KEY,questionnaires,component,score,metrics,load,save,latest,wheel,record,recommendations,selectMission,completeMission};
 if(typeof module!=='undefined')module.exports=api;else root.ProfileEngine=api;
})(typeof window!=='undefined'?window:globalThis);
