(function(){
'use strict';
/* ===== Editable data ===== */
var FORM_ENDPOINT='https://formspree.io/f/YOUR_FORMSPREE_ID';
var PROPERTIES=[
 {price:'$960,000',beds:5,baths:4,sqft:'3,043',loc:'Glenview, Illinois'},
 {price:'$520,000',beds:2,baths:2,sqft:'1,150',loc:'Chicago, Illinois'},
 {price:'$365,000',beds:2,baths:2,sqft:'1,200',loc:'Chicago, Illinois'}
];
var NEIGHBORHOODS=['Lincoln Square','Ravenswood','Bucktown','Avondale','Edgewater','Irving Park','North Center','Uptown','West Town','Roscoe Village','River West','Gold Coast','Ukrainian Village'];
var ZILLOW='https://www.zillow.com/profile/SKGroup';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,c){return(c||document).querySelector(s)};

/* ===== Render data ===== */
$('#property-grid').innerHTML=PROPERTIES.map(function(p){
 return '<article class="card rv"><div class="ph" role="img" aria-label="Architectural placeholder for sold property in '+p.loc+'"><span class="badge">Sold</span><small>Property photo to be added</small></div><div class="cb"><p class="price">'+p.price+'</p><p class="facts">'+p.beds+' beds &middot; '+p.baths+' baths &middot; '+p.sqft+' sq ft</p><p class="loc">'+p.loc+'</p><div class="row"><a class="link" href="'+ZILLOW+'" rel="noopener">View Details</a><a class="link" href="#contact" data-interest="Consultation">Discuss a Similar Property</a></div></div></article>';
}).join('');
$('#hoods').innerHTML=NEIGHBORHOODS.map(function(n){return '<li><a href="#contact" data-interest="Buying">'+n+'</a></li>'}).join('');

/* ===== Nav ===== */
var btn=$('.menu-btn'),nav=$('#nav');
function setMenu(o){nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',o)}
btn.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){setMenu(false);btn.focus()}});
nav.addEventListener('click',function(e){if(e.target.tagName==='A')setMenu(false)});

/* Preselect inquiry type from CTAs */
document.addEventListener('click',function(e){var a=e.target.closest('[data-interest]');if(a)$('#interest').value=a.dataset.interest});

/* ===== Reveal + count-up ===== */
function count(el){
 var end=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,pre=el.dataset.pre||'',suf=el.dataset.suf||'',t0=null;
 function fmt(v){return pre+v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf}
 el.setAttribute('aria-label',fmt(end));
 function step(t){t0=t0||t;var k=Math.min((t-t0)/1200,1);el.textContent=fmt(end*k);if(k<1)requestAnimationFrame(step);else el.textContent=fmt(end)}
 requestAnimationFrame(step);
}
if('IntersectionObserver' in window&&!reduce){
 var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.15});
 document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
 var io2=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){count(x.target);io2.unobserve(x.target)}})},{threshold:.6});
 document.querySelectorAll('[data-count]').forEach(function(el){io2.observe(el)});
}else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})}

/* ===== Contact form ===== */
var form=$('#contact-form'),status=$('#form-status'),submit=$('button[type=submit]',form),busy=false;
function err(id,msg){var f=$('#'+id),e=$('#'+id+'-err');if(!f)return;f.setAttribute('aria-invalid',!!msg);if(msg)f.setAttribute('aria-describedby',id+'-err');e.textContent=msg||''}
function validate(){
 var ok=true,v=function(id,bad,msg){var m=bad?msg:'';err(id,m);if(bad)ok=false};
 v('name',!form.name.value.trim(),'Enter your full name.');
 v('email',!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value),'Enter a valid email address.');
 v('interest',!form.interest.value,'Choose what you are interested in.');
 v('message',!form.message.value.trim(),'Tell us how we can help.');
 v('consent',!form.consent.checked,'Please acknowledge to continue.');
 return ok;
}
form.addEventListener('submit',function(e){
 e.preventDefault();if(busy)return;
 status.className='';status.textContent='';
 if(!validate()){status.className='bad';status.textContent='Please fix the highlighted fields.';var bad=$('[aria-invalid=true]',form);if(bad)bad.focus();return}
 if(FORM_ENDPOINT.indexOf('YOUR_FORMSPREE_ID')>-1){status.className='bad';status.textContent='This form is not connected yet. Please contact us through our Zillow profile.';return}
 busy=true;submit.disabled=true;submit.textContent='Sending...';
 fetch(FORM_ENDPOINT,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}})
 .then(function(r){if(!r.ok)throw new Error(r.status);form.reset();status.className='ok';status.textContent='Thank you. Your inquiry was sent and we will be in touch soon.'})
 .catch(function(){status.className='bad';status.textContent='We could not send your inquiry. Your details are saved here; please try again or reach us via our Zillow profile.'})
 .then(function(){busy=false;submit.disabled=false;submit.textContent='Send My Inquiry'});
});
})();
