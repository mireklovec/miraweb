const KEY="miraweb-v1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"vehicles":[],"diary":[],"balistics":[]}');
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem(KEY,JSON.stringify(data)); render();}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function page(id){$$(".page").forEach(x=>x.classList.remove("active")); $("#"+id).classList.add("active"); $$("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===id)); $("#nav").classList.remove("open"); window.scrollTo({top:0,behavior:"smooth"});}
$$("nav button").forEach(b=>b.onclick=()=>page(b.dataset.page)); $$(".quick button[data-go]").forEach(b=>b.onclick=()=>page(b.dataset.go)); $("#menuBtn").onclick=()=>$("#nav").classList.toggle("open");

function openModal(content){$("#modalContent").innerHTML=content;$("#modal").classList.add("open")}
function closeModal(){$("#modal").classList.remove("open")} $("#closeModal").onclick=closeModal; $("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()}

function dateState(d){
 if(!d)return ""; const diff=(new Date(d)-new Date())/86400000;
 return diff<0?"bad":diff<=30?"warn":"";
}
function dateText(d){return d?new Date(d+"T12:00:00").toLocaleDateString("cs-CZ"):"—"}

function vehicleForm(v={},idx=-1){
 openModal(`<h2>${idx>=0?"Upravit vozidlo":"Nové vozidlo"}</h2>
 <label>Název / model<input id="vname" value="${esc(v.name||"")}"></label>
 <label>SPZ<input id="vreg" value="${esc(v.reg||"")}"></label>
 <label>Rok<input id="vyear" type="number" value="${v.year||""}"></label>
 <label>Aktuální km<input id="vkm" type="number" value="${v.km||""}"></label>
 <div class="grid two">
 <label>STK do<input id="vstk" type="date" value="${v.stk||""}"></label>
 <label>Dálniční známka do<input id="vtoll" type="date" value="${v.toll||""}"></label>
 </div>
 <label>Poznámka<input id="vnote" value="${esc(v.note||"")}"></label>
 <button class="primary" id="saveV">Uložit</button>`);
 $("#saveV").onclick=()=>{
  const x={name:$("#vname").value,reg:$("#vreg").value,year:+$("#vyear").value||"",km:+$("#vkm").value||0,stk:$("#vstk").value,toll:$("#vtoll").value,note:$("#vnote").value};
  if(idx>=0)data.vehicles[idx]=x;else data.vehicles.push(x);closeModal();save();
 }
}
$("#addVehicle").onclick=()=>vehicleForm();

function diaryForm(d={},idx=-1){
 openModal(`<h2>${idx>=0?"Upravit záznam":"Nový záznam"}</h2>
 <label>Typ<select id="dtype"><option value="ulovek">Úlovek</option><option value="poznamka">Poznámka</option></select></label>
 <label>Název / stručný popis<input id="dtitle" value="${esc(d.title||"")}"></label>
 <div class="grid two"><label>Datum<input id="ddate" type="date" value="${d.date||new Date().toISOString().slice(0,10)}"></label><label>Místo<input id="dplace" value="${esc(d.place||"")}"></label></div>
 <label>Kdo / účastníci<input id="dwho" value="${esc(d.who||"")}"></label>
 <label>Podrobnosti<textarea id="dbody" rows="7">${esc(d.body||"")}</textarea></label>
 <button class="primary" id="saveD">Uložit</button>`);
 $("#dtype").value=d.type||"ulovek";
 $("#saveD").onclick=()=>{const x={type:$("#dtype").value,title:$("#dtitle").value,date:$("#ddate").value,place:$("#dplace").value,who:$("#dwho").value,body:$("#dbody").value};if(idx>=0)data.diary[idx]=x;else data.diary.unshift(x);closeModal();save();}
}
$("#addDiary").onclick=()=>diaryForm();
$$(".tab").forEach(t=>t.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");renderDiary(t.dataset.dtype)});

function renderVehicles(){
 $("#vehiclesList").innerHTML=data.vehicles.length?data.vehicles.map((v,i)=>`<article class="vehicle card"><div><h3>${esc(v.name||"Bez názvu")}</h3><div class="muted">${esc(v.reg||"")} ${v.year?"• "+v.year:""} ${v.km?"• "+v.km.toLocaleString("cs-CZ")+" km":""}</div><div class="badges" style="margin-top:12px">
 <span class="badge ${dateState(v.stk)}">STK: ${dateText(v.stk)}</span><span class="badge ${dateState(v.toll)}">Známka: ${dateText(v.toll)}</span></div>${v.note?`<p class="muted">${esc(v.note)}</p>`:""}</div><div><button onclick="vehicleForm(data.vehicles[${i}],${i})">Upravit</button> <button onclick="delVehicle(${i})">Smazat</button></div></article>`).join(""):`<div class="card"><p class="muted">Zatím tu nejsou žádná vozidla.</p><button class="primary" onclick="vehicleForm()">＋ Přidat první vozidlo</button></div>`;
}
function delVehicle(i){if(confirm("Smazat vozidlo?")){data.vehicles.splice(i,1);save()}}
function renderDiary(type="ulovek"){
 const arr=data.diary.filter(x=>x.type===type);
 $("#diaryList").innerHTML=arr.length?arr.map(d=>{const i=data.diary.indexOf(d);return `<article class="diary-entry"><div class="entry-head"><div><div class="entry-title">${esc(d.title||"Bez názvu")}</div><div class="entry-meta">${dateText(d.date)}${d.place?" • "+esc(d.place):""}${d.who?" • "+esc(d.who):""}</div></div></div><div class="entry-body">${esc(d.body||"")}</div><div class="entry-actions"><button onclick="diaryForm(data.diary[${i}],${i})">Upravit</button><button onclick="delDiary(${i})">Smazat</button></div></article>`}).join(""):`<div class="card"><p class="muted">Žádné záznamy v této kategorii.</p></div>`;
}
function delDiary(i){if(confirm("Smazat záznam?")){data.diary.splice(i,1);save()}}

function render(){
 renderVehicles(); renderDiary($(".tab.active")?.dataset.dtype||"ulovek");
 $("#vehicleCount").textContent=data.vehicles.length; $("#diaryCount").textContent=data.diary.length;
 const now=new Date(), end=new Date(now.getTime()+60*86400000), events=[];
 data.vehicles.forEach(v=>{for(const [type,key] of [["STK","stk"],["Známka","toll"]])if(v[key]){const d=new Date(v[key]+"T23:59:59");if(d<=end)events.push({d,type,name:v.name})}});
 events.sort((a,b)=>a.d-b.d);$("#dueCount").textContent=events.length;
 $("#upcoming").innerHTML=events.length?events.slice(0,6).map(e=>`<div class="badges" style="margin:8px 0"><span class="badge ${e.d<now?"bad":"warn"}">${e.type}</span><span>${esc(e.name)} — ${e.d.toLocaleDateString("cs-CZ")}</span></div>`).join(""):`<p class="muted">Nic důležitého do 60 dnů.</p>`;
 renderBal();
}
function calcFuel(){const c=+$("#fuelCons").value||0,p=+$("#fuelPrice").value||0,k=+$("#fuelKm").value||0;$("#fuelResult").textContent=(c/100*k*p).toLocaleString("cs-CZ",{style:"currency",currency:"CZK"})}
["fuelCons","fuelPrice","fuelKm"].forEach(id=>$("#"+id).oninput=calcFuel);
function convert(){const v=+$("#convVal").value||0,t=$("#convType").value;const r={kmmi:v*.621371,mikm:v*1.609344,kggr:v*1000,grkg:v/1000,celf:v*9/5+32,fcel:(v-32)*5/9}[t];$("#convResult").textContent=r.toLocaleString("cs-CZ",{maximumFractionDigits:4})}
$("#convVal").oninput=convert;$("#convType").onchange=convert;

function renderBal(){const a=data.balistics||[];$("#balList").innerHTML=a.map((x,i)=>`<article class="diary-entry"><div class="entry-title">${esc(x.cal||"")} ${x.ammo?"• "+esc(x.ammo):""}</div><div class="entry-meta">${dateText(x.date)}${x.gun?" • "+esc(x.gun):""}</div><div class="entry-body">${esc(x.note||"")}</div><button onclick="delBal(${i})">Smazat</button></article>`).join("")}
$("#saveBal").onclick=()=>{data.balistics=data.balistics||[];data.balistics.unshift({cal:$("#balCal").value,ammo:$("#balAmmo").value,gun:$("#balGun").value,date:$("#balDate").value,note:$("#balNote").value});$("#balCal").value=$("#balAmmo").value=$("#balGun").value=$("#balNote").value="";save()}
function delBal(i){data.balistics.splice(i,1);save()}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="miraweb-zaloha.json";a.click()}
$("#importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{data=JSON.parse(r.result);save();alert("Data obnovena.")}catch{alert("Soubor není platná záloha.")}};r.readAsText(f)}
calcFuel();convert();render();
