/* PATH: /Js/RouteDetail.js :: FULL FILE */
(function () {
  'use strict';

  /** ************************************
   * [0] 공용 프래그먼트 로더
   ************************************* */
  function loadFragment(id, defaultSrc, onLoaded) {
    const host = document.getElementById(id);
    if (!host) return;

    const src = host.getAttribute('data-src') || defaultSrc;

    fetch(src, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        host.outerHTML = html;
        if (typeof onLoaded === 'function') onLoaded();
      })
      .catch(function (err) {
        console.error('[NAVI TOUR] fragment load failed:', id, '→', src, err);
      });
  }

  /**
   * main#page 뒤에 placeholder를 없으면 만들어서 붙이고 로드
   *  - 여기서 **항상 appendChild**로만 붙여서
   *    호출 순서대로 DOM 아래쪽에 쌓이게 만든다.
   */
  function ensureFragmentAfterMain(id, defaultSrc, onLoaded) {
    let host = document.getElementById(id);
    if (!host) {
      const main = document.getElementById('page') || document.querySelector('main');
      host = document.createElement('div');
      host.id = id;
      host.setAttribute('data-src', defaultSrc);

      if (main && main.parentNode) {
        // 그냥 main 부모의 맨 끝에 추가 → 먼저 receipt, 그다음 footer
        main.parentNode.appendChild(host);
      } else {
        document.body.appendChild(host);
      }
    }

    loadFragment(id, defaultSrc, onLoaded);
  }

  // [1] 헤더 주입 (Comp/Header.html)
  function injectHeader() {
    loadFragment('site-header', 'Comp/Header.html');
  }

  // [1-2] 상세 하단 문의 CTA (Comp/Receipt.html)
  function injectReceipt() {
    ensureFragmentAfterMain('site-receipt', 'Comp/Receipt.html');
  }

  // [1-3] 푸터 (Comp/Footer.html)
  function injectFooter() {
    ensureFragmentAfterMain('site-footer', 'Comp/Footer.html');
  }

  // [2] 히어로 배경 설정 (main#page data-hero / data-hero-x 사용)
  function initHero() {
    const page = document.getElementById('page');
    if (!page) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const img = page.dataset.hero;
    const alignX = page.dataset.heroX || 'center';

    if (!img) return;

    hero.style.backgroundImage =
      "linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.6)), url('" + img + "')";
    hero.style.backgroundPosition = alignX + " center";
    hero.style.backgroundSize = "cover";
    hero.style.backgroundRepeat = "no-repeat";
  }

  // [3] 상품/하이라이트/사적지 템플릿 로더
  function initProductTemplates() {
    const page = document.getElementById('page');
    if (!page) return;

    const productUrl = page.dataset.product;
    const mountList  = page.dataset.mountList;
    const mountHigh  = page.dataset.mountHigh;
    const mountSites = page.dataset.mountSites;

    if (!productUrl) return;

    fetch(productUrl, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        const wrap = document.createElement('div');
        wrap.innerHTML = html;

        const tplList  = wrap.querySelector('#product-list');
        const tplHigh  = wrap.querySelector('#product-highlights');
        const tplSites = wrap.querySelector('#site-cards');

        if (tplList && mountList) {
          const target = document.querySelector(mountList);
          if (target) target.appendChild(tplList.content.cloneNode(true));
        }

        if (tplHigh && mountHigh) {
          const target = document.querySelector(mountHigh);
          if (target) target.appendChild(tplHigh.content.cloneNode(true));
        }

        if (tplSites && mountSites) {
          const target = document.querySelector(mountSites);
          if (target) target.appendChild(tplSites.content.cloneNode(true));
        }
      })
      .catch(function (err) {
        console.error('[NAVI TOUR] Product templates load failed:', productUrl, err);
      });
  }

  // [4] 상단 탭(내부 앵커) 스크롤 & 활성 상태
  function initTabs() {
    const tabs = document.querySelectorAll('.page-nav-tabs a[href^="#"]');
    if (!tabs.length) return;

    function setActive(el) {
      tabs.forEach(function (a) {
        a.classList.toggle('is-active', a === el);
      });
    }

    tabs.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        const href = this.getAttribute('href');
        const id = href.slice(1);
        const target = document.getElementById(id);

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + id);
        }
        setActive(this);
      });
    });

    // 새로고침 시 해시 기반 활성화
    if (location.hash) {
      const current = Array.from(tabs).find(function (a) {
        return a.getAttribute('href') === location.hash;
      });
      if (current) setActive(current);
    }
  }

  // [BOOT] 상세 페이지 공통 초기화
  document.addEventListener('DOMContentLoaded', function () {
    injectHeader();
    initHero();
    initProductTemplates();
    initTabs();

    // 공통 하단 섹션들: 먼저 상담, 그다음 푸터
    injectReceipt();
    injectFooter();
  });
})();
