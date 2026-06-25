const AppConfig={
  dataUrl:'data/site-data.json?ts='+Date.now(),
  storage:{notes:'miku-hub-notes-v2',checklist:'miku-trip-checklist-v1'},
  pages:{home:'',goods:'굿즈 모아보기',expo:'전시회 정보',market:'크리에이터즈 마켓',checklist:'여행 체크리스트'},
  filters:['전체','공연','전시회','하마마츠 콜라보','공식 콜라보'],
  defaultChecks:['마지미라 티켓 당첨 확인','티켓값 정산 확인','비행기 예약 확인','비행기 정산 확인','숙소 예약 확인','숙소 정산 확인','VISIT JAPAN 작성 확인','여권 확인','엔화 결제 가능한 수단 확인','엔화 환전 확인'],
  boothTranslations:{A1:'카나데노모리 리조트',A2:'인터넷 주식회사',A3:'무빅',A4:'포켓몬 feat. 하츠네 미쿠 VOLTAGE Live! 블루레이',A5:'하츠네 미쿠 심포니 2026',A6:'츄러스 제조소',B1:'세가 페이브',B2:'디자인 코코',B3:'이타랙',B4:'굿스마일 컴퍼니',B5:'피아프로 캐릭터즈 × OZaKKa 오시활 숍',B6:'보크스',B7:'ETERNO RÉCIT 에테르노 레시',C1:'코코라보 & 솔와',C2:'타마조',C3:'와신 팔레트',C4:'Gift 인형 제조사',C5:'크립톤 디지털 콘텐츠 팀',C6:'Desktop Mate',C7:'크립톤 SONICWIRE 팀',C8:'Domingo 부스',C9:'MIKU EXPO 굿즈 판매 부스',C10:'유키미쿠 스카이타운 출장소',D1:'bilibiliGoods',D2:'ESP 기타 메이커',D3:'야마하 뮤직 재팬',D4:'CRECO 휴넷',D5:'코스파',E1:'다이하츠 비즈니스 서포트 센터','ガチャ':'반다이'}
};
const AppState={raw:null,model:null,filter:'전체',sortDate:false,selectedGoods:new Set()};
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const linkify=s=>escapeHtml(s).replace(/(https?:\/\/[^\s<]+)/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
const asArray=v=>Array.isArray(v)?v:(v?[v]:[]);
const yen=n=>Number(n||0).toLocaleString('ja-JP');

function normalizeData(raw){
  if(raw.schemaVersion==='2.0'){
    let event=(raw.events||[])[0]||{};
    let cards=[...(raw.programs||[]),...(raw.collaborations||[])].sort((a,b)=>(a.displayOrder??0)-(b.displayOrder??0));
    return {
      site:raw.site||{},
      edition:event,
      content:{
        cards,
        stagePrograms:raw.stagePrograms||[],
        goods:raw.goods||[],
        expoBooths:raw.booths?.expo||[],
        creatorMarket:raw.booths?.creatorMarket||[]
      }
    };
  }
  let edition=(raw.editions||[])[0]||{};
  return {
    site:raw.site||{},
    edition,
    content:{
      cards:edition.cards||[],
      stagePrograms:edition.stage||[],
      goods:edition.goods||[],
      expoBooths:edition.expoBooths||[],
      creatorMarket:edition.creatorMarket||[]
    }
  };
}

function validateModel(model){
  let warnings=[];
  let seen=new Set();
  model.content.cards.forEach(item=>{if(!item.id)warnings.push('card id missing'); if(seen.has(item.id))warnings.push('duplicate card id: '+item.id); seen.add(item.id);});
  model.content.goods.forEach(item=>{if(!item.id)warnings.push('goods id missing');});
  if(warnings.length)console.warn('[data warnings]',warnings);
}

const Storage={
  read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}},
  write(key,value){localStorage.setItem(key,JSON.stringify(value))},
  notes(){return this.read(AppConfig.storage.notes,[])},
  setNotes(value){this.write(AppConfig.storage.notes,value);Render.notes()},
  checklist(){return this.read(AppConfig.storage.checklist,{items:{}})},
  setChecklist(value){this.write(AppConfig.storage.checklist,value);Render.checklist()}
};

