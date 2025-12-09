// PATH: /Js/HeroChips.js :: FULL FILE

/* =======================================================================
   NAVI TOUR – 메인 히어로 배너 + 칩바 제어 스크립트

   [파일 전체 개요]
   - 메인 페이지 상단의 히어로 배너(이미지/텍스트)와
     아래 카테고리 칩(버튼)들을 제어하는 전용 모듈.

   [목차]

   0. 모듈 래퍼(IIFE)
   1. 전역 상태/설정 객체 H
   2. 공통 유틸 함수
      2-1. DOM 셀렉터($, $all)
      2-2. CSS 변수 변경(setVar)
      2-3. 화면 폭에 따른 배너 이미지 선택(getHeroImg)
      2-4. 메타 태그 관리(setMeta, absolute)
   3. SEO 업데이트 로직(updateSEO)
   4. CTA 버튼 갱신(updateCTA)
   5. 칩바 위치/스크롤 보정
      5-1. stickAtHeroBottom: 히어로 하단에 겹치게 (노트북 튜닝 포함)
      5-2. toggleEdgeFades: 칩이 넘칠 때 스크롤 가능 클래스 토글
   6. 슬라이드 배경 설정(setSlideBg)
   7. 메인 전환 함수(go)
   8. 초기 상태 읽기(readInitial)
   9. 이벤트 바인딩(bind)
   10. DOM 주입 대기 및 초기화(mountWhenReady)
   11. hashchange 핸들러(외부에서 해시로 카테고리 바꿀 때 대응)
   12. DOMContentLoaded 시점에 모듈 시동
   13. 외부 공개 API(window.NT_HERO)

   - 이 파일은 단독으로도 동작하지만, Banner.html 구조
     (slideA/slideB, chipbar, chipRow, heroTitle, heroSub, heroCta)를
     전제로 함.
   ======================================================================= */

