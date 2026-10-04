'use strict';
const $ = (s) => document.querySelector(s);
const labels = {web:'تطوير ويب',design:'تصميم وهوية بصرية',automation:'أتمتة الأعمال',ai:'ذكاء اصطناعي',mobile:'تطبيقات جوال'};
const english = {web:'WEB DEVELOPMENT',design:'VISUAL DESIGN',automation:'AUTOMATION',ai:'AI / MACHINE LEARNING',mobile:'MOBILE DEVELOPMENT'};
const statuses = {'active':'نشط','in-progress':'جاري العمل','coming-soon':'قريبًا'};
const palettes = ['#c7d2b7','#c8bed5','#242723','#d8e3b1','#cec5b5','#bcccd0','#d9c4b5','#d2d6bd','#d0d0d4'];
let data;
const text = (tag, value, cls) => {const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;};
function renderProjects(filter='all'){
 const projects=data.projects.filter(p=>filter==='all'||p.category===filter);
 const grid=$('#project-grid'); grid.replaceChildren();
 for(const p of projects){
  const card=document.createElement('article');card.className='project-card'+(p.featured?' featured':'')+(p.status==='coming-soon'?' coming':'');
  const btn=document.createElement('button');btn.className='project-button';btn.type='button';btn.setAttribute('aria-label','عرض تفاصيل '+p.title);btn.addEventListener('click',()=>openProject(p));
  const poster=document.createElement('div');poster.className='project-poster';const bg=p.poster||palettes[(p.id-1)%palettes.length];poster.style.background=bg;const lum=parseInt(bg.slice(1,3),16)*.299+parseInt(bg.slice(3,5),16)*.587+parseInt(bg.slice(5,7),16)*.114;if(lum<140)poster.style.color='#eee9df';
  const top=document.createElement('div');top.className='poster-top';top.append(text('span',String(p.id).padStart(2,'0')+' / 14','poster-no'),text('span',english[p.category],'poster-type'));
  const title=text('div',p.title,'poster-title'+(p.title.length>22?' long':'')+(!/[\u0600-\u06ff]/.test(p.title)?' latin':''));
  const bottom=document.createElement('div');bottom.className='poster-bottom';bottom.append(text('span','↗','poster-action'),text('span',statuses[p.status]||p.status,'status'));
  const num=text('span',String(p.id).padStart(2,'0'),'poster-index');num.setAttribute('aria-hidden','true');
  poster.append(top,title,bottom,num);btn.append(poster);
  const meta=document.createElement('div');meta.className='project-meta';const info=document.createElement('div');info.append(text('h3',p.title),text('p',labels[p.category]+' · '+p.tags.join(' / '),'project-category'));meta.append(info,text('span',String(p.id).padStart(2,'0'),'number'));btn.append(meta);card.append(btn,text('p',p.desc,'project-desc'));grid.append(card);
 }
 $('#project-count').textContent=projects.length+' مشاريع معروضة';
}
function openProject(p){
 $('#dialog-title').textContent=p.title;$('#dialog-category').textContent=labels[p.category];$('#dialog-status').textContent=statuses[p.status]||p.status;$('#dialog-description').textContent=p.longDesc;
 for(const [selector,items] of [['#dialog-tags',p.tags],['#dialog-tech',p.tech||[]]]){$(selector).replaceChildren(...items.map(v=>text('span',v)));}
 const link=$('#dialog-link');link.hidden=!p.url;if(p.url)link.href=p.url;else link.removeAttribute('href');
 $('#project-dialog').showModal();$('#project-dialog').scrollTop=0;document.body.style.overflow='hidden';
}
$('#dialog-close').addEventListener('click',()=>$('#project-dialog').close());
$('#project-dialog').addEventListener('close',()=>document.body.style.overflow='');
$('#project-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
const menu=$('.menu-toggle'),nav=$('#mobile-nav');
function closeMenu(){nav.hidden=true;menu.setAttribute('aria-expanded','false');$('.menu-icon').textContent='☰';}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.hidden=!open;menu.setAttribute('aria-expanded',String(open));$('.menu-icon').textContent=open?'✕':'☰';});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!nav.hidden&&!nav.contains(e.target)&&!menu.contains(e.target))closeMenu();});
document.querySelectorAll('.year').forEach(el=>el.textContent=new Date().getFullYear());
async function init(){
 try{
  const res=await fetch('./data.json');if(!res.ok)throw new Error('content unavailable');data=await res.json();renderProjects();
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));renderProjects(btn.dataset.filter);}));
  for(const [i,e] of data.experience.entries()){
   const row=document.createElement('article');row.className='experience-row';const role=document.createElement('div');role.className='experience-role';role.append(text('h3',e.role),text('div',e.org,'org'),text('span',e.period,'period'));row.append(text('span',String(i+1).padStart(2,'0'),'experience-number'),role,text('p',e.desc));$('#experience-list').append(row);
  }
  for(const s of data.skills){const el=document.createElement('div');el.className='skill';const head=document.createElement('div');head.className='skill-head';head.append(text('h3',s.name),text('span',s.level+'%'));const meter=document.createElement('div');meter.className='skill-meter';meter.setAttribute('aria-hidden','true');const fill=document.createElement('div');fill.style.width=s.level+'%';meter.append(fill);el.append(head,text('p',s.items),meter);$('#skills-list').append(el);}
  for(const [i,c] of data.certificates.entries()){const row=document.createElement('article');row.className='certificate';const mark=text('span',i===0?'✦':'↗','cert-mark');mark.setAttribute('aria-hidden','true');row.append(mark,text('h3',c.name),text('span',c.org,'org'));$('#cert-list').append(row);}
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.experience-row,.skill,.certificate,.about-copy').forEach(el=>observer.observe(el));}
 }catch(e){$('#project-grid').append(text('p','تعذّر تحميل المحتوى. حدّث الصفحة للمحاولة مجددًا.'));}
}
init();
