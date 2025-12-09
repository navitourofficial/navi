// PATH: /Dp/Dp.js :: FULL FILE
(function () {
  'use strict';

  /* =========================================================
     0. 공통 레이아웃 include 로더
        - Header / 하단 CTA / Footer
        - [data-src] 속성 사용 (예: Comp/Header.html 등)
  ========================================================= */
  (function () {
    var blocks = document.querySelectorAll('[data-src]');
    if (!blocks.length) return;

    blocks.forEach(function (el) {
      var url = el.getAttribute('data-src');
      if (!url) return;

      fetch(url, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (html) {
          el.innerHTML = html;
        })
        .catch(function (err) {
          console.error('[Layout include error]', url, err);
        });
    });
  })();


  /* =========================================================
     1. 히어로 갤러리 (메인 이미지 + 썸네일 + 좌우 버튼)
  ========================================================= */
  (function(){
    var hero = document.querySelector('.prod-hero');
    if (!hero) return;

    var mainImg = hero.querySelector('.media-main img');
    var thumbs = Array.prototype.slice.call(
      hero.querySelectorAll('.media-thumbs .thumb')
    );
    if (!mainImg || !thumbs.length) return;

    var sources = thumbs.map(function(btn){
      var img = btn.querySelector('img');
      return img ? img.getAttribute('src') : null;
    }).filter(Boolean);

    var idx = 0;

    function setIndex(i){
      if (!sources.length) return;
      idx = (i + sources.length) % sources.length;
      mainImg.src = sources[idx];
      thumbs.forEach(function(btn, bi){
        btn.classList.toggle('is-active', bi === idx);
      });
    }

    thumbs.forEach(function(btn, bi){
      btn.addEventListener('click', function(){
        setIndex(bi);
      });
    });

    var prevBtn = hero.querySelector('.media-nav .prev');
    var nextBtn = hero.querySelector('.media-nav .next');

    if (prevBtn){
      prevBtn.addEventListener('click', function(){
        setIndex(idx - 1);
      });
    }
    if (nextBtn){
      nextBtn.addEventListener('click', function(){
        setIndex(idx + 1);
      });
    }

    // 초기 상태 동기화
    var initial = sources.indexOf(mainImg.getAttribute('src'));
    if (initial >= 0) idx = initial;
    setIndex(idx);
  })();


  /* =========================================================
     2. include 로더 (문의 & 예약 상담 박스 등)
        - data-include="Tour_Receipt.html" 같은 것들 처리
  ========================================================= */
  (function(){
    var targets = document.querySelectorAll('[data-include]');
    if (!targets.length) return;

    targets.forEach(function(el){
      var url = el.getAttribute('data-include');
      if (!url) return;
      fetch(url)
        .then(function(res){ return res.text(); })
        .then(function(html){ el.innerHTML = html; })
        .catch(function(err){ console.error('include error:', url, err); });
    });
  })();


  /* =========================================================
     3. 공통 섹션 템플릿 주입
        - 여행 기본 정보 (#summary)
        - 포함 / 불포함 (#include)
        - 이용 안내 및 유의 사항 (#notice)
  ========================================================= */
  (function(){
    // 여행 기본 정보
    var summary = document.getElementById('summary');
    if (summary) {
      summary.innerHTML = `
        <h2 class="section-title">여행 기본 정보</h2>
        <div class="info-card">
          <table class="info-table">
            <tbody>
              <tr>
                <th>여행 형태</th>
                <td>단체 맞춤 기획</td>
              </tr>
              <tr>
                <th>숙박 기준</th>
                <td>현지 3~4성급 호텔 / 2인 1실 기준 (조식 포함)</td>
              </tr>
              <tr>
                <th>이동 수단</th>
                <td>전용 버스 + 일부 구간 도보 답사</td>
              </tr>
              <tr>
                <th>해설 &amp; 진행</th>
                <td>전 일정 역사 해설 + 인솔자 동행</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // 포함 / 불포함
    var include = document.getElementById('include');
    if (include) {
      include.innerHTML = `
        <div>
          <h2 class="section-title">포함 사항</h2>
          <ul class="bullet-list">
            <li>왕복 항공료 및 유류할증료(견적 시점 기준)</li>
            <li>전 일정 전용 차량 및 기사 경비</li>
            <li>숙박 (3~4성급 기준, 2인 1실)</li>
            <li>전 일정 조식 + 일정표에 명시된 식사</li>
            <li>전문 역사 해설사 &amp; 인솔자 인건비</li>
            <li>입장료 및 프로그램 참가비(사전 합의된 범위)</li>
          </ul>
        </div>
        <div>
          <h2 class="section-title">불포함 사항</h2>
          <ul class="bullet-list">
            <li>개인 경비 (개인 간식, 기념품, 호텔 룸서비스 등)</li>
            <li>여행자 보험 (필수 가입 권장)</li>
            <li>가이드/기사 경비 외 단체가 별도 약속한 사례비</li>
            <li>그 외 일정표에 명시되지 않은 선택 프로그램</li>
          </ul>
        </div>
      `;
    }

    // 이용 안내 및 유의 사항
    var notice = document.getElementById('notice');
    if (notice) {
      notice.innerHTML = `
        <h2 class="section-title">이용 안내 및 유의 사항</h2>
        <div class="notice-card">
          <h3>예약 / 결제</h3>
          <ul class="bullet-list">
            <li>견적 승인 후, 계약서 서명과 함께 예약이 확정됩니다.</li>
            <li>일반적으로 출발 30일 전까지 일정 금액을 선입금합니다.</li>
            <li>항공/숙박 확정 시점에 따라 결제 일정이 조정될 수 있습니다.</li>
          </ul>

          <h3>취소 / 환불 규정(예시)</h3>
          <ul class="bullet-list">
            <li>출발 30일 전까지 전액 환불</li>
            <li>출발 29~15일 전: 상품가의 10% 공제 후 환불</li>
            <li>출발 14~7일 전: 상품가의 30% 공제 후 환불</li>
            <li>출발 6일 전~당일: 환불 불가</li>
          </ul>

          <h3>기타 안내</h3>
          <ul class="bullet-list">
            <li>최소 인원 미달 시, 일정 조정 또는 출발이 취소될 수 있습니다.</li>
            <li>현지 사정(날씨, 교통, 안전 등)에 따라 일정 순서가 변경될 수 있습니다.</li>
          </ul>
        </div>
      `;
    }
  })();


  /* =========================================================
     4. 상세 페이지: 슬러그 기반 시트 데이터 주입
        - body[data-product-sheet][data-product-slug]
        - window.NaviProd (ProductSheetLoader.js) 사용
  ========================================================= */
  (function(){
    if (!window.NaviProd) return;

    var root = document.body;
    if (!root) return;

    var sheetKey = root.getAttribute('data-product-sheet');
    var slug     = root.getAttribute('data-product-slug');
    if (!sheetKey || !slug) {
      console.warn('[ProdDetail] sheet / slug 미설정');
      return;
    }

    function fillPage(p) {
      if (!p) return;

      // <title>
      var headTitle = document.querySelector('title');
      if (headTitle && p.title) {
        headTitle.textContent = p.title + ' | NAVI TOUR';
      }

      // 크럼브: 홈 > 나라(E) > 지역(F)
      var crumbEl = document.querySelector('.prod-hero .crumb');
      if (crumbEl) {
        var country = p.country || '';
        var region  = p.region  || '';
        crumbEl.textContent = '홈 > ' +
          (country || '테마기행') +
          (region ? ' > ' + region : '');
      }

      // 타이틀 / 서브타이틀
      var titleEl = document.querySelector('.prod-hero .title');
      if (titleEl && p.title) {
        titleEl.textContent = p.title;
      }
      var subtitleEl = document.querySelector('.prod-hero .subtitle');
      if (subtitleEl && p.summary) {
        subtitleEl.textContent = p.summary;
      }

      // 여행 기간 / 출발 가능 인원 / 테마 / 태그
      var dls = document.querySelectorAll('.prod-hero .info-grid dl');
      dls.forEach(function(dl){
        var dt = dl.querySelector('dt');
        var dd = dl.querySelector('dd');
        if (!dt || !dd) return;
        var label = dt.textContent.trim();

        if (label === '여행 기간') {
          dd.textContent = NaviProd.formatPeriod(p.nights, p.days);
        } else if (label === '출발 가능 인원') {
          if (p.minPax) {
            dd.textContent = '최소 ' + p.minPax + '인';
          } else {
            dd.textContent = '';
          }
        } else if (label === '테마') {
          dd.textContent = p.theme || '';
        } else if (label === '태그') {
          dd.textContent = p.tags || '';
        }
      });

      // 로케이션 (O열)
      var locEl = document.querySelector('.prod-hero .hero-location');
      if (locEl && p.location) {
        locEl.innerHTML = '<strong>로케이션</strong> ' + p.location;
      }

      // 가격 (S/T열: 최소/최대)
      var priceEl = document.querySelector('.price-box .price .num');
      if (priceEl) {
        var txt = NaviProd.formatPriceRange(p.priceMin, p.priceMax);
        if (txt) priceEl.textContent = txt;
      }

      // 상품 설명 / 답사지 (I / P)
      var descTexts = document.querySelectorAll('#desc .desc-card .desc-text');
      if (descTexts[0] && p.description) {
        descTexts[0].textContent = p.description;
      }
      if (descTexts[1] && p.sites) {
        descTexts[1].textContent = p.sites;
      }
    }

    NaviProd.getProductBySlug(sheetKey, slug)
      .then(function(p){
        if (!p) {
          console.warn('[ProdDetail] 슬러그에 해당하는 상품을 찾지 못함:', slug);
          return;
        }
        fillPage(p);
      })
      .catch(function(err){
        console.error('[ProdDetail] 시트 로드 / 파싱 오류', err);
      });
  })();

})();
