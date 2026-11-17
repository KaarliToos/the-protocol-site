(function(root){
const limits={age:[13,90],height:[120,220],weight:[35,200],activity:[0,3],meals:[1,4],water:[0,3],feeling:[0,2],chrono:[0,2],regularity:[0,2],stress:[0,2]};
function clean(a={}){a=a&&typeof a==='object'?a:{};const out={};for(const [k,[lo,hi]] of Object.entries(limits)){const v=a[k];out[k]=typeof v==='number'&&Number.isFinite(v)&&Number.isInteger(v)&&v>=lo&&v<=hi?v:null;}out.name=typeof a.name==='string'?a.name.trim().slice(0,40):'';out.sex=['female','male','private'].includes(a.sex)?a.sex:null;out.goal=['lose','maintain','muscle'].includes(a.goal)?a.goal:null;out.pillars=Array.isArray(a.pillars)?[...new Set(a.pillars.filter(x=>['sommeil','performance','nutrition','mental','routine'].includes(x)))].slice(0,3):[];for(const k of ['bed','wake'])out[k]=typeof a[k]==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(a[k])?a[k]:null;return out;}
const minutes=s=>s.split(':').reduce((h,m)=>Number(h)*60+Number(m));
const clock=m=>{m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
function calculate(input){const a=clean(input),adult=a.age!==null&&a.age>=18,full=adult&&a.height!==null&&a.weight!==null&&a.sex!==null;
const bmr=full?10*a.weight+6.25*a.height-5*a.age+({male:5,female:-161,private:-78}[a.sex]):null;
const expenditure=bmr!==null&&a.activity!==null?bmr*[1.2,1.375,1.55,1.725][a.activity]:null;
const bmi=adult&&a.height!==null&&a.weight!==null?a.weight/(a.height/100)**2:null;
const floor=a.sex==='female'?1200:1500;
const intake=expenditure!==null&&a.goal!==null&&!(a.goal==='lose'&&bmi<18.5)?Math.max(floor,expenditure+({lose:-400,maintain:0,muscle:300}[a.goal])):null;
const sleep=a.bed&&a.wake?((minutes(a.wake)-minutes(a.bed)+1440)%1440)/60:null;
const sleepRange=a.age===null?null:a.age<18?[8,10]:a.age>=65?[7,8]:[7,9];
const bedtime=a.wake&&sleepRange?[clock(minutes(a.wake)-sleepRange[1]*60),clock(minutes(a.wake)-sleepRange[0]*60)]:null;
return {a,adult,bmr,expenditure,intake,bmi,sleep,sleepRange,bedtime,water:adult&&a.weight!==null?[a.weight*.03,a.weight*.035]:null,protein:adult&&a.weight!==null&&a.activity!==null?a.weight*[1,1.2,1.4,1.6][a.activity]:null,glasses:a.water===null?null:[[0,2],[3,5],[6,8],[9,null]][a.water]};}
const api={clean,calculate,clock};if(typeof module!=='undefined')module.exports=api;else root.ProfileMath=api;
})(typeof window!=='undefined'?window:globalThis);
