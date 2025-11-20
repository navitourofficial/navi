/* NAVI TOUR – 상품 목록 통합 로더 (Google Sheets + 템플릿 박스 + 카드) */

(function () {
  'use strict';

  /* -------------------------------------------------------
     0. 행 템플릿 로더 (Prod/Prod_List_Box.html)  [테이블 전용]
  ------------------------------------------------------- */
  var ROW_TPL_MAIN = null;
  var ROW_TPL_DETAIL = null;
  var tplReadyPromise = null;

  function ensureRowTemplates() {
    if (ROW_TPL_MAIN && ROW_TPL_DETAIL) return Promise.resolve();
    if (tplReadyPromise) return tplReadyPromise;

    tplReadyPromise = fetch('Prod/Prod_List_Box.html', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        var styleEl = doc.querySelector('style');
        if (styleEl) {
          document.head.appendChild(styleEl.cloneNode(true));
        }

        ROW_TPL_MAIN   = doc.getElementById('prod-row-main');
        ROW_TPL_DETAIL = doc.getElementById('prod-row-detail');

        if (!ROW_TPL_MAIN || !ROW_TPL_DETAIL) {
          console.warn('[ProductSheetLoader] Prod_List_Box 템플릿을 찾을 수 없음');
        }
      })
      .catch(function (err) {
        console.error('[ProductSheetLoader] Prod_List_Box 로드 실패', err);
      });

    return tplReadyPromise;
  }

  /* -------------------------------------------------------
     1. 시트 매핑
  ------------------------------------------------------- */
  const SHEETS = {
    china:  { sheetId: '17Z5OB9O4YkZKPt8MHqStg5Lza-YbJs62lFxSx6yHPUY', gid: '501923866' },   // 중국
    japan:  { sheetId: '17Z5OB9O4YkZKPt8MHqStg5Lza-YbJs62lFxSx6yHPUY', gid: '1943415422' },  // 일본
    russia: { sheetId: '17Z5OB9O4YkZKPt8MHqStg5Lza-YbJs62lFxSx6yHPUY', gid: '301678335' },   // 러시아
    usa:    { sheetId: '17Z5OB9O4YkZKPt8MHqStg5Lza-YbJs62lFxSx6yHPUY', gid: '377063282' }    // 미국
  };

  /* -------------------------------------------------------
     2. 컬럼 인덱스 (0부터 시작)
     - A=0, B=1, ... Y=24, Z=25
  ------------------------------------------------------- */
  const COL = {
    slug:        1,   // B: SLUG
    regions:     4,   // E: regions (서간도/북간도/임시정부 등 포함)
    title:       5,   // F: title
    summary:     6,   // G: summary (간략설명)
    description: 7,   // H: description (장문설명)
    nights:      8,   // I: nights
    days:        9,   // J: days
    price:      10,   // K: price
    minPax:     11,   // L: minPax
    theme:      12,   // M: themes
    route:      14,   // O: 시작 경로
    finishroute:15,   // P: 마감 경로
    location:   16,   // Q: 로케이션
    release:    23,   // X: release (OPEN / CLOSE)
    priority:   24,   // Y: 우선순위
    image:      25    // Z: 이미지 경로
  };

  // 시트 캐시 (속도용)
  const TABLE_CACHE = new Map();

  function getCell(cells, idx) {
    if (idx == null || idx < 0) return '';
    const cell = cells[idx];
    if (!cell) return '';
    return cell.v != null ? cell.v : '';
  }

  /* -------------------------------------------------------
     3. Google Sheets(gviz)에서 테이블 가져오기 + 캐시
  ------------------------------------------------------- */
  async function fetchTable(sheetKey) {
    if (TABLE_CACHE.has(sheetKey)) {
      return TABLE_CACHE.get(sheetKey);
    }

    const conf = SHEETS[sheetKey];
    if (!conf) {
      console.warn('[ProductSheetLoader] 정의되지 않은 sheetKey:', sheetKey);
      return null;
    }

    const url =
      'https://docs.google.com/spreadsheets/d/' +
      conf.sheetId +
      '/gviz/tq?tqx=out:json&gid=' +
      conf.gid;

    const res = await fetch(url, { cache: 'no-store' });
    const txt = await res.text();

    const json = JSON.parse(txt.substring(47).slice(0, -2));
    const table = json.table;
    TABLE_CACHE.set(sheetKey, table);
    return table;
  }

  /* -------------------------------------------------------
     4. 테이블 -> 상품 배열로 정리
  ------------------------------------------------------- */
  function extractProducts(table, regionKeyword) {
    if (!table) return [];

    const rows = table.rows || [];
    const keyword = (regionKeyword || '').trim();
    const useKeyword = keyword.length > 0;

    const products = rows
      .map(function (row) {
        const c = row.c || [];
        return {
          slug:        getCell(c, COL.slug),
          region:      getCell(c, COL.regions),
          title:       getCell(c, COL.title),
          summary:     getCell(c, COL.summary),
          description: getCell(c, COL.description),
          nights:      getCell(c, COL.nights),
          days:        getCell(c, COL.days),
          price:       getCell(c, COL.price),
          minPax:      getCell(c, COL.minPax),
          theme:       getCell(c, COL.theme),
          route:      getCell(c, COL.route),
          finishroute: getCell(c, COL.finishroute),
          location:    getCell(c, COL.location),
          release:     String(getCell(c, COL.release)).trim().toUpperCase(),
          priority:    Number(getCell(c, COL.priority) || 9999),
          image:       getCell(c, COL.image)
        };
      })
      .filter(function (p) {
        if (!p.title) return false;
        if (p.release !== 'OPEN') return false;
        if (useKeyword) {
          if (!p.region) return false;
          if (String(p.region).indexOf(keyword) === -1) return false;
        }
        return true;
      })
      .sort(function (a, b) {
        return a.priority - b.priority;
      });

    return products;
  }

  /* -------------------------------------------------------
     5. 출력용 포맷 & 링크
  ------------------------------------------------------- */
  function formatPrice(value) {
    if (value == null || value === '') return '';
    var num = Number(value);
    if (isFinite(num)) {
      return num.toLocaleString('ko-KR') + '원 ~';
    }
    return String(value);
  }

  function buildDetailHref(slug) {
    if (!slug) return '#';
    return 'product/' + encodeURIComponent(slug) + '.html';
  }

  /* -------------------------------------------------------
     6. 테이블 tbody 채우기 (템플릿 기반)  [기존 리스트 페이지용]
  ------------------------------------------------------- */
  function renderProducts(mountEl, products) {
    var tbody = mountEl.querySelector('table tbody');

    if (!tbody) {
      var tpl = document.getElementById('product-list');
      if (!tpl) {
        console.warn('[ProductSheetLoader] product-list 템플릿을 찾을 수 없음 (Card/..._prod.html 로드 실패 가능)');
        return;
      }
      var frag = tpl.content.cloneNode(true);
      mountEl.appendChild(frag);
      tbody = mountEl.querySelector('table tbody');
      if (!tbody) {
        console.warn('[ProductSheetLoader] tbody 생성 실패');
        return;
      }
    }

    // ★ 행 템플릿이 없으면 여기서 바로 종료
    if (!ROW_TPL_MAIN || !ROW_TPL_DETAIL) {
      console.warn('[ProductSheetLoader] Prod_List_Box 템플릿을 찾을 수 없음 (Prod/Prod_List_Box.html 경로/대소문자 확인)');
      tbody.innerHTML =
        '<tr><td colspan="5" style="padding:14px 12px; text-align:center; color:#999; font-size:.9rem;">' +
        '상품 행 템플릿(Prod/Prod_List_Box.html)을 불러오지 못했습니다.' +
        '</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    if (!products.length) {
      var emptyTr = document.createElement('tr');
      emptyTr.innerHTML =
        '<td colspan="5" style="padding:14px 12px; text-align:center; color:#999; font-size:.9rem;">' +
        '준비 중인 상품입니다.' +
        '</td>';
      tbody.appendChild(emptyTr);
      return;
    }

    products.forEach(function (p) {
      var mainTr   = ROW_TPL_MAIN.content.firstElementChild.cloneNode(true);
      var detailTr = ROW_TPL_DETAIL.content.firstElementChild.cloneNode(true);

      var titleEl   = mainTr.querySelector('.prod-title');
      var summaryEl = mainTr.querySelector('.prod-summary');
      var termEl    = mainTr.querySelector('.prod-term');
      var priceEl   = mainTr.querySelector('.prod-price');
      var themeEl   = mainTr.querySelector('.prod-theme');
      var btn       = mainTr.querySelector('.pd-detail-toggle');

      if (titleEl)   titleEl.textContent   = p.title || '';

      if (summaryEl) {
        if (p.summary) summaryEl.textContent = p.summary;
        else summaryEl.remove();
      }

      var nightsTxt = p.nights ? p.nights + '박' : '';
      var daysTxt   = p.days   ? ' ' + p.days + '일' : '';
      var termLabel = (nightsTxt || daysTxt) ? (nightsTxt + daysTxt) : '일정 협의';
      if (termEl) termEl.textContent = termLabel;

      if (priceEl) priceEl.textContent = formatPrice(p.price);
      if (themeEl) themeEl.textContent = p.theme || '';

      var descP   = detailTr.querySelector('.prod-desc');
      var metaP   = detailTr.querySelector('.prod-meta');
      var locP    = detailTr.querySelector('.prod-location');
      var linkEl  = detailTr.querySelector('.prod-detail-link');

      if (descP) {
        if (p.description) descP.textContent = p.description;
        else descP.remove();
      }

      if (metaP) {
        var parts = [];
        if (p.minPax) {
          parts.push('출발 인원: ' + p.minPax + '명 이상');
        }
        if (p.route || p.finishroute) {
          if (p.route && p.finishroute) {
            parts.push('코스: ' + p.route + ' → ' + p.finishroute);
          } else {
            parts.push('코스: ' + (p.route || p.finishroute));
          }
        }
        if (parts.length) metaP.textContent = parts.join('   ·   ');
        else metaP.remove();
      }

      if (locP) {
        if (p.location) locP.textContent = '주요 방문지: ' + p.location;
        else locP.remove();
      }

      if (linkEl) {
        if (p.slug) linkEl.href = buildDetailHref(p.slug);
        else linkEl.remove();
      }

      if (btn) {
        btn.addEventListener('click', function () {
          var isOpen = detailTr.style.display === 'table-row';
          detailTr.style.display = isOpen ? 'none' : 'table-row';
        });
      }

      tbody.appendChild(mainTr);
      tbody.appendChild(detailTr);
    });
  }

  /* -------------------------------------------------------
     7. 테이블 슬롯 초기화 (data-product-sheet / data-product-region)
  ------------------------------------------------------- */
  async function initTables() {
    await ensureRowTemplates();

    var slots = Array.prototype.slice.call(
      document.querySelectorAll(
        '[data-product-sheet][data-product-region]'
      )
    );
    if (!slots.length) return;

    var bySheet = new Map();
    slots.forEach(function (el) {
      var key = el.dataset.productSheet;
      if (!bySheet.has(key)) bySheet.set(key, []);
      bySheet.get(key).push(el);
    });

    for (var entry of bySheet.entries()) {
      var sheetKey = entry[0];
      var elements = entry[1];

      var table = null;
      try {
        table = await fetchTable(sheetKey);
      } catch (err) {
        console.error(
          '[ProductSheetLoader] 시트 불러오기 실패:',
          sheetKey,
          err
        );
        continue;
      }

      elements.forEach(function (el) {
        var regionKey = el.dataset.productRegion || '';
        var products = extractProducts(table, regionKey);
        renderProducts(el, products);
      });
    }
  }

  /* -------------------------------------------------------
     8. 카드 모드: Main_Card.html 안의 data-product-cards 슬롯 처리
        - 메인페이지 카테고리별 필터링 포함
  ------------------------------------------------------- */

  // 카테고리 → 시트/필터 매핑
  const CAT_CARD_CONFIG = {
    sgando: { sheets: ['china'],  region: '서간도'   },
    bgando: { sheets: ['china'],  region: '북간도'   },
    gov:    { sheets: ['china'],  region: '임시정부' },
    jpn:    { sheets: ['japan'],  region: ''        },
    fareast:{ sheets: ['russia'], region: ''        },
    hawaii: { sheets: ['usa'],    region: ''        }
  };

  // ★ 여기서 카드 HTML을 Main_Card.css 구조에 맞춰 생성
  function buildCardHTML(p) {
    var nightsTxt = p.nights ? p.nights + '박' : '';
    var daysTxt   = p.days   ? ' ' + p.days + '일' : '';
    var termOnly  = (nightsTxt || daysTxt) ? (nightsTxt + daysTxt) : '';
    var termText;

    if (p.region && termOnly) termText = p.region + ' · ' + termOnly;
    else if (p.region)        termText = p.region;
    else                      termText = termOnly;

    // 로케이션 → tags/tag 스타일
    var locBlock = '';
    if (p.location) {
      locBlock =
        '<div class="tags">' +
          '<span class="tag">' +
            '<i class="fa-solid fa-location-dot"></i>' +
            '주요 방문지: ' + p.location +
          '</span>' +
        '</div>';
    }

    var imgSrc = p.image || 'https://placehold.co/640x400/111111/ffffff?text=NAVI+TOUR';
    var detailHref = p.slug ? buildDetailHref(p.slug) : '#';

    return ''
      + '<article class="card">'
      + '  <div class="thumb">'
      + '    <img src="' + imgSrc + '" alt="상품 이미지"/>'
      + '  </div>'
      + '  <div class="body">'
      + '    <h3>' + (p.title || '') + '</h3>'
      +      (p.summary ? '    <p>' + p.summary + '</p>' : '')
      +        locBlock
      + '    <div class="actions">'
      + '      <div class="actions-term">' + (termText || '') + '</div>'
      + '      <div class="actions-buttons">'
      + '        <a class="btn-ghost" href="' + detailHref + '">상세 보기</a>'
      + '        <a class="btn-main" href="support/reception.html">예약 문의</a>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</article>';
  }

  function renderProductCards(slot, products) {
    if (!products || !products.length) {
      slot.innerHTML =
        '<div class="card-empty" style="padding:24px 12px; text-align:center; color:#999; font-size:.9rem;">준비 중인 상품입니다.</div>';
      return;
    }
    slot.innerHTML = products.map(buildCardHTML).join('');
  }

  // root: 카드 컨테이너 루트, catKey: 메인 카테고리 키(없으면 generic)
  async function initCardSlots(root, catKey) {
    var base = root || document;
    var slots = Array.prototype.slice.call(
      base.querySelectorAll('[data-product-cards]')
    );
    if (!slots.length) return;

    // 메인페이지 카테고리 모드
    var cfg = catKey && CAT_CARD_CONFIG[catKey];

    if (cfg) {
      for (var i = 0; i < slots.length; i++) {
        var el = slots[i];
        var allProducts = [];

        for (var j = 0; j < cfg.sheets.length; j++) {
          var sheetKey = cfg.sheets[j];
          var table;
          try {
            table = await fetchTable(sheetKey);
          } catch (err) {
            console.error('[ProductSheetLoader] 카드용 시트 불러오기 실패:', sheetKey, err);
            continue;
          }
          var prods = extractProducts(table, cfg.region || '');
          allProducts = allProducts.concat(prods);
        }

        allProducts.sort(function (a, b) {
          return a.priority - b.priority;
        });

        renderProductCards(el, allProducts);
      }
      return;
    }

    // generic 모드 (다른 페이지에서 data-product-cards 직접 사용)
    var sheetTables = new Map();

    async function getTableLocal(sheetKey) {
      if (sheetTables.has(sheetKey)) return sheetTables.get(sheetKey);
      var t = await fetchTable(sheetKey);
      sheetTables.set(sheetKey, t);
      return t;
    }

    for (var i2 = 0; i2 < slots.length; i2++) {
      var el2 = slots[i2];
      var raw = el2.dataset.productCards || '';
      var keys = raw.split(',').map(function (k) { return k.trim(); }).filter(Boolean);
      if (!keys.length) continue;

      var regionKey = el2.dataset.productRegion || '';
      var all = [];

      for (var j2 = 0; j2 < keys.length; j2++) {
        var sk = keys[j2];
        var t2;
        try {
          t2 = await getTableLocal(sk);
        } catch (err2) {
          console.error('[ProductSheetLoader] 카드용(일반) 시트 불러오기 실패:', sk, err2);
          continue;
        }
        var ps = extractProducts(t2, regionKey);
        all = all.concat(ps);
      }

      all.sort(function (a, b) {
        return a.priority - b.priority;
      });

      renderProductCards(el2, all);
    }
  }

  /* -------------------------------------------------------
     9. 초기 실행 + 메인 페이지용 커스텀 이벤트 연결
  ------------------------------------------------------- */

  function prewarmSheets() {
    Object.keys(SHEETS).forEach(function (key) {
      fetchTable(key).catch(function(){});
    });
  }

  function bootAll(rootForCards) {
    prewarmSheets();
    initTables();
    initCardSlots(rootForCards);
  }

  // ★ 항상 DOMContentLoaded 이후 실행: RouteDetail에서 템플릿 먼저 주입 후 작동
  document.addEventListener('DOMContentLoaded', function () {
    bootAll();
  });

  // Main_Cards.js에서 카드 컨테이너가 새로 mount될 때마다
  document.addEventListener('navitour:cards-container-mounted', function (e) {
    var root = e && e.detail && e.detail.root;
    var cat  = e && e.detail && e.detail.cat;
    initCardSlots(root, cat);
  });
})();
