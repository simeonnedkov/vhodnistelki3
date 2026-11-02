document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  function closeMenu(){menu?.setAttribute('aria-expanded','false');navigation?.classList.remove('open')}
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
  navigation?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  window.matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
  const tabs=[...document.querySelectorAll('[role=tab]')];
  function selectTab(tab,focus=false){
    tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected});
    if(focus)tab.focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>selectTab(tab));
    tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectTab(tabs[next],true)}});
  });
  const params=new URLSearchParams(location.search);
  const initialTab=tabs.find(t=>t.dataset.category===params.get('category'));
  if(initialTab)selectTab(initialTab);
  const top=document.querySelector('.back-top');
  window.addEventListener('scroll',()=>top?.classList.toggle('visible',window.scrollY>600),{passive:true});
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}}),{threshold:.08});
    document.querySelectorAll('.space-card,.step,.detail-grid,.cta-inner').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el)});
  }
  const form=document.getElementById('contactForm');
  if(!form)return;
  const service=document.getElementById('service');
  const selected=document.getElementById('selected-plan');
  function updatePlan(){const option=service.selectedOptions[0];selected.hidden=!service.value;selected.textContent=service.value?'Вашият избор: '+option.textContent:''}
  if([...service.options].some(o=>o.value===params.get('service')))service.value=params.get('service');
  updatePlan();service.addEventListener('change',updatePlan);
  const phone=document.getElementById('phone');
  const phoneError=document.getElementById('phoneError');
  phone.setAttribute('aria-describedby','phoneError');
  function validatePhone(){const digits=phone.value.replace(/\D/g,'');const valid=!phone.value.trim()||(digits.length>=7&&digits.length<=15);phone.setCustomValidity(valid?'':'Въведете телефон с между 7 и 15 цифри.');phoneError.textContent=valid?'':'Въведете телефон с между 7 и 15 цифри.';phone.setAttribute('aria-invalid',String(!valid));return valid}
  phone.addEventListener('input',validatePhone);
  let sending=false;
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(sending)return;if(!validatePhone()||!form.reportValidity())return;
    const button=form.querySelector('button[type=submit]');const original=button.innerHTML;const status=document.getElementById('form-status');
    sending=true;button.disabled=true;button.textContent='Изпращане…';status.textContent='';delete status.dataset.state;
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form),signal:controller.signal});
      const contentType=response.headers.get('content-type')||'';
      if(!contentType.includes('application/json'))throw new Error('Формата се изпраща през сайта на хостинга. За директна връзка: info@vhodnistelki.bg или +359 89 562 2018.');
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error(result.message||'Не успяхме да изпратим запитването. Моля, опитайте отново.');
      status.dataset.state='success';status.textContent=result.message||'Благодарим! Запитването ви е изпратено.';form.reset();updatePlan();validatePhone();
    }catch(error){status.dataset.state='error';status.textContent=error.name==='AbortError'?'Изпращането отне твърде дълго. Моля, опитайте отново или се свържете по телефон.':error.message}
    finally{clearTimeout(timer);sending=false;button.disabled=false;button.innerHTML=original}
  });
});
