
const peopleByCar={
  "Carro 1":["Uelinton","Jana","Davi Gomes","Valentina"],
  "Carro 2":["Júnior","Débora","Marta","Julia Vargas"],
  "Carro 3":["Alex Martins","Fabíola","Alex Veiga","Ana Júlia","Eloyse"],
  "Carro 4":["Deyvid","Arthur","Nicolas"]
};
const people=Object.values(peopleByCar).flat();
const homeCar=Object.fromEntries(Object.entries(peopleByCar).flatMap(([car,ps])=>ps.map(p=>[p,car])));
const categories=["Todos","Mala","Bolsa","Sacola","Caixa","Objeto"];
const icons={Mala:"🧳",Bolsa:"🎒",Sacola:"🛍️",Caixa:"📦",Objeto:"🔖"};
let items=JSON.parse(localStorage.getItem("nextBagagem.items")||"[]");
let view="passenger",filter="Todos";

function safe(s){return String(s??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function persist(){localStorage.setItem("nextBagagem.items",JSON.stringify(items));render();}
function init(){
  owner.innerHTML=people.map(p=>`<option>${safe(p)}</option>`).join("");
  car.innerHTML=Object.keys(peopleByCar).map(c=>`<option>${c}</option>`).join("");
  cars.innerHTML=Object.entries(peopleByCar).map(([c,ps])=>`<div class="car"><h3>${c}</h3><div class="chips">${ps.map(p=>`<span class="chip">${safe(p)}</span>`).join("")}</div></div>`).join("");
  filters.innerHTML=categories.map(c=>`<button class="filter ${c===filter?'on':''}" onclick="setFilter('${c}')">${c}</button>`).join("");
  render();
}
function setView(v){view=v;passengerView.hidden=v!=="passenger";itemsView.hidden=v!=="items";pendingView.hidden=v!=="pending";tabPassenger.classList.toggle("on",v==="passenger");tabItems.classList.toggle("on",v==="items");tabPending.classList.toggle("on",v==="pending");render();}
function setFilter(f){filter=f;init();}
function toggleObject(){objectField.style.display=type.value==="Objeto"?"flex":"none";}
function openForm(id){
  editId.value="";formTitle.textContent="Adicionar item";owner.value=people[0];car.value=homeCar[people[0]];type.value="Mala";qty.value=1;objectName.value="";note.value="";toggleObject();
  if(id){const x=items.find(i=>i.id===id);if(!x)return;editId.value=x.id;formTitle.textContent="Editar item";owner.value=x.owner;car.value=x.car;type.value=x.type;qty.value=x.qty;objectName.value=x.objectName||"";note.value=x.note||"";toggleObject();}
  dlg.showModal();
}
owner.addEventListener("change",()=>{if(!editId.value)car.value=homeCar[owner.value]||"Carro 1";});
function saveItem(e){e.preventDefault();const rec={owner:owner.value,car:car.value,type:type.value,qty:Math.max(1,Number(qty.value)||1),objectName:type.value==="Objeto"?(objectName.value.trim()||"Objeto"):"",note:note.value.trim()};if(editId.value){const n=items.findIndex(i=>i.id===editId.value);items[n]={...items[n],...rec};}else{items.unshift({id:crypto.randomUUID(),...rec,ida:false,volta:false,createdAt:Date.now()});}dlg.close();persist();}
function toggleCheck(id,key){const x=items.find(i=>i.id===id);if(!x)return;x[key]=!x[key];if(key==="ida"&&!x.ida)x.volta=false;persist();}
function removeItem(id){if(confirm("Excluir este item?")){items=items.filter(i=>i.id!==id);persist();}}
function itemCard(i){const label=i.type==="Objeto"?i.objectName:i.type;const different=i.car!==homeCar[i.owner];return `<article class="item"><div class="item-top"><div class="ico">${icons[i.type]}</div><div class="main"><div class="item-name">${safe(label)}</div><div class="meta">Pertence a <b>${safe(i.owner)}</b> • está no <b>${i.car}</b>${different?` • passageiro está no <b>${homeCar[i.owner]}</b>`:""}${i.note?`<br>${safe(i.note)}`:""}</div></div><div class="qty">×${i.qty}</div></div><div class="checks"><button class="check ${i.ida?'on':''}" onclick="toggleCheck('${i.id}','ida')">${i.ida?'✓ IDA':'Conferir IDA'}</button><button class="check return ${i.volta?'on':''}" ${!i.ida?'disabled':''} onclick="toggleCheck('${i.id}','volta')">${i.volta?'✓ VOLTA':'Conferir VOLTA'}</button></div><div class="actions"><button class="link" onclick="openForm('${i.id}')">Editar</button><button class="link" onclick="removeItem('${i.id}')">Excluir</button></div></article>`;}
function render(){
  stReg.textContent=items.length;stVol.textContent=items.reduce((s,i)=>s+i.qty,0);stIda.textContent=items.filter(i=>i.ida).reduce((s,i)=>s+i.qty,0);stVolta.textContent=items.filter(i=>i.volta).reduce((s,i)=>s+i.qty,0);
  const missing=items.filter(i=>i.ida&&!i.volta),missingQty=missing.reduce((s,i)=>s+i.qty,0);alert.className="alert "+(items.length?(missingQty?"show warn":"show ok"):"");alert.textContent=items.length?(missingQty?`⚠️ Ainda faltam ${missingQty} volume(s) para conferir na volta.`:"✓ Nenhum volume pendente na volta."):"";
  people.innerHTML=people.map(p=>{const mine=items.filter(i=>i.owner===p);const total=mine.reduce((s,i)=>s+i.qty,0);const chips=["Mala","Bolsa","Sacola","Caixa","Objeto"].map(t=>{const n=mine.filter(i=>i.type===t).reduce((s,i)=>s+i.qty,0);return n?`<span class="count">${n} ${t}${n>1&&t!=="Objeto"?'s':''}</span>`:""}).join("");const away=mine.filter(i=>i.car!==homeCar[p]).length;return `<div class="person"><div class="person-head"><div><b>${safe(p)}</b><div class="sub">${homeCar[p]}${away?` • ${away} registro(s) em outro carro`:""}</div></div><b>${total}</b></div><div class="counts">${chips||'<span class="count zero">Sem bagagem cadastrada</span>'}</div></div>`;}).join("");
  const shown=filter==="Todos"?items:items.filter(i=>i.type===filter);itemsView.querySelector("#items").innerHTML=shown.length?shown.map(itemCard).join(""):'<div class="empty">Nenhum item nesta categoria.</div>';
  pending.innerHTML=missing.length?missing.map(itemCard).join(""):'<div class="empty">Nenhum item pendente para a volta.</div>';
}
function exportData(){const data={app:"NEXT | BAGAGEM",version:1,peopleByCar,exportedAt:new Date().toISOString(),items};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="next-bagagem-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function importData(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.items))throw new Error();items=d.items;persist();alert("Backup importado com sucesso.");}catch{alert("Arquivo de backup inválido.");}e.target.value="";};r.readAsText(f);}
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});init();
