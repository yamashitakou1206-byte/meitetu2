const OFFICIAL_URL='https://top.meitetsu.co.jp/em/train_emtop.asp';
const lines={
  main:{name:'名古屋本線',color:'#c40018',stations:['豊橋','伊奈','国府','本宿','東岡崎','新安城','知立','鳴海','神宮前','金山','名鉄名古屋','須ケ口','一宮','笠松','名鉄岐阜']},
  inuyama:{name:'犬山線',color:'#0075c9',stations:['名鉄名古屋','栄生','上小田井','西春','岩倉','江南','柏森','扶桑','犬山']},
  tokoname:{name:'常滑線・空港線',color:'#009a9a',stations:['神宮前','大江','太田川','朝倉','新舞子','常滑','りんくう常滑','中部国際空港']},
  kowa:{name:'河和線',color:'#ef7b00',stations:['太田川','高横須賀','南加木屋','巽ケ丘','阿久比','知多半田','青山','河和']},
  tsushima:{name:'津島線',color:'#7c49a5',stations:['須ケ口','甚目寺','七宝','木田','青塚','勝幡','藤浪','津島']},
  mikawa:{name:'三河線',color:'#006b3f',stations:['知立','重原','刈谷','刈谷市','小垣江','三河高浜','高浜港','碧南']},
  nishio:{name:'西尾線',color:'#b00062',stations:['新安城','南安城','桜井','米津','西尾','福地','吉良吉田']},
  seto:{name:'瀬戸線',color:'#008c45',stations:['栄町','東大手','清水','大曽根','小幡','喜多山','大森・金城学院前','尾張旭','三郷','新瀬戸','尾張瀬戸']}
};
let state={line:'main',stationIndex:0,direction:'up',type:'普通',dark:false,seconds:true,auto:true,delay:false,zoom:1};
const $=id=>document.getElementById(id);
function pad(n){return String(n).padStart(2,'0')}
function now(){return new Date()}
function timeStr(d,withSeconds=true){return `${pad(d.getHours())}:${pad(d.getMinutes())}${withSeconds?':'+pad(d.getSeconds()):''}`}
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>el.classList.remove('show'),2200)}
function save(){localStorage.setItem('meitetsuDemo',JSON.stringify(state))}
function load(){try{Object.assign(state,JSON.parse(localStorage.getItem('meitetsuDemo')||'{}'))}catch(e){}}
function line(){return lines[state.line]}
function initSelectors(){
  $('lineSelect').innerHTML=Object.entries(lines).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
  $('lineSelect').value=state.line;
  fillStations();
  $('directionSelect').value=state.direction;
  $('typeSelect').value=state.type;
  $('darkToggle').checked=state.dark;$('secondsToggle').checked=state.seconds;$('autoRefresh').checked=state.auto;
}
function fillStations(){const l=line();$('stationSelect').innerHTML=l.stations.map((s,i)=>`<option value="${i}">${s}</option>`).join('');state.stationIndex=Math.min(state.stationIndex,l.stations.length-1);$('stationSelect').value=state.stationIndex}
function trainForLine(){const l=line();const first=l.stations[0],last=l.stations[l.stations.length-1];let origin=state.direction==='up'?first:last,destination=state.direction==='up'?last:first;let code=state.line==='seto'?'S':state.line==='main'?'M':'L';let types={普通:2,準急:4,急行:6,快速特急:8};return {origin,destination,code,cars:types[state.type]||2,no:`${1800+state.stationIndex}${code}`}}
function scheduleTimes(){
  const l=line(),base=state.direction==='up'?0:l.stations.length-1,step=state.direction==='up'?1:-1;
  const nowD=now(); const baseMin=Math.floor(nowD.getHours()*60+nowD.getMinutes()/20)*20+20;
  return l.stations.map((name,i)=>{const distance=Math.abs(i-base);const minutes=baseMin+distance*(state.type==='快速特急'?2:state.type==='急行'?3:5);const h=Math.floor(minutes/60)%24,m=minutes%60;return {name,arrival:`${pad(h)}:${pad(m)}`,departure:`${pad(h)}:${pad((m+1)%60)}`,idx:i,minutes}})
}
function renderHeader(){const t=trainForLine();$('trainType').textContent=state.type;$('serviceCode').textContent=t.code;$('cars').textContent=t.cars+'両';$('origin').textContent=t.origin;$('destination').textContent=t.destination;$('trainNo').textContent=t.no+'S'}
function currentIndex(){const l=line();const h=now();const cur=h.getHours()*60+h.getMinutes()+h.getSeconds()/60;const base=5*60+30;const span=20;let idx=Math.floor((cur-base)/span);if(idx<0)idx=0;if(idx>=l.stations.length-1)idx=l.stations.length-1;return state.direction==='up'?idx:l.stations.length-1-idx}
function renderMap(){const times=scheduleTimes(),ci=currentIndex();$('routeMap').innerHTML=times.map((x,i)=>{let cls=i<ci?'passed':i===ci?'current':'';return `<div class="map-stop ${cls}"><div class="map-dot"></div><div class="map-label">${x.name}</div><div class="map-time">${x.departure}</div></div>`}).join('')}
function renderSchedule(){const times=scheduleTimes(),ci=currentIndex();$('scheduleTable tbody').innerHTML=times.map((x,i)=>{let st=i<ci?'<span class="state done">通過</span>':i===ci?'<span class="state now">停車中</span>':'<span class="state">予定</span>';return `<tr class="${i===ci?'current':''}" data-i="${i}"><td>${x.name}</td><td>${x.arrival}</td><td>${x.departure}</td><td>${st}</td></tr>`}).join('');const row=document.querySelector('tr.current');if(row)row.scrollIntoView({block:'nearest'});$('currentLocation').textContent=times[ci]?`現在位置：${times[ci].name}`:'走行位置—';$('nextStop').textContent=`次駅：${times[Math.min(ci+1,times.length-1)]?.name||'—'}`}
function renderNext(){const l=line(),idx=state.stationIndex;let out=[];for(let k=0;k<4;k++){let mins=(k*9+3+idx)%60;let d=new Date();d.setMinutes(d.getMinutes()+mins);out.push(`<div class="next-item"><div class="next-time">${timeStr(d,false)}</div><div class="next-main"><strong>${['普通','準急','急行'][k%3]}</strong><small>${state.direction==='up'?l.stations[l.stations.length-1]:l.stations[0]} 行</small></div><span class="next-tag">${k%3===2?'6両':'2両'}</span></div>`)}$('nextTrains').innerHTML=out.join('')}
function renderNews(){const n=state.delay?[{t:'運行情報',b:'一部列車に遅れが発生しています（デモ）'},{t:'案内',b:'最新情報は名鉄公式運行情報をご確認ください。'}]:[{t:'運行情報',b:'現在、デモ上は平常運転です。'},{t:'自動放送',b:'この表示はWeb版のサンプル情報です。'},{t:'ご案内',b:'画面をホーム画面に追加するとアプリのように使えます。'}];$('newsList').innerHTML=n.map(x=>`<div class="news-item"><strong>${x.t}</strong><small>${x.b}</small></div>`).join('')}
function renderBanner(){const dot=document.querySelector('.status-dot');if(state.delay){dot.className='status-dot warn';$('bannerTitle').textContent='遅延・一部運休（デモ）';$('bannerText').textContent='このアプリ内のデモ状態です。実際の運行状況ではありません。'}else{dot.className='status-dot ok';$('bannerTitle').textContent='平常運転';$('bannerText').textContent='15分以上の列車の遅れはありません（デモ表示）'}}
function renderClock(){const d=now();$('digital').textContent=timeStr(d,state.seconds);$('dateText').textContent=d.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short'});drawClock(d)}
function drawClock(d){const c=$('analog'),ctx=c.getContext('2d'),w=c.width,h=c.height,r=w/2;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(r,r);ctx.beginPath();ctx.arc(0,0,r-5,0,Math.PI*2);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--panel');ctx.fill();ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--line');ctx.lineWidth=4;ctx.stroke();for(let i=0;i<60;i++){let a=i*Math.PI/30;ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-r+14);ctx.lineTo(0,-r+(i%5===0?25:20));ctx.strokeStyle=i%5===0?getComputedStyle(document.body).getPropertyValue('--text'):getComputedStyle(document.body).getPropertyValue('--line');ctx.lineWidth=i%5===0?3:1;ctx.stroke();ctx.rotate(-a)}const sec=d.getSeconds(),min=d.getMinutes(),hr=d.getHours()%12;drawHand(ctx,(hr+min/60)*Math.PI/6,r*.52,5);drawHand(ctx,(min+sec/60)*Math.PI/30,r*.72,4);drawHand(ctx,sec*Math.PI/30,r*.78,2,getComputedStyle(document.body).getPropertyValue('--accent'));ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--accent');ctx.fill();ctx.restore()}
function drawHand(ctx,a,len,width,color){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-len);ctx.strokeStyle=color||getComputedStyle(document.body).getPropertyValue('--text');ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();ctx.restore()}
function update(){renderHeader();renderMap();renderSchedule();renderNext();renderNews();renderBanner();renderClock();const t=timeStr(now());$('positionUpdated').textContent='更新 '+t;$('lastUpdated').textContent='最終更新 '+t;save()}
function applyTheme(){document.body.classList.toggle('dark',state.dark);$('darkToggle').checked=state.dark}
function bind(){
 $('lineSelect').onchange=e=>{state.line=e.target.value;state.stationIndex=0;document.querySelectorAll('.quick').forEach(b=>b.classList.toggle('active',b.dataset.line===state.line));fillStations();update()};
 $('stationSelect').onchange=e=>{state.stationIndex=+e.target.value;update()};$('directionSelect').onchange=e=>{state.direction=e.target.value;update()};$('typeSelect').onchange=e=>{state.type=e.target.value;update()};
 document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>{state.line=b.dataset.line;$('lineSelect').value=state.line;state.stationIndex=0;document.querySelectorAll('.quick').forEach(x=>x.classList.toggle('active',x===b));fillStations();update()});
 $('themeBtn').onclick=()=>{state.dark=!state.dark;applyTheme();update()};$('darkToggle').onchange=e=>{state.dark=e.target.checked;applyTheme();update()};$('secondsToggle').onchange=e=>{state.seconds=e.target.checked;update()};$('autoRefresh').onchange=e=>{state.auto=e.target.checked;toast(state.auto?'自動更新をONにしました':'自動更新をOFFにしました');save()};
 $('refreshBtn').onclick=()=>{update();toast('表示を更新しました')};$('officialBtn').onclick=()=>window.open(OFFICIAL_URL,'_blank');$('officialMenu').onclick=()=>window.open(OFFICIAL_URL,'_blank');
 $('menuBtn').onclick=()=>{const d=$('menuDialog');if(d.showModal)d.showModal()};$('closeDialog').onclick=()=>$('menuDialog').close();$('simulateDelay').onclick=()=>{state.delay=true;update();$('menuDialog').close();toast('遅延デモをONにしました')};$('clearDelay').onclick=()=>{state.delay=false;update();$('menuDialog').close();toast('平常運転に戻しました')};
 $('zoomIn').onclick=()=>{state.zoom=Math.min(1.25,state.zoom+.05);document.documentElement.style.setProperty('--zoom',state.zoom);save()};$('zoomOut').onclick=()=>{state.zoom=Math.max(.85,state.zoom-.05);document.documentElement.style.setProperty('--zoom',state.zoom);save()};
 document.querySelectorAll('.nav-item[data-scroll]').forEach(b=>b.onclick=()=>{document.querySelector(b.dataset.scroll==='schedule'?'.schedule-card':'.app-shell').scrollIntoView({behavior:'smooth'})});$('stationBtn').onclick=()=>{window.scrollTo({top:0,behavior:'smooth'});$('stationSelect').focus()};$('settingsBtn').onclick=()=>{$('settingsPanel').scrollIntoView({behavior:'smooth',block:'center'})};
 $('backBtn').onclick=()=>toast('列車一覧機能はこの画面内の路線・種別選択から利用できます');
}
let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(!deferredPrompt){toast('Safariでは共有メニューから「ホーム画面に追加」を選べます');return}deferredPrompt.prompt();deferredPrompt=null};
load();initSelectors();document.documentElement.style.setProperty('--zoom',state.zoom);applyTheme();bind();update();setInterval(()=>{if(state.auto)update();else renderClock()},1000);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