const Format={
  badgeClass(label=''){return {'예약 필요':'need','전시회 티켓 필요':'free','공연 티켓 필요':'concert','굿즈':'goods','스탬프 랠리':'stamp','정보 추후공개':'pending'}[label]||''},
  mapSrc(url){if(!url)return'';try{let u=new URL(url);let q=u.searchParams.get('query')||u.searchParams.get('q')||url;return 'https://maps.google.com/maps?q='+encodeURIComponent(q)+'&output=embed'}catch{return''}},
  dateKey(item){let m=String(item.date||'').match(/2026-\d{2}-\d{2}/);return m?m[0]:'9999-99-99'},
  goodsPrice(item){let n=String(item.priceText||'').match(/([0-9][0-9,]*)/);return n?Number(n[1].replace(/,/g,'')):0},
  goodsTax(item,price){let text=String(item.priceText||'');if(!price)return {tax:0,total:0};if(/税込/.test(text))return {tax:Math.round(price-price/1.1),total:price};return {tax:Math.round(price*.1),total:Math.round(price*1.1)}}
};

const Templates={
  links(links=[]){return links.length?`<div class="links">${links.map(link=>`<a class="link" target="_blank" rel="noopener" href="${escapeHtml(link.url)}">${escapeHtml(link.label||'링크')}</a>`).join('')}</div>`:''},
  card(item,clean=false){let labels=asArray(item.reservation);return `<article class="card ${clean?'clean':''}"><div class="badges"><span class="badge">${escapeHtml(item.section)}</span>${labels.map(label=>`<span class="badge ${Format.badgeClass(label)}">${escapeHtml(label)}</span>`).join('')}</div><h3>${escapeHtml(item.title)}</h3><div class="date">${escapeHtml(item.date)}</div><p>${escapeHtml(item.place)}</p>${item.description?`<details><summary>자세히</summary><div class="detail">${escapeHtml(item.description)}</div></details>`:''}<div class="links">${item.mapUrl?`<a class="link" target="_blank" rel="noopener" href="${escapeHtml(item.mapUrl)}">지도</a>`:''}${(item.links||[]).map(link=>`<a class="link" target="_blank" rel="noopener" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join('')}</div></article>`}
};

const Render={
  all(){
    let {site,edition}=AppState.model;
    $('eyebrow').textContent=`${edition.year} · ${edition.city}`;
    $('quickTitle').textContent=edition.shortTitle||edition.title;
    $('quickPeriod').textContent=edition.period;
    $('quickVenue').textContent=edition.venue;
    $('quickUpdated').textContent=site.lastUpdated;
    $('noticeText').textContent=site.notice;
    $('quickLinks').innerHTML=(edition.quickLinks||[]).map(link=>`<a class="mini" target="_blank" rel="noopener" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join('');
    this.filters();this.cards();this.stage();this.goods();this.expoBooths();this.creatorMarket();this.checklist();this.notes();
  },
  page(page){
    Object.keys(AppConfig.pages).forEach(key=>$(key+'Page').classList.toggle('hidden',page!==key));
    $('topHeader').classList.toggle('page-mode',page!=='home');
    $('pageTitle').textContent=AppConfig.pages[page]||'';
    window.scrollTo({top:0,behavior:'smooth'});
    Drawer.set(false);
  },
  filters(){
    $('filterBar').innerHTML=AppConfig.filters.map(label=>`<button class="chip ${label===AppState.filter?'active':''}" data-filter="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join('');
  },
  cards(){
    let cards=AppState.model.content.cards.filter(item=>AppState.filter==='전체'||item.section===AppState.filter);
    if(AppState.sortDate)cards=[...cards].sort((a,b)=>Format.dateKey(a).localeCompare(Format.dateKey(b))||a.title.localeCompare(b.title,'ko'));
    $('cardGrid').innerHTML=cards.length?cards.map(item=>Templates.card(item)).join(''):'<div class="empty">표시할 항목이 없습니다.</div>';
  },
  stage(){
    let items=AppState.model.content.stagePrograms;
    $('stageList').innerHTML=items.length?items.map(item=>`<div class="time"><strong>${escapeHtml(item.time)}</strong><span>${escapeHtml(item.title)}</span><a class="link" target="_blank" rel="noopener" href="${escapeHtml(item.link)}">공식</a></div>`).join(''):'<div class="empty">등록된 프로그램이 없습니다.</div>';
  },
  goods(){
    let goods=AppState.model.content.goods;
    $('goodsCount').textContent=`${goods.length}개 항목`;
    $('goodsGrid').innerHTML=goods.length?goods.map(item=>`<article class="goods-card ${AppState.selectedGoods.has(item.id)?'selected':''}" data-goods-id="${escapeHtml(item.id)}" data-price="${Format.goodsPrice(item)}">${item.imageUrl?`<img class="goods-img" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy">`:''}<div class="goods-name">${escapeHtml(item.name)}</div><div class="goods-price">${escapeHtml(item.priceText)}</div><div class="goods-area">${escapeHtml(item.area)}</div><div class="links"><a class="link" target="_blank" rel="noopener" href="${escapeHtml(item.sourceUrl)}">${escapeHtml(item.sourceLabel||'출처')}</a></div></article>`).join(''):'<div class="empty">굿즈 정보가 없습니다.</div>';
    this.goodsTotal();
  },
  goodsTotal(){
    let selected=AppState.model.content.goods.filter(item=>AppState.selectedGoods.has(item.id));
    let tax=0,total=0,priced=0;
    selected.forEach(item=>{let price=Format.goodsPrice(item),result=Format.goodsTax(item,price);tax+=result.tax;total+=result.total;if(price)priced++;});
    $('goodsTotal').classList.toggle('show',selected.length>0);
    $('goodsTotalMain').textContent=`선택 ${selected.length}개 · 총액 ¥${yen(total)}`;
    $('goodsTotalSub').textContent=`세금 상당액 ¥${yen(tax)} · 가격 없는 항목 ${selected.length-priced}개 제외 · 일본 소비세 10% 기준`;
  },
  expoBooths(){
    let booths=AppState.model.content.expoBooths;
    $('expoCount').textContent=`${booths.length}개 부스`;
    $('expoBoothList').innerHTML=booths.length?booths.map(item=>{let ko=AppConfig.boothTranslations[item.number]||'';return `<article class="info-row"><div class="info-no">${escapeHtml(item.number)}</div><div><div class="info-name">${escapeHtml(item.name)}${ko?`<span class="info-ko">${escapeHtml(ko)}</span>`:''}</div><div class="info-items">주요판매품목: ${escapeHtml(item.items||'공식 상세 확인')}</div>${Templates.links(item.links)}</div></article>`}).join(''):'<div class="empty">출전 부스 정보가 없습니다.</div>';
  },
  creatorMarket(){
    let booths=AppState.model.content.creatorMarket;
    $('marketCount').textContent=`${booths.length}개 부스`;
    $('marketList').innerHTML=booths.length?booths.map(item=>{let goods=item.items==='CD / music / creator goods'?'CD / 음악 / 창작 굿즈':(item.items||'공식 상세 확인');return `<article class="info-row"><div class="info-no">${escapeHtml(item.number)}</div><div><div class="info-name">${escapeHtml(item.name)}</div><div class="info-meta">참가일: ${escapeHtml((item.days||[]).join(', ')||'-')}${item.members?.length?` · 참여: ${escapeHtml(item.members.join(', '))}`:''}</div><div class="info-items">주요판매품목: ${escapeHtml(goods)}</div>${Templates.links(item.links)}</div></article>`}).join(''):'<div class="empty">크리에이터즈 마켓 정보가 없습니다.</div>';
  },
  checklist(){
    let items=Checklist.all();
    $('checkList').innerHTML=items.map(item=>`<article class="check-item"><div class="check-top"><label class="check-label"><input type="checkbox" data-check="${escapeHtml(item.id)}" ${item.checked?'checked':''}><span>${escapeHtml(item.title)}</span></label></div><div class="memo-row ${item.locked?'':'has-delete'}">${item.memoSaved?`<div class="saved-memo" data-saved-memo="${escapeHtml(item.id)}">${linkify(item.memo||'')}</div>`:`<input data-memo="${escapeHtml(item.id)}" value="${escapeHtml(item.memo||'')}" placeholder="관련 링크, 금액 메모, URL">`}<button data-save-memo="${escapeHtml(item.id)}">${item.memoSaved?'수정':'저장'}</button>${item.locked?'':`<button class="delete-check" data-delete-check="${escapeHtml(item.id)}">삭제</button>`}</div></article>`).join('');
  },
  notes(){
    let notes=Storage.notes();
    $('noteList').innerHTML=notes.length?notes.map(note=>{let map=Format.mapSrc(note.url);return `<div class="note"><div class="note-top"><div><div class="note-title">${escapeHtml(note.title)}</div><div class="small">${escapeHtml(note.createdAt)}</div></div><button class="danger" data-del="${escapeHtml(note.id)}">삭제</button></div><div class="note-body">${linkify(note.body)}</div>${note.url?`<a class="link" target="_blank" rel="noopener" href="${escapeHtml(note.url)}">링크 열기</a>`:''}${map?`<iframe class="map" loading="lazy" src="${map}"></iframe>`:''}</div>`}).join(''):'<div class="empty">아직 메모가 없습니다.</div>';
  }
};

const Checklist={
  all(){
    let saved=Storage.checklist();
    let base=AppConfig.defaultChecks.map((title,i)=>({id:`base-${i}`,title,locked:true,...(saved.items[`base-${i}`]||{})}));
    let custom=Object.entries(saved.items).filter(([id])=>id.startsWith('custom-')).map(([id,value])=>({id,locked:false,...value}));
    return base.concat(custom);
  },
  update(id,patch){let saved=Storage.checklist();saved.items[id]={...(saved.items[id]||{}),...patch};Storage.setChecklist(saved);}
};

const LocalData={
  export(){
    let payload={version:1,exportedAt:new Date().toISOString(),notes:Storage.notes(),checklist:Storage.checklist()};
    let blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    let link=document.createElement('a');
    link.href=URL.createObjectURL(blob);link.download='miku-local-data.json';link.click();URL.revokeObjectURL(link.href);
    Drawer.set(false);
  },
  import(file){
    if(!file)return;
    let reader=new FileReader();
    reader.onload=()=>{try{let data=JSON.parse(reader.result);if(data.notes&&!Array.isArray(data.notes))throw Error();if(data.checklist&&typeof data.checklist!=='object')throw Error();if(data.notes)Storage.write(AppConfig.storage.notes,data.notes);if(data.checklist)Storage.write(AppConfig.storage.checklist,data.checklist);Render.notes();Render.checklist();alert('로컬 데이터 불러오기 완료');Drawer.set(false);}catch{alert('JSON 파일이 맞지 않습니다.')}};
    reader.readAsText(file);
  }
};

const Drawer={set(open){$('drawer').classList.toggle('open',open);$('drawerBackdrop').classList.toggle('open',open);$('drawer').setAttribute('aria-hidden',String(!open));}};

function bindEvents(){
  $('openDrawer').onclick=()=>Drawer.set(true);
  $('closeDrawer').onclick=()=>Drawer.set(false);
  $('drawerBackdrop').onclick=()=>Drawer.set(false);
  document.querySelectorAll('[data-page]').forEach(link=>link.onclick=event=>{event.preventDefault();Render.page(link.dataset.page);});
  document.querySelectorAll('[data-home-link]').forEach(link=>link.onclick=()=>Render.page('home'));
  $('filterBar').onclick=event=>{let button=event.target.closest('[data-filter]');if(!button)return;AppState.filter=button.dataset.filter;Render.filters();Render.cards();};
  $('sortDate').onclick=()=>{AppState.sortDate=!AppState.sortDate;$('sortDate').classList.toggle('active',AppState.sortDate);Render.cards();};
  $('goodsGrid').addEventListener('click',event=>{if(event.target.closest('a'))return;let card=event.target.closest('[data-goods-id]');if(!card)return;let id=card.dataset.goodsId;AppState.selectedGoods.has(id)?AppState.selectedGoods.delete(id):AppState.selectedGoods.add(id);card.classList.toggle('selected',AppState.selectedGoods.has(id));Render.goodsTotal();});
  $('clearGoodsSelection').onclick=()=>{AppState.selectedGoods.clear();Render.goods();};
  $('saveNote').onclick=()=>{let title=$('noteTitle').value.trim(),body=$('noteBody').value.trim();if(!title&&!body)return alert('제목이나 내용을 입력해줘.');Storage.setNotes([{id:crypto.randomUUID(),title:title||'무제',body,url:$('noteUrl').value.trim(),createdAt:new Date().toLocaleString('ko-KR')},...Storage.notes()]);$('noteTitle').value='';$('noteBody').value='';$('noteUrl').value='';};
  $('noteList').onclick=event=>{let button=event.target.closest('[data-del]');if(button)Storage.setNotes(Storage.notes().filter(note=>note.id!==button.dataset.del));};
  $('exportNotes').onclick=()=>{let blob=new Blob([JSON.stringify(Storage.notes(),null,2)],{type:'application/json'});let link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='miku-notes.json';link.click();URL.revokeObjectURL(link.href);};
  $('importNotes').onchange=event=>{let file=event.target.files[0];if(!file)return;let reader=new FileReader();reader.onload=()=>{try{let data=JSON.parse(reader.result);if(!Array.isArray(data))throw Error();Storage.setNotes(data);alert('복원 완료');}catch{alert('JSON 파일이 맞지 않습니다.')}};reader.readAsText(file);};
  $('exportLocalData').onclick=()=>LocalData.export();
  $('importLocalData').onchange=event=>LocalData.import(event.target.files[0]);
  $('addCheck').onclick=()=>{let title=$('newCheckTitle').value.trim();if(!title)return;let saved=Storage.checklist();saved.items['custom-'+crypto.randomUUID()]={title,checked:false,memo:'',memoSaved:false};Storage.write(AppConfig.storage.checklist,saved);$('newCheckTitle').value='';Render.checklist();};
  $('checkList').onclick=event=>{let check=event.target.closest('[data-check]');if(check)Checklist.update(check.dataset.check,{checked:check.checked});let save=event.target.closest('[data-save-memo]');if(save){let id=save.dataset.saveMemo;let input=document.querySelector(`[data-memo="${CSS.escape(id)}"]`);let item=Checklist.all().find(row=>row.id===id);item?.memoSaved?Checklist.update(id,{memoSaved:false}):Checklist.update(id,{memo:input?.value.trim()||'',memoSaved:true});}let del=event.target.closest('[data-delete-check]');if(del){let saved=Storage.checklist();delete saved.items[del.dataset.deleteCheck];Storage.setChecklist(saved);}};
}

function boot(){
  bindEvents();
  fetch(AppConfig.dataUrl).then(response=>{if(!response.ok)throw Error(response.status);return response.json();}).then(data=>{AppState.raw=data;AppState.model=normalizeData(data);validateModel(AppState.model);Render.all();}).catch(error=>{$('noticeText').textContent='데이터 로딩 실패: '+error.message;$('cardGrid').innerHTML='<div class="empty">data/site-data.json을 확인하세요.</div>';Render.notes();});
}
boot();