(function(){

  /* -------------------------------------------------------------------
     1. 전역 상태/설정 객체 H
        - 전환 시간, 그라디언트, 현재 인덱스, 락 상태, 카테고리 정의
  ------------------------------------------------------------------- */
  const H = {
    SLIDE_MS: 420,  // 슬라이드 애니메이션 기본 시간(ms)
    GRADIENT: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.62) 100%)",
    cur: 0,         // 현재 선택된 카테고리 인덱스
    lock: false,    // 전환 중 중복 호출 방지용 락
    // 메인 히어로에 표시할 카테고리 설정 목록
    // img     : 데스크탑(4K~1920)
    // imgNote : 노트북/모바일 공용
    cats: [
      {
        slug:"all",
        img:"Image/Banner/0.webp",
        imgNote:"Image/Banner/note/0.webp",
        href:"#detail",
        t:"역사의 현장에서, 미래를 꿈꾸는 여행",
        s:"독립전쟁의 발자취와 겨레의 소중한 유산을 통해, 꿈과 비전을 캐내는 창의적 인문기행",
        theme:{ cta1:"#D7BB83", cta2:"#C3A36A" }
      },
      {
        slug:"seogando",
        img:"Image/Banner/1.webp",
        imgNote:"Image/Banner/note/1.webp",
        href:"route/seogando.html",
        t:"서간도의 길을 걷다",
        s:"고구려와 백두산의 기상으로 외치는 대한독립만세",
        theme:{ cta1:"#D0B37A", cta2:"#B69253" }
      },
      {
        slug:"bukgando",
        img:"Image/Banner/2.webp",
        imgNote:"Image/Banner/note/2.webp",
        href:"route/bukgando.html",
        t:"북간도의 길을 걷다",
        s:"두만강을 건너 세운 희망, 독립의 불씨가 타오르다",
        theme:{ cta1:"#C9B07D", cta2:"#A98D4E" }
      },
      {
        slug:"provisional",
        img:"Image/Banner/3.webp",
        imgNote:"Image/Banner/note/3.webp",
        href:"route/provisional_gov.html",
        t:"임시정부의 발자취를 따라",
        s:"망명지의 하늘 아래, 대한의 이름이 다시 새기다",
        theme:{ cta1:"#CFB27A", cta2:"#B4945A" }
      },
      {
        slug:"primorye",
        img:"Image/Banner/4.webp",
        imgNote:"Image/Banner/note/4.webp",
        href:"route/primorye.html",
        t:"극동 연해주의 길을 걷다",
        s:"가장 차가운 땅에서 가장 뜨거운 꿈을 꾸다",
        theme:{ cta1:"#C2A66F", cta2:"#A78646" }
      },
      {
        slug:"japan",
        img:"Image/Banner/5.webp",
        imgNote:"Image/Banner/note/5.webp",
        href:"route/japan.html",
        t:"일본 땅에서 피운 뜻",
        s:"바다를 건너 도착한 그곳에서, 자유의 뜻을 퍼트리다",
        theme:{ cta1:"#D4BB86", cta2:"#B8985B" }
      },
      {
        slug:"hawaii",
        img:"Image/Banner/6.webp",
        imgNote:"Image/Banner/note/6.webp",
        href:"route/hawaii.html",
        t:"하와이에서 이어진 약속",
        s:"푸른 바다 위에서 피어난 뜨거운 조국의 혼",
        theme:{ cta1:"#E0C28D", cta2:"#C0A063" }
      }
    ]
  };

  /* -------------------------------------------------------------------
     2. 공통 유틸 함수
  ------------------------------------------------------------------- */

  // 2-1. DOM 셀렉터 단축 함수
  function $(sel, base=document){ return base.querySelector(sel); }
  function $all(sel, base=document){ return Array.prototype.slice.call(base.querySelectorAll(sel)); }

  // 2-2. CSS 변수(--var) 변경용 헬퍼
  function setVar(name, value){ document.documentElement.style.setProperty(name, value); }

  /* 2-3. 화면 폭에 따른 배너 이미지 선택
         - 1920px 이상 : 기본 img (4K~1920 공용)
         - 그 미만     : imgNote 있으면 imgNote, 없으면 img
  ------------------------------------------------------------------- */
  function getHeroImg(cat){
    if(!cat) return '';
    const w = window.innerWidth || document.documentElement.clientWidth || 1280;

    if(w >= 1920){
      return cat.img || cat.imgNote || '';
    }
    return cat.imgNote || cat.img || '';
  }

  /* 2-4. 메타 태그 관리
     - setMeta: 존재하면 업데이트, 없으면 생성
     - absolute: 상대 경로를 절대 URL로 변환(og:image 용 등) */

  function updateSEO(cat){
    const heroImg = getHeroImg(cat) || cat.img;
    document.title = cat.t + " | NAVI TOUR";
    setMeta('name','description', cat.s);
    setMeta('property','og:title', cat.t + " | NAVI TOUR");
    setMeta('property','og:description', cat.s);
    setMeta('property','og:image', absolute(heroImg));
    setMeta('name','twitter:title', cat.t + " | NAVI TOUR");
    setMeta('name','twitter:description', cat.s);
    setMeta('name','twitter:image', absolute(heroImg));
  }

  function setMeta(attr, key, val){
    // attr: "name" / "property" 등, key: 메타 이름, val: content 값
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if(!m){
      m = document.createElement('meta');
      m.setAttribute(attr, key);
      document.head.appendChild(m);
    }
    m.setAttribute('content', val);
  }

  function absolute(path){
    // 상대 경로를 현재 위치 기준 절대 URL로 변환
    try{
      return new URL(path, location.origin + location.pathname).toString();
    }catch(e){
      // URL 생성이 실패하면 원본 경로 그대로 반환
      return path;
    }
  }

  /* -------------------------------------------------------------------
     4. CTA 버튼 갱신(updateCTA)
        - 카테고리별 상세보기 링크를 히어로 CTA에 반영
  ------------------------------------------------------------------- */
  function updateCTA(cat){
    const cta = $('#heroCta');
    if(!cta) return;
    const href = cat.href || '#detail';
    cta.setAttribute('href', href);
    cta.setAttribute('data-slug', cat.slug);
  }

  /* -------------------------------------------------------------------
     5. 칩바 위치/스크롤 관련 보정
  ------------------------------------------------------------------- */

  // 5-1. 칩바를 히어로 하단에 겹쳐 붙이기 (노트북에서 조금 더 위로)
  function stickAtHeroBottom(){
    const row  = $('.chips');
    const bar  = $('.chipbar');
    const hero = $('.hero');
    if(!row || !bar || !hero) return;

    const chipH = Math.round(row.getBoundingClientRect().height || 0);
    if(!chipH){
      bar.style.marginTop = '';
      return;
    }

    // 기본: 칩 높이만큼만 위로 올림 (데스크탑에서 보이는 상태)
    let overlap = chipH;

    // 세로가 짧은 화면(노트북 등)에서는 약간 더 위로 끌어올리기
    if(window.innerHeight && window.innerHeight < 900){
      overlap = chipH + 8;   // 필요하면 8을 10~16 정도로 조절
    }

    bar.style.marginTop = '-' + overlap + 'px';
  }

  // 5-2. 칩이 가로로 넘칠 때 스크롤 가능 여부 표시
  function toggleEdgeFades(){
    const rail = $('#chipRail');
    if(!rail) return;
    const scrollable = rail.scrollWidth > rail.clientWidth + 2;
    rail.classList.toggle('is-scrollable', scrollable);
  }

  /* -------------------------------------------------------------------
     6. 슬라이드 배경 설정
        - 그라디언트 + 카테고리 이미지 조합
  ------------------------------------------------------------------- */
  function setSlideBg(el, img){
    if(!el) return;
    el.style.backgroundImage = `${H.GRADIENT}, url('${img}')`;
  }

  /* -------------------------------------------------------------------
     7. 메인 전환 함수(go)
        - 칩 클릭 / 해시 변경 시 호출
        - 슬라이드/텍스트/SEO/CTA/URL 상태까지 한 번에 변경
  ------------------------------------------------------------------- */
  function go(idx, btn){
    // 전환 중이거나 이미 같은 인덱스면 무시
    if(H.lock || idx === H.cur) return;

    const cat = H.cats[idx] || H.cats[0];
    H.lock = true;   // 중복 호출 방지 락

    // 7-2. CTA 그라디언트 색상 적용
    setVar('--cta1', cat.theme.cta1);
    setVar('--cta2', cat.theme.cta2);

    // 현재/다음 슬라이드 엘리먼트 선택
    const A = $('#slideA'), B = $('#slideB');
    const front = A.classList.contains('front') ? A : B;
    const back  = front === A ? B : A;
    const dir   = idx > H.cur ? 1 : -1;  // 오른쪽/왼쪽 이동 방향

    // 사용자 환경설정: 모션 줄이기 여부
    const reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 7-3. 슬라이드 준비 단계 ---
    back.style.transition = 'none';
    if(reduce){
      // 모션 줄이기: 투명도 페이드 방식
      back.style.opacity = '0';
    }else{
      // 일반 모션: 옆에서 슬라이드 인
      back.style.transform = `translateX(${dir > 0 ? '100%' : '-100%'})`;
    }
    setSlideBg(back, getHeroImg(cat)); // 뒤쪽 슬라이드 배경만 먼저 교체
    void back.offsetWidth;             // 리플로우로 transition 리셋

    // --- 7-3. 슬라이드 실행 단계 ---
    if(reduce){
      front.style.transition = `opacity 200ms ease`;
      back .style.transition = `opacity 200ms ease`;
      front.style.opacity = '0';
      back .style.opacity  = '1';
    }else{
      const ease = `transform ${H.SLIDE_MS}ms cubic-bezier(.22,.61,.36,1)`;
      front.style.transition = ease;
      back .style.transition = ease;
      front.style.transform  = `translateX(${dir > 0 ? '-100%' : '100%'})`;
      back .style.transform  = `translateX(0)`;
    }

    // --- 7-4. 텍스트(타이틀/서브) 전환 ---
    const t = $('#heroText'), h = $('#heroTitle'), p = $('#heroSub');
    if(t){
      t.style.opacity = '0';   // 살짝 페이드 아웃
      setTimeout(()=>{
        h.textContent = cat.t;
        p.textContent = cat.s;
        t.style.opacity = '1'; // 새 텍스트로 페이드 인
      }, 140);
    }

    // --- 7-5. 칩 상태 & 접근성 속성 갱신 ---
    const row = $('#chipRow');
    if(row){
      $all('.chip', row).forEach(x=>{
        const active = x === btn;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    // --- 7-6. URL 해시/세션 스토리지에 현재 카테고리 기록 ---
    try{
      const u = new URL(location.href);
      u.hash = 'cat=' + cat.slug;
      history.replaceState(null,'',u.toString());
      sessionStorage.setItem('heroCat', cat.slug);
    }catch(e){
      // 구형 브라우저 대비: 최소한 해시만 변경
      location.hash = 'cat=' + cat.slug;
    }

    // --- 7-7. SEO & CTA 업데이트 ---
    updateSEO(cat);
    updateCTA(cat);

    // 애니메이션 종료 후 상태 정리 및 락 해제
    setTimeout(()=>{
      front.classList.remove('front');
      back .classList.add('front');
      if(reduce){
        front.style.opacity='';
        back.style.opacity='';
      }
      H.cur = idx;   // 현재 인덱스 갱신
      H.lock = false;
    }, (reduce ? 220 : H.SLIDE_MS) + 20);
  }

  /* -------------------------------------------------------------------
     8. 초기 상태 읽기(readInitial)
        - URL 해시 / 쿼리 / 세션 저장값에서 슬러그를 찾아
          첫 진입 시 보여줄 카테고리를 결정
  ------------------------------------------------------------------- */
  function readInitial(){
    // 우선순위: 해시 > 쿼리 파라미터 > 세션스토리지
    let slug = null;

    // 1) location.hash에서 cat=슬러그 또는 슬러그 단독 형태 지원
    if(location.hash){
      const h = location.hash.replace(/^#/, '');
      const m = h.match(/cat=([a-z0-9_-]+)/i) ||
                h.match(/^([a-z0-9_-]+)$/i);
      if(m) slug = m[1];
    }

    // 2) 쿼리 파라미터 ?cat=... 또는 세션 히스토리
    if(!slug){
      try{
        const u = new URL(location.href);
        slug = u.searchParams.get('cat') ||
               sessionStorage.getItem('heroCat');
      }catch(e){}
    }

    // 3) 못 찾으면 0번(전체)로 폴백
    const idx = Math.max(0, H.cats.findIndex(c=>c.slug===slug));
    const cat = H.cats[idx] || H.cats[0];

    // CSS 변수로 CTA 색상 초기화
    setVar('--cta1', cat.theme.cta1);
    setVar('--cta2', cat.theme.cta2);

    // 텍스트 초기화
    const title = $('#heroTitle');
    const sub   = $('#heroSub');
    if(title) title.textContent = cat.t;
    if(sub)   sub.textContent   = cat.s;

    // 슬라이드 초기 위치(전환 애니 없이 바로 세팅)
    const A = $('#slideA'), B = $('#slideB');
    if(A && B){
      setSlideBg(A, getHeroImg(cat));
      A.style.transition='none';
      B.style.transition='none';
      A.style.transform='translateX(0)';
      B.style.transform='translateX(100%)';
    }

    H.cur = idx;
    updateSEO(cat);
    updateCTA(cat);

    // 칩 is-active/aria-pressed 초기 세팅
    const row = $('#chipRow');
    if(row){
      $all('.chip', row).forEach(x=>{
        const active = (parseInt(x.dataset.idx||'0',10)===idx);
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }

  /* -------------------------------------------------------------------
     9. 이벤트 바인딩(bind)
        - 칩 클릭, 리사이즈 시 레이아웃 보정
  ------------------------------------------------------------------- */
  function bind(){
    const row = $('#chipRow');
    if(!row) return;

    // 칩 클릭 시 해당 인덱스로 전환
    row.addEventListener('click', e=>{
      const btn = e.target.closest('.chip');
      if(!btn || H.lock) return;
      const idx  = parseInt(btn.dataset.idx||'0',10) || 0;
      go(idx, btn);
    });

    // 초기 위치/스크롤 여부 계산
    stickAtHeroBottom();
    toggleEdgeFades();

    // 리사이즈 때마다 다시 계산 + 현재 카테고리 배너 이미지도 재적용
    window.addEventListener('resize', ()=>{
      stickAtHeroBottom();
      toggleEdgeFades();

      const cat   = H.cats[H.cur] || H.cats[0];
      const img   = getHeroImg(cat);
      const front = document.querySelector('.slide.front');
      const back  = document.querySelector('.slide:not(.front)');
      if(front && img) setSlideBg(front, img);
      if(back  && img) setSlideBg(back, img);

      updateSEO(cat);
    });
  }

  /* -------------------------------------------------------------------
     10. DOM 주입 대기 및 초기화(mountWhenReady)
         - 헤더/배너가 fetch로 나중에 주입되는 케이스까지 대응
  ------------------------------------------------------------------- */
  function mountWhenReady(){
    // 필요한 요소들이 모두 준비됐는지 체크하는 내부 함수
    const tryMount = ()=>{
      const ready = (
        $('.chipbar') &&
        $('#slideA') &&
        $('#slideB') &&
        $('#chipRow')
      );
      if(ready){
        readInitial();
        bind();
        // 카테고리별 이미지 미리 로드(전환 시 깜빡임 줄이기)
        H.cats.forEach(c=>{
          if(c.img){
            const im = new Image();
            im.src = c.img;
          }
          if(c.imgNote){
            const im2 = new Image();
            im2.src = c.imgNote;
          }
        });
        return true;
      }
      return false;
    };

    // DOM에 이미 다 올라와 있으면 바로 초기화
    if(tryMount()) return;

    // 아니면 DOM 변경을 감시했다가 준비되면 초기화
    const mo = new MutationObserver(()=>{
      if(tryMount()){
        mo.disconnect();
      }
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }

  /* -------------------------------------------------------------------
     11. hashchange 핸들러
         - 외부에서 location.hash = "cat=..." 으로 바꿨을 때도
           히어로 상태를 동기화하기 위한 리스너
  ------------------------------------------------------------------- */
  window.addEventListener('hashchange', ()=>{
    const h = location.hash.replace(/^#/,'');

    // cat=슬러그 / 슬러그 단독 두 가지 패턴 지원
    const m = h.match(/cat=([a-z0-9_-]+)/i) ||
              h.match(/^([a-z0-9_-]+)$/i);
    if(!m) return;

    const slug = m[1];
    const idx = H.cats.findIndex(c=>c.slug===slug);
    if(idx<0 || idx===H.cur) return;

    const btn = document.querySelector('.chip[data-idx="'+idx+'"]');
    go(idx, btn);
  });

  /* -------------------------------------------------------------------
     12. DOMContentLoaded 시점에 모듈 시동
         - 문서 로딩 상태에 따라 바로 실행하거나 이벤트로 대기
  ------------------------------------------------------------------- */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mountWhenReady, {once:true});
  }else{
    mountWhenReady();
  }

  /* -------------------------------------------------------------------
     13. 외부 공개 API
         - window.NT_HERO.go(idx, 버튼) : 강제 전환
         - window.NT_HERO.mount()       : 수동 재마운트
  ------------------------------------------------------------------- */
  window.NT_HERO = { go, mount: mountWhenReady };
})();
