const uiIcon = "<svg class=\"ui-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n  <path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\" />\n  <path d=\"M20 3v4\" />\n  <path d=\"M22 5h-4\" />\n  <path d=\"M4 17v2\" />\n  <path d=\"M5 18H3\" />\n</svg>";
const grid = document.querySelector('#artwork-grid');
const featured = document.querySelector('#featured');
const details = document.querySelector('#active-details');
const search = document.querySelector('#search');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const tiers = ['Common','Uncommon','Rare','Legendary'];
let catalog = [], selectedId = 1, activeFilter = 'All';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const trait = (item,key) => item.attributes.find(a=>a.trait_type===key)?.value || 'None';
const title = item => item.name.replace(/^42 — /,'').replace(/ #\d+$/,'');
const badge = item => `<span class="badge ${trait(item,'Rarity').toLowerCase()}">${escapeHtml(trait(item,'Rarity'))}</span>`;
let sceneRequest = 0;
const preloadSceneImage=source=>new Promise((resolve,reject)=>{
 const image=new Image();image.onload=()=>resolve(source);image.onerror=reject;image.src=source;
});
async function updateSceneCharacter(item){
 const request=++sceneRequest;
 const hasVideo=[1,2,3].includes(item.token_id);
 const activeVideo=featured.querySelector('.artwork-video');
 if(activeVideo){activeVideo.pause();activeVideo.remove();}
 try{
  await preloadSceneImage(item.image);
  if(request!==sceneRequest)return;
  const current=featured.querySelector('.artwork-slide:not(.artwork-outgoing)');
  const previousId=Number(current.dataset.token || 0);
  if(previousId===item.token_id && !hasVideo)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const direction=previousId && item.token_id<previousId?-1:1;
  featured.querySelectorAll('.artwork-outgoing').forEach(node=>node.remove());
  current.getAnimations().forEach(animation=>animation.cancel());
  if(previousId && !reduced){
   const outgoing=current.cloneNode(true);outgoing.classList.add('artwork-outgoing');
   outgoing.setAttribute('aria-hidden','true');current.before(outgoing);
   const exit=outgoing.animate([
    {opacity:1,transform:'translateX(0) scale(1)',filter:'blur(0px)'},
    {opacity:0,transform:`translateX(${-direction*90}px) scale(1.02)`,filter:'blur(10px)'}
   ],{duration:450,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
   exit.onfinish=()=>outgoing.remove();exit.oncancel=()=>outgoing.remove();
  }
  current.src=item.image;current.alt=title(item);current.dataset.token=String(item.token_id);
  if(previousId && !reduced && !hasVideo)current.animate([
   {opacity:0,transform:`translateX(${direction*110}px) scale(1.02)`,filter:'blur(12px)'},
   {opacity:1,transform:'translateX(0) scale(1)',filter:'blur(0px)'}
  ],{duration:620,easing:'cubic-bezier(.16,1,.3,1)'});
  if(hasVideo && !reduced){
   const video=document.createElement('video');
   video.className='artwork-video';video.muted=true;video.playsInline=true;
   video.preload='auto';video.poster='assets/scene-base.png';
   video.setAttribute('aria-label',`${title(item)} entrance animation`);
   video.src=`assets/video/character-${String(item.token_id).padStart(2,'0')}-intro.mp4`;
   const finish=()=>{
    if(request!==sceneRequest)return;
    video.pause();video.remove();
   };
   video.addEventListener('ended',finish,{once:true});
   video.addEventListener('error',finish,{once:true});
   current.after(video);
   video.play().catch(finish);
  }
 }catch{
  if(request===sceneRequest)featured.querySelector('.artwork-slide:not(.artwork-outgoing)').alt=`${title(item)} — preview unavailable`;
 }
}
function selectArtwork(id,moveFocus=false){
 const item=catalog.find(i=>i.token_id===id);if(!item)return;
 selectedId=id;
 if(!featured.querySelector('.artwork-slide')){
  featured.innerHTML=`<img class="artwork-slide" alt=""><div class="image-top"><span>TOKENIZEART ORIGINALS</span><span class="scene-token"></span></div><div class="image-bottom"><span class="scene-rarity"></span><button class="image-mint" type="button" disabled title="Minting is unavailable until the collection contract is deployed">Mint ${uiIcon}</button></div>`;
 }
 updateSceneCharacter(item);
 featured.querySelector('.scene-token').textContent=`#${String(id).padStart(2,'0')} / 10`;
 featured.querySelector('.scene-rarity').innerHTML=badge(item);

 details.innerHTML=`<div class="detail-top"><span>THE COLLECTION / #${String(id).padStart(2,'0')}</span><div class="creator-rarity"><span class="creator-credit">Created by <strong>${escapeHtml(item.artist)}</strong></span>${badge(item)}</div></div><h1>${escapeHtml(title(item))}<span class="title-number"> #${String(id).padStart(2,'0')}</span></h1><p class="description">${escapeHtml(item.description.split(' Part of TokenizeArt')[0])}</p><div class="traits">${['Expression','Outfit','Accessory','Background'].map(key=>`<div><small>${key}</small><span>${escapeHtml(trait(item,key))}</span></div>`).join('')}</div>`;
 document.querySelectorAll('.card').forEach(card=>{const active=Number(card.dataset.id)===id;card.classList.toggle('selected',active);const b=card.querySelector('.select-art');b.innerHTML=(active?'Selected':'Select artwork')+uiIcon;b.setAttribute('aria-pressed',String(active));});
 if(moveFocus){const card=grid.querySelector(`[data-id="${id}"]`);if(card){const left=card.offsetLeft-grid.offsetLeft;grid.scrollTo({left:Math.max(0,left-(grid.clientWidth-card.clientWidth)/2),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}

}
function render(){
 const query=search.value.trim().toLowerCase();
 const items=catalog.filter(item=>(activeFilter==='All'||trait(item,'Rarity')===activeFilter)&&`${item.name} ${item.attributes.map(a=>a.value).join(' ')}`.toLowerCase().includes(query));
 items.sort((a,b)=>a.token_id-b.token_id);
 document.querySelector('#result-count').textContent=`${items.length} artwork${items.length===1?'':'s'}`;
 grid.innerHTML=items.map(item=>`<article class="card collectible-card ${item.token_id===selectedId?'selected':''}" data-id="${item.token_id}" style="--pop-x:${[-14,16,-17,15,-15,0,18,-16,17,-18][item.token_id-1]}px;--pop-y:${[-15,13,-13,-16,14,0,14,-14,-15,13][item.token_id-1]}px;--pop-rotate:${[-2,2,-2.5,2,-1.5,0,2.5,-2,2,-2.5][item.token_id-1]}deg;--card-accent:${({Common:'#d8c487',Uncommon:'#6ed7bf',Rare:'#c595e9',Legendary:'#73c8ee'})[trait(item,'Rarity')]}"><button class="image-button" data-select="${item.token_id}" aria-label="View ${escapeHtml(title(item))}"><span class="card-window"><img class="card-backdrop" src="${item.token_id===6?item.image:'assets/scene-base.png'}" alt="${item.token_id===6?escapeHtml(title(item)):''}" loading="lazy"></span>${item.token_id===6?'':`<img class="card-character" src="assets/characters/character-${String(item.token_id).padStart(2,'0')}-cutout.png" alt="${escapeHtml(title(item))}" loading="lazy">`}<span class="card-topline"><span>42 ORIGINALS</span><span>#${String(item.token_id).padStart(2,'0')}</span></span><span class="card-rarity">${escapeHtml(trait(item,'Rarity'))}</span></button><div class="card-body"><svg class="card-plinth" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="plinth-${item.token_id}" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stop-color="#303432"/><stop offset="0.55" stop-color="#101411"/><stop offset="1" stop-color="#020403"/></linearGradient></defs><path d="M1 2 L20 20 H136 L153 37 V57 L171 76 H278 L299 56 V108 L288 119 H12 L1 108 Z" fill="url(#plinth-${item.token_id})"/><path d="M1 2 L20 20 H136 L153 37 V57 L171 76 H278 L299 56" fill="none" stroke="#dce5d5" stroke-opacity=".65" stroke-width="1.5"/><path d="M1 2 V108 L12 119 H288 L299 108 V56 M12 116 H288" fill="none" stroke="#5d685e" stroke-opacity=".6" stroke-width="1"/></svg><div class="plinth-title"><h3>${escapeHtml(title(item))}</h3></div><div class="card-bottom"><span class="card-micro">TOKENIZEART<br>ONE OF TEN </span><button class="select-art" data-select="${item.token_id}" aria-pressed="${item.token_id===selectedId}">${item.token_id===selectedId?'Selected':'Select artwork'}${uiIcon}</button></div></div></article>`).join('');
 if(!items.length)grid.innerHTML='<p class="empty">No characters match. Try another search or rarity.</p>';
}
grid.addEventListener('click',event=>{const button=event.target.closest('[data-select]');if(button)selectArtwork(Number(button.dataset.select),true);});
filterButtons.forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;filterButtons.forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});render();}));
search.addEventListener('input',render);
fetch('collection.json?v=white-branded-10').then(response=>{if(!response.ok)throw Error('catalog');return response.json();}).then(data=>{catalog=data.items;render();selectArtwork(1);}).catch(()=>{featured.innerHTML='<p class="loading">The collection could not load. Please refresh to try again.</p>';document.querySelector('#result-count').textContent='Collection unavailable';});

// Native touch scrolling plus mouse drag; distinguish a drag from a selection.
let dragStart = null, dragged = false, suppressClick = false;
let interactingUntil = 0, lastFrame = 0, autoPosition = 0;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const deferAutoplay = () => { interactingUntil = performance.now() + 3000; };
grid.addEventListener('dragstart', event => event.preventDefault());
grid.addEventListener('pointerdown', event => {
 deferAutoplay();
 if(event.pointerType !== 'mouse' || event.button !== 0)return;
 dragStart = {x:event.clientX, scroll:grid.scrollLeft, pointer:event.pointerId};
 dragged = false;
});
window.addEventListener('pointermove', event => {
 if(!dragStart || event.pointerId !== dragStart.pointer)return;
 const distance = event.clientX-dragStart.x;
 if(Math.abs(distance)>5){dragged=true;grid.classList.add('is-dragging');}
 if(dragged){event.preventDefault();grid.scrollLeft=dragStart.scroll-distance;deferAutoplay();}
}, {passive:false});
function finishDrag(){
 if(!dragStart)return;
 suppressClick=dragged;
 dragStart=null;grid.classList.remove('is-dragging');deferAutoplay();
 setTimeout(()=>{suppressClick=false;},0);
}
window.addEventListener('pointerup',finishDrag);
window.addEventListener('pointercancel',finishDrag);
window.addEventListener('blur',finishDrag);
grid.addEventListener('click',event=>{
 if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}
},true);
grid.addEventListener('wheel',deferAutoplay,{passive:true});
grid.addEventListener('keydown',deferAutoplay);
grid.addEventListener('focusin',deferAutoplay);
grid.addEventListener('click',deferAutoplay);
document.querySelectorAll('.browse-controls button').forEach(button=>button.addEventListener('click',deferAutoplay));
function animateCarousel(now){
 const elapsed=Math.min(now-lastFrame,50);lastFrame=now;
 const end=grid.scrollWidth-grid.clientWidth;
 if(!reduceMotion.matches && !document.hidden && !dragStart && now>interactingUntil && !grid.matches(':focus-within') && end>1){
  autoPosition += elapsed*.022;
  if(autoPosition>=end)autoPosition=0;
  grid.scrollLeft=autoPosition;
 }else{autoPosition=grid.scrollLeft;}
 requestAnimationFrame(animateCarousel);
}
requestAnimationFrame(animateCarousel);
