// PATH: /Js/HeroChips.js :: FULL FILE
(function(){
  const H = {
    SLIDE_MS: 420,
    GRADIENT: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.62) 100%)",
    cur: 0,
    lock: false,
    cats: [
      { slug:"all",         img:"Image/Banner/0.png",
        t:"과거를 배우고, 미래를 꿈꾸는 여행",
        s:"서간도에서 하와이까지, 독립의 발자취를 따라가는 프리미엄 해설 투어",
        theme:{ cta1:"#D7BB83", cta2:"#C3A36A" } },

      { slug:"seogando",    img:"Image/Banner/1.png",
        t:"서간도의 길을 걷다",
        s:"만주의 기상을 백두산 위에서 외치다",
        theme:{ cta1:"#D0B37A", cta2:"#B69253" } },

      { slug:"bukgando",    img:"Image/Banner/2.png",
        t:"북간도의 길을 걷다",
        s:"두만강을 건너 세운 희망, 독립의 불씨가 타오르다",
        theme:{ cta1:"#C9B07D", cta2:"#A98D4E" } },

      { slug:"provisional", img:"Image/Banner/3.png",
        t:"임시정부의 발자취를 따라",
        s:"망명지의 하늘 아래, 대한의 이름이 다시 새기다",
        theme:{ cta1:"#CFB27A", cta2:"#B4945A" } },

      { slug:"primorye",    img:"Image/Banner/4.png",
        t:"극동 연해주",
        s:"가장 차가운 땅에서 가장 뜨거운 꿈을 꾸다",
        theme:{ cta1:"#C2A66F", cta2:"#A78646" } },

      { slug:"japan",       img:"Image/Banner/5.png",
        t:"일본 땅에서 피운 뜻",
        s:"바다를 건너 도착한 그곳에서, 자유의 뜻을 퍼트리다",
        theme:{ cta1:"#D4BB86", cta2:"#B8985B" } },

      { slug:"hawaii",      img:"Image/Banner/6.png",
        t:"하와이에서 이어진 약속",
        s:"푸른 바다 위에서 피어난 뜨거운 조국의 혼",
        theme:{ cta1:"#E0C28D", cta2:"#C0A063" } }
    ]
  };

  function $(sel, base=document){ return base.querySelector(sel); }
  function $all(sel, base=document){ return Array.prototype.slice.call(base.querySelectorAll(sel)); }
  function setVar(name, value){ document.documentElement.style.setProperty(name, value); }

  function updateSEO(cat){
    document.title = cat.t + " | NAVI TOUR";
    setMeta('name','description', cat.s);
    setMeta('property','og:title', cat.t + " | NAVI TOUR");
    setMeta('property','og:description', cat.s);
    setMeta('property','og:image', absolute(cat.img));
    setMeta('name','twitter:title', cat.t + " | NAVI TOUR");
    setMeta('name','twitter:description', cat.s);
    setMeta('name','twitter:image', absolute(cat.img));
  }
  function setMeta(attr, key, val){
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if(!m){ m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function absolute(path){
    try{ return new URL(path, location.origin + location.pathname).toString(); }
    catch(e){ return path; }
  }

  function stickAtHeroBottom(){
    const row = $('.chips'), bar = $('.chipbar');
    if(!row || !bar) return;
    const h = Math.round(row.getBoundingClientRect().height || 0);
    bar.style.marginTop = h ? ('-' + h + 'px') : '';
  }

  function toggleEdgeFades(){
    const rail = $('#chipRail');
    if(!rail) return;
    const scrollable = rail.scrollWidth > rail.clientWidth + 2;
    rail.classList.toggle('is-scrollable', scrollable);
  }

  function setSlideBg(el, img){
    el.style.backgroundImage = `${H.GRADIENT}, url('${img}')`;
  }

  function go(idx, btn){
    if(H.lock || idx === H.cur) return;
    const cat = H.cats[idx] || H.cats[0];
    H.lock = true;

    // 테마 적용
    setVar('--cta1', cat.theme.cta1); setVar('--cta2', cat.theme.cta2);

    const A = $('#slideA'), B = $('#slideB');
    const front = A.classList.contains('front') ? A : B;
    const back  = front === A ? B : A;
    const dir   = idx > H.cur ? 1 : -1;

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 준비
    back.style.transition = 'none';
    if(reduce){ back.style.opacity = '0' }
    else       { back.style.transform = `translateX(${dir > 0 ? '100%' : '-100%'})` }
    setSlideBg(back, cat.img);
    void back.offsetWidth;

    // 실행
    if(reduce){
      front.style.transition = `opacity 200ms ease`;
      back .style.transition = `opacity 200ms ease`;
      front.style.opacity = '0';
      back .style.opacity  = '1';
    }else{
      const ease = `transform ${H.SLIDE_MS}ms cubic-bezier(.22,.61,.36,1)`;
      front.style.transition = ease; back.style.transition = ease;
      front.style.transform  = `translateX(${dir > 0 ? '-100%' : '100%'})`;
      back .style.transform  = `translateX(0)`;
    }

    // 텍스트 교체
    const t = $('#heroText'), h = $('#heroTitle'), p = $('#heroSub');
    t.style.opacity = '0';
    setTimeout(()=>{ h.textContent = cat.t; p.textContent = cat.s; t.style.opacity = '1'; }, 140);

    // 칩 상태/접근성
    const row = $('#chipRow');
    if(row){
      $all('.chip', row).forEach(x=>{
        const active = x === btn;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    // 히스토리(깊은 링크)
    try{
      const u = new URL(location.href);
      u.hash = 'cat=' + cat.slug;
      history.replaceState(null,'',u.toString());
      sessionStorage.setItem('heroCat', cat.slug);
    }catch(e){ location.hash = 'cat=' + cat.slug; }

    // SEO 업데이트
    updateSEO(cat);

    // 락 해제
    setTimeout(()=>{
      front.classList.remove('front');
      back .classList.add('front');
      if(reduce){ front.style.opacity=''; back.style.opacity=''; }
      H.cur = idx; H.lock = false;
    }, (reduce ? 220 : H.SLIDE_MS) + 20);
  }

  function readInitial(){
    // 해시 우선, 없으면 쿼리, 그것도 없으면 세션
    let slug = null;
    if(location.hash){
      const h = location.hash.replace(/^#/, '');
      const m = h.match(/cat=([a-z0-9_-]+)/i) || h.match(/^([a-z0-9_-]+)$/i);
      if(m) slug = m[1];
    }
    if(!slug){
      try{ const u = new URL(location.href); slug = u.searchParams.get('cat') || sessionStorage.getItem('heroCat'); }catch(e){}
    }
    const idx = Math.max(0, H.cats.findIndex(c=>c.slug===slug));
    const cat = H.cats[idx] || H.cats[0];

    // 초기 세팅(애니 없이)
    setVar('--cta1', cat.theme.cta1); setVar('--cta2', cat.theme.cta2);
    $('#heroTitle').textContent = cat.t;
    $('#heroSub').textContent   = cat.s;
    setSlideBg($('#slideA'), cat.img);
    $('#slideA').style.transition='none';
    $('#slideB').style.transition='none';
    $('#slideA').style.transform='translateX(0)';
    $('#slideB').style.transform='translateX(100%)';
    H.cur = idx;
    updateSEO(cat);

    // 칩 표시
    const row = $('#chipRow');
    if(row){
      $all('.chip', row).forEach(x=>{
        const active = (parseInt(x.dataset.idx||'0',10)===idx);
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }

  function bind(){
    const row = $('#chipRow'); if(!row) return;
    // 클릭 바인딩
    row.addEventListener('click', e=>{
      const btn = e.target.closest('.chip'); if(!btn) return;
      if(H.lock) return; // 디바운스
      const idx  = parseInt(btn.dataset.idx||'0',10) || 0;
      go(idx, btn);
    });
    // 초기 위치/스크롤 힌트
    stickAtHeroBottom();
    toggleEdgeFades();
    // 리사이즈
    window.addEventListener('resize', ()=>{
      stickAtHeroBottom();
      toggleEdgeFades();
    });
  }

  function mountWhenReady(){
    // 조각이 나중에 주입돼도 붙도록 감시
    const tryMount = ()=>{
      const ready = $('.chipbar') && $('#slideA') && $('#slideB') && $('#chipRow');
      if(ready){
        readInitial();
        bind();
        // 이미지 프리로드
        H.cats.forEach(c=>{ const im=new Image(); im.src=c.img; });
        return true;
      }
      return false;
    };
    if(tryMount()) return;

    const mo = new MutationObserver(()=>{
      if(tryMount()){ mo.disconnect(); }
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }

  // 해시 변경으로 외부 네비게이션 됐을 때
  window.addEventListener('hashchange', ()=>{
    const h = location.hash.replace(/^#/,'');
    const m = h.match(/cat=([a-z0-9_-]+)/i) || h.match(/^([a-z0-9_-]+)$/i);
    if(!m) return;
    const slug = m[1];
    const idx = H.cats.findIndex(c=>c.slug===slug);
    if(idx<0 || idx===H.cur) return;
    const btn = document.querySelector('.chip[data-idx="'+idx+'"]');
    go(idx, btn);
  });

  // DOM 준비되면 시동
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mountWhenReady, {once:true});
  }else{
    mountWhenReady();
  }

  // 공개 API(원하면 외부에서 호출 가능)
  window.NT_HERO = { go, mount: mountWhenReady };
})();
