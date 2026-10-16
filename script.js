(function(){
  'use strict';
  var d=document,root=d.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var wide=window.matchMedia('(min-width:901px)').matches;
  if(!fine)root.classList.add('touch');
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}

  /* loader -> go */
  var loader=$('#loader');
  function go(){root.classList.add('go');if(loader){loader.classList.add('done');setTimeout(function(){loader.style.display='none'},700)}}
  if(reduce||!loader){go()}else{
    var t0=Date.now(),fired=false;
    var fire=function(){if(fired)return;fired=true;var wait=Math.max(0,1100-(Date.now()-t0));setTimeout(go,wait)};
    if(d.readyState!=='loading')fire();else d.addEventListener('DOMContentLoaded',fire);
    setTimeout(fire,2200);
  }

  /* year */
  var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();

  /* nav scroll, progress */
  var nav=$('#nav'),prog=$('#progress'),ticking=false;
  function onScroll(){
    var y=window.scrollY||window.pageYOffset;
    nav.classList.toggle('scrolled',y>40);
    var h=root.scrollHeight-window.innerHeight;
    prog.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  /* mobile menu */
  var burger=$('#burger'),links=$('#navLinks');
  function setMenu(open){
    links.classList.toggle('open',open);nav.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    d.body.style.overflow=open?'hidden':'';
  }
  burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true')});
  $$('a',links).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&burger.getAttribute('aria-expanded')==='true'){setMenu(false);burger.focus()}});
  window.addEventListener('resize',function(){if(window.innerWidth>900)setMenu(false)});

  /* reveal: IntersectionObserver, with a scroll/resize fallback so nothing can stay invisible */
  var pending=$$('.reveal');
  function show(el){if(el.classList.contains('in'))return;var sib=el.parentElement?$$('.reveal',el.parentElement):[];var i=Math.max(0,sib.indexOf(el))%4;el.style.transitionDelay=reduce?'0ms':(i*70)+'ms';el.classList.add('in')}
  var io=null;
  if('IntersectionObserver' in window){
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target)}})},{threshold:.01,rootMargin:'0px 0px -4% 0px'});
    pending.forEach(function(el){io.observe(el)});
  }
  var chk=false;
  function sweep(){
    chk=false;var vh=window.innerHeight;
    pending=pending.filter(function(el){
      if(el.classList.contains('in'))return false;
      var r=el.getBoundingClientRect();
      if(r.top<vh*0.96&&r.bottom>0){show(el);if(io)io.unobserve(el);return false}
      return true;
    });
    if(!pending.length){window.removeEventListener('scroll',req);window.removeEventListener('resize',req);window.removeEventListener('orientationchange',req)}
  }
  function req(){if(!chk){chk=true;requestAnimationFrame(sweep)}}
  window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);window.addEventListener('orientationchange',req);
  setTimeout(sweep,300);setTimeout(sweep,1500);

  /* counters */
  var stats=$('#stats');
  function count(el){
    var target=+el.getAttribute('data-count'),dur=1600,s=null;
    function step(ts){if(!s)s=ts;var p=Math.min(1,(ts-s)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  }
  if(stats){
    if('IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$$('b[data-count]',stats).forEach(count);so.disconnect()}})},{threshold:.4});so.observe(stats)}
    else $$('b[data-count]',stats).forEach(function(el){el.textContent=el.getAttribute('data-count')});
  }

  /* rotating words */
  var rot=$('#rot');
  if(rot){
    var words=['brand identities','social media campaigns','websites and landing pages','print and packaging','AI-powered visuals'],wi=0;
    setInterval(function(){rot.classList.add('out');setTimeout(function(){wi=(wi+1)%words.length;rot.textContent=words[wi];rot.classList.remove('out')},400)},2800);
  }

  /* custom cursor (desktop fine pointers only) */
  if(fine&&!reduce){
    var dot=$('#cDot'),ring=$('#cRing'),mx=-100,my=-100,rx=-100,ry=-100,shown=false;
    root.classList.add('cursor-on');
    d.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;if(!shown){shown=true;rx=mx;ry=my}},{passive:true});
    var idle=0;
    (function loop(){
      rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
      dot.style.transform='translate('+mx+'px,'+my+'px)';
      ring.style.transform='translate('+rx+'px,'+ry+'px)';
      requestAnimationFrame(loop);
    })();
    d.addEventListener('mouseover',function(e){ring.classList.toggle('hot',!!e.target.closest('a,button,input,textarea,label,.work,.svc'))});
    d.addEventListener('mousedown',function(){ring.classList.add('down')});
    d.addEventListener('mouseup',function(){ring.classList.remove('down')});
    d.addEventListener('mouseleave',function(){dot.style.opacity=0;ring.style.opacity=0});
    d.addEventListener('mouseenter',function(){dot.style.opacity='';ring.style.opacity=''});
  }


  /* ambient background: soft pink particle network */
  var cv=$('#bgCanvas');
  if(cv){
    var cx=cv.getContext('2d'),W=0,H=0,dpr=1,pts=[],pm={x:-999,y:-999},run=true;
    var small=window.innerWidth<700,N=small?(reduce?10:16):(reduce?18:34),LINK=small?100:140,SP=reduce?.35:1;
    function size(){W=window.innerWidth;H=window.innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
    size();var lastW=window.innerWidth;window.addEventListener('resize',function(){if(window.innerWidth!==lastW){lastW=window.innerWidth;size()}});
    for(var i=0;i<N;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35*SP,vy:(Math.random()-.5)*.35*SP,r:Math.random()*1.6+.6,p:Math.random()<.3});
    if(fine)window.addEventListener('mousemove',function(e){pm.x=e.clientX;pm.y=e.clientY},{passive:true});
    d.addEventListener('visibilitychange',function(){run=!d.hidden;if(run)requestAnimationFrame(frame)});
    var last=0;
    function frame(ts){
      if(!run)return;
      if(ts-last<33){requestAnimationFrame(frame);return}
      last=ts;
      cx.clearRect(0,0,W,H);
      for(var i=0;i<pts.length;i++){
        var a=pts[i];a.x+=a.vx;a.y+=a.vy;
        if(a.x<0||a.x>W)a.vx*=-1;if(a.y<0||a.y>H)a.vy*=-1;
        var dx=a.x-pm.x,dy=a.y-pm.y,dd=dx*dx+dy*dy;
        if(dd<14400){var f=(1-dd/14400)*.6;a.x+=dx*f*.05;a.y+=dy*f*.05}
        for(var k=i+1;k<pts.length;k++){
          var b=pts[k],ex=a.x-b.x,ey=a.y-b.y,dist=Math.sqrt(ex*ex+ey*ey);
          if(dist<LINK){cx.strokeStyle='rgba(255,46,147,'+(0.16*(1-dist/LINK)).toFixed(3)+')';cx.lineWidth=1;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}
        }
        cx.fillStyle=a.p?'rgba(255,46,147,.85)':'rgba(255,255,255,.35)';
        cx.beginPath();cx.arc(a.x,a.y,a.r,0,6.283);cx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* 3D: hero stage parallax (desktop) */
  var stage=$('#stage'),inner=$('#stageInner');
  if(stage&&fine&&wide&&!reduce){
    var hero=$('.hero');
    hero.addEventListener('mousemove',function(e){
      var r=stage.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/window.innerWidth,y=(e.clientY-(r.top+r.height/2))/window.innerHeight;
      inner.style.setProperty('--ry',(x*26).toFixed(2)+'deg');inner.style.setProperty('--rx',(-y*22).toFixed(2)+'deg');
    });
    hero.addEventListener('mouseleave',function(){inner.style.setProperty('--ry','0deg');inner.style.setProperty('--rx','0deg')});
  }

  /* tilt cards + spotlight (desktop fine pointers) */
  if(fine&&!reduce){
    $$('.tilt').forEach(function(el){
      var strong=el.classList.contains('browser')||el.classList.contains('frame');
      var max=strong?7:5;
      var raf=0,ev=null;
      el.addEventListener('mousemove',function(e){
        ev=e;if(raf)return;
        raf=requestAnimationFrame(function(){
          raf=0;var r=el.getBoundingClientRect(),px=(ev.clientX-r.left)/r.width,py=(ev.clientY-r.top)/r.height;
          el.style.transition='transform .12s ease-out';
          el.style.transform='perspective(900px) rotateX('+((.5-py)*max*2).toFixed(2)+'deg) rotateY('+((px-.5)*max*2).toFixed(2)+'deg)';
          el.style.setProperty('--mx',(px*100)+'%');el.style.setProperty('--my',(py*100)+'%');
        });
      });
      el.addEventListener('mouseleave',function(){el.style.transition='transform .6s cubic-bezier(.2,.8,.2,1)';el.style.transform=''});
    });
  }

  /* contact form (Web3Forms, unchanged endpoint) */
  var form=$('#contactForm');
  if(form){
    var status=$('#formStatus'),btn=$('#sendBtn');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      btn.disabled=true;btn.firstChild.nodeValue='Sending...';status.className='status';status.textContent='';
      fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}})
        .then(function(r){return r.json()})
        .then(function(data){
          if(data.success){status.className='status ok';status.textContent='Thank you! Your message has been sent. I will reply soon.';form.reset()}
          else{status.className='status err';status.textContent='Something went wrong. Please try again or email me directly.'}
        })
        .catch(function(){status.className='status err';status.textContent='Something went wrong. Please try again or email me directly.'})
        .then(function(){btn.disabled=false;btn.firstChild.nodeValue='Send message'});
    });
  }
})();
