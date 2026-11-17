'use strict';
const $ = (s) => document.querySelector(s);
const labels = {web:'تطوير ويب',design:'تصميم وهوية بصرية',automation:'أتمتة الأعمال',ai:'ذكاء اصطناعي',mobile:'تطبيقات جوال'};
const english = {web:'WEB DEVELOPMENT',design:'VISUAL DESIGN',automation:'AUTOMATION',ai:'AI / MACHINE LEARNING',mobile:'MOBILE DEVELOPMENT'};
const statuses = {'active':'نشط','in-progress':'جاري العمل','coming-soon':'قريبًا'};
const PREVIEW = 7;
let data, currentFilter = 'all', expanded = false;
const text = (tag, value, cls) => {const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;};
function workMedia(p){
 const media=document.createElement('div');media.className='work-media';
 if(p.image){const img=document.createElement('img');img.src=p.image;img.alt='لقطة من '+p.title;img.loading='lazy';img.decoding='async';media.append(img);}
 else{const cover=document.createElement('div');cover.className='work-cover';cover.style.setProperty('--c',p.color||'#3d3d36');cover.append(text('span',english[p.category],'cover-type'),text('span',p.title,'cover-title'));media.append(cover);}
 const open=text('span','↗','work-open');open.setAttribute('aria-hidden','true');media.append(open);
 return media;
}
function workCard(p,i){
 const card=document.createElement('article');card.className='work-card'+(p.featured?' featured':'')+(p.status==='coming-soon'?' coming':'');card.style.setProperty('--i',i);
 const trigger=document.createElement('button');trigger.type='button';trigger.className='work-trigger';trigger.textContent=p.title;trigger.setAttribute('aria-haspopup','dialog');trigger.addEventListener('click',()=>openProject(p));
 const title=document.createElement('h3');title.className='work-title';title.append(trigger);
 const head=document.createElement('div');head.className='work-head';head.append(title,text('span',statuses[p.status]||p.status,'pill '+p.status));
 const tags=document.createElement('div');tags.className='work-tags';tags.append(...p.tags.map(t=>text('span',t)));
 const body=document.createElement('div');body.className='work-body';
 if(p.featured){
  const info=document.createElement('div');info.className='work-info';info.append(text('p','✦ مشروع مميز','work-flag'),head,text('p',labels[p.category],'work-cat'),tags);
  const aside=document.createElement('div');aside.append(text('p',p.desc,'work-desc'));
  if(p.url){const actions=document.createElement('div');actions.className='work-actions';const visit=text('a','زيارة المشروع ↗','btn');visit.href=p.url;visit.target='_blank';visit.rel='noopener noreferrer';actions.append(visit);aside.append(actions);}
  body.append(info,aside);
 }else body.append(head,text('p',labels[p.category],'work-cat'),text('p',p.desc,'work-desc'),tags);
 card.append(workMedia(p),body);
 return card;
}
function renderProjects(){
 const list=data.projects.filter(p=>currentFilter==='all'||p.category===currentFilter);
 const shown=currentFilter==='all'&&!expanded?list.slice(0,PREVIEW):list;
 $('#project-grid').replaceChildren(...shown.map(workCard));
 $('#show-more-wrap').hidden=shown.length===list.length;
 $('#show-more span').textContent='عرض كل المشاريع ('+list.length+')';
 $('#project-count').textContent=shown.length+' مشاريع معروضة';
}
function openProject(p){
 const img=$('#dialog-image');img.hidden=!p.image;if(p.image){img.src=p.image;img.alt='لقطة من '+p.title;}
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
  document.querySelectorAll('[data-filter]').forEach(btn=>{
   const f=btn.dataset.filter,count=f==='all'?data.projects.length:data.projects.filter(p=>p.category===f).length;btn.hidden=!count;btn.append(' ',text('small',String(count)));
   btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));currentFilter=f;expanded=false;renderProjects();});
  });
  $('#show-more').addEventListener('click',()=>{expanded=true;renderProjects();$('#project-grid').children[PREVIEW]?.querySelector('.work-trigger').focus({preventScroll:true});});
  for(const [i,e] of data.experience.entries()){
   const row=document.createElement('article');row.className='experience-row';const role=document.createElement('div');role.className='experience-role';role.append(text('h3',e.role),text('div',e.org,'org'),text('span',e.period,'period'));row.append(text('span',String(i+1).padStart(2,'0'),'experience-number'),role,text('p',e.desc));$('#experience-list').append(row);
  }
  for(const s of data.skills){const el=document.createElement('div');el.className='skill';const head=document.createElement('div');head.className='skill-head';head.append(text('h3',s.name),text('span',s.level+'%'));const meter=document.createElement('div');meter.className='skill-meter';meter.setAttribute('aria-hidden','true');const fill=document.createElement('div');fill.style.width=s.level+'%';meter.append(fill);el.append(head,text('p',s.items),meter);$('#skills-list').append(el);}
  for(const [i,c] of data.certificates.entries()){const row=document.createElement('article');row.className='certificate';const mark=text('span',i===0?'✦':'↗','cert-mark');mark.setAttribute('aria-hidden','true');row.append(mark,text('h3',c.name),text('span',c.org,'org'));$('#cert-list').append(row);}
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.experience-row,.skill,.certificate,.about-copy').forEach(el=>observer.observe(el));}
 }catch(e){$('#project-grid').append(text('p','تعذّر تحميل المحتوى. حدّث الصفحة للمحاولة مجددًا.'));}
}
init();
