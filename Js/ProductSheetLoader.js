/* PATH: /Js/ProductSheetLoader.js :: FULL REPLACE */
/* NAVI TOUR – 상품 목록 통합 로더 (Google Sheets + 템플릿 박스 + 카드)
   - 시트 구조(열) 최신 버전 반영
   - 상세 페이지에서도 재사용 가능한 공용 API(NaviProd) 제공
*/

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
    china:  { sheetId: '1mdnUo2a3si0WXSQhHDq2oXO2FUNdBXJ-WbHJX7Hc9G4', gid: '251415080' },   // 중국
    japan:  { sheetId: '1mdnUo2a3si0WXSQhHDq2oXO2FUNdBXJ-WbHJX7Hc9G4', gid: '1959739503' },  // 일본
    russia: { sheetId: '1mdnUo2a3si0WXSQhHDq2oXO2FUNdBXJ-WbHJX7Hc9G4', gid: '1699478111' },  // 러시아
    usa:    { sheetId: '1mdnUo2a3si0WXSQhHDq2oXO2FUNdBXJ-WbHJX7Hc9G4', gid: '637057816' }    // 미국
    // 국내 시트 쓰면 여기 추가
  };

  /* -------------------------------------------------------
     2. 컬럼 인덱스
  ------------------------------------------------------- */
  const COL = {
    release:     0,   // A
    priority:    1,   // B
    image:       2,   // C: thumb
    address:     3,   // D: address (상세페이지 주소)

    slug:        4,   // E
    country:     5,   // F
    region:      6,   // G
    title:       7,   // H
    summary:     8,   // I
    description: 9,   // J
    nights:     10,   // K
    days:       11,   // L
    minPax:     12,   // M
    route:      13,   // N
    finishroute:14,   // O
    location:   15,   // P
    sites:      16,   // Q: 답사지
    theme:      17,   // R
    tags:       18,   // S

    price:      19,   // T: priceMin
    priceMin:   19,   // T
    priceMax:   20    // U
  };

  const TABLE_CACHE = new Map();

  function getCell(cells, idx) {
    if (idx == null || idx < 0) return '';
    const cell = cells[idx];
    if (!cell) return '';
    return cell.v != null ? cell.v : '';
  }

  /* -------------------------------------------------------
     3. Google Sheets(gviz)
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
     4. 행 → 상품 객체
  ------------------------------------------------------- */
  function mapRowToProduct(row) {
    const c = (row && row.c) ? row.c : [];
    return {
      slug:        getCell(c, COL.slug),
      country:     getCell(c, COL.country),
      region:      getCell(c, COL.region),
      title:       getCell(c, COL.title),
      summary:     getCell(c, COL.summary),
      description: getCell(c, COL.description),
      nights:      getCell(c, COL.nights),
      days:        getCell(c, COL.days),
      price:       getCell(c, COL.price),
      priceMin:    getCell(c, COL.priceMin),
      priceMax:    getCell(c, COL.priceMax),
      minPax:      getCell(c, COL.minPax),
      theme:       getCell(c, COL.theme),
      tags:        getCell(c, COL.tags),
      route:       getCell(c, COL.route),
      finishroute: getCell(c, COL.finishroute),
      location:    getCell(c, COL.location),
      sites:       getCell(c, COL.sites),
      address:     getCell(c, COL.address),
      release:     String(getCell(c, COL.release)).trim().toUpperCase(),
      priority:    Number(getCell(c, COL.priority) || 9999),
      image:       getCell(c, COL.image)
    };
  }

  /* -------------------------------------------------------
     5. 필터링
  ------------------------------------------------------- */
  function extractProducts(table, regionKeyword) {
    if (!table) return [];

    const rows = table.rows || [];
    const keyword = (regionKeyword || '').trim();
    const useKeyword = keyword.length > 0;

    const products = rows
      .map(mapRowToProduct)
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
     6. 포맷 유틸
  ------------------------------------------------------- */
  function formatPrice(value) {
    if (value == null || value === '') return '';
    var num = Number(value);
    if (isFinite(num)) {
      return num.toLocaleString('ko-KR') + '원 ~';
    }
    return String(value);
  }

  function formatKRW(val) {
    if (val == null || val === '') return '';
    var num = Number(val);
    if (!isFinite(num)) return '';
    return '₩ ' + num.toLocaleString('ko-KR');
  }

  function formatPriceRange(min, max) {
    var hasMin = min != null && min !== '';
    var hasMax = max != null && max !== '';
    if (!hasMin && !hasMax) return '';
    if (hasMin && hasMax) {
      return formatKRW(min) + ' ~ ' + formatKRW(max);
    }
    if (hasMin) return formatKRW(min);
    return formatKRW(max);
  }

  function formatPeriod(nights, days) {
    var n = nights != null && nights !== '' ? Number(nights) : null;
    var d = days   != null && days   !== '' ? Number(days)   : null;
    var label = '';
    if (isFinite(n) && n > 0) label += n + '박';
    if (isFinite(d) && d > 0) {
      label += (label ? ' ' : '') + d + '일';
    }
    if (!label) label = '일정 협의';
    return label;
  }

  function buildDetailHref(slug) {
    if (!slug) return '#';
    return 'product/' + encodeURIComponent(slug) + '.html';
  }

  function formatKRWPlain(val) {
    if (val == null || val === '') return '';
    var num = Number(val);
    if (!isFinite(num)) return '';
    return num.toLocaleString('ko-KR') + '원';
  }

  function splitTags(raw) {
    if (!raw) return [];
    return String(raw)
      .split(/[,\s#/]+/)
      .map(function (t) { return t.trim(); })
      .filter(Boolean);
  }

  // 답사지: 쉼표 기준으로만 쪼갬 (공백/해시 사용 안 함)
  function splitSites(raw) {
    if (!raw) return [];
    return String(raw)
      .split(',')
      .map(function (t) { return t.trim(); })
      .filter(Boolean);
  }

  /* -------------------------------------------------------
     7. 리스트 렌더링
  ------------------------------------------------------- */
  function renderProducts(mountEl, products) {
    var tbody = mountEl.querySelector('table tbody');

    if (!tbody) {
      var tpl = document.getElementById('product-list');
      if (!tpl) {
        console.warn('[ProductSheetLoader] product-list 템플릿을 찾을 수 없음');
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
      if (!ROW_TPL_MAIN || !ROW_TPL_DETAIL) return;

      var mainTr   = ROW_TPL_MAIN.content.firstElementChild.cloneNode(true);
      var detailTr = ROW_TPL_DETAIL.content.firstElementChild.cloneNode(true);

      var titleEl    = mainTr.querySelector('.prod-title');
      var summaryEl  = mainTr.querySelector('.prod-summary');
      var termEl     = mainTr.querySelector('.prod-term');
      var priceEl    = mainTr.querySelector('.prod-price');
      var imgEl      = mainTr.querySelector('.prod-image');
      var tagsWrap   = mainTr.querySelector('.prod-tags');
      var sitesWrap  = mainTr.querySelector('.prod-sites');
      var btn        = mainTr.querySelector('.pd-detail-toggle');

      if (titleEl) titleEl.textContent = p.title || '';

      // 요약
      if (summaryEl) {
        if (p.summary) summaryEl.textContent = p.summary;
        else summaryEl.remove();
      }

      // 이미지
      if (imgEl) {
        if (p.image) {
          imgEl.src = p.image;
        } else {
          imgEl.src = 'https://placehold.co/600x600/cccccc/777777?text=NAVI+TOUR';
        }
      }

      // 기간
      var termLabel = formatPeriod(p.nights, p.days);
      if (termEl) termEl.textContent = termLabel;

      // 가격: 최소~최대
      if (priceEl) {
        var minVal   = p.priceMin || p.price;
        var maxVal   = p.priceMax;
        var minSpan  = priceEl.querySelector('.min');
        var midSpan  = priceEl.querySelector('.mid');
        var maxSpan  = priceEl.querySelector('.max');

        var minLabel = formatKRWPlain(minVal);
        var maxLabel = formatKRWPlain(maxVal);

        if (minSpan) minSpan.textContent = minLabel;
        if (midSpan) midSpan.textContent = (minLabel && maxLabel) ? '~' : '';
        if (maxSpan) maxSpan.textContent = maxLabel;

        if (!minSpan && !maxSpan) {
          if (minLabel && maxLabel) {
            priceEl.textContent = minLabel + ' ~ ' + maxLabel;
          } else {
            priceEl.textContent = minLabel || maxLabel || '';
          }
        }
      }

      // 테마 + 태그
      if (tagsWrap) {
        tagsWrap.innerHTML = '';
        if (p.theme) {
          var tSpan = document.createElement('span');
          tSpan.textContent = p.theme;
          tagsWrap.appendChild(tSpan);
        }
        var tagList = splitTags(p.tags);
        tagList.forEach(function (tag) {
          var s = document.createElement('span');
          s.textContent = '#' + tag;
          tagsWrap.appendChild(s);
        });
      }

      // 답사지 (Q열, 쉼표로 분리, 해시 없이 박스)
      if (sitesWrap) {
        sitesWrap.innerHTML = '';
        var siteList = splitSites(p.sites);
        if (siteList.length) {
          siteList.forEach(function (site) {
            var s = document.createElement('span');
            s.textContent = site;
            sitesWrap.appendChild(s);
          });
        } else {
          // 답사지 없으면 영역 숨김
          sitesWrap.style.display = 'none';
        }
      }

      // 디테일 데이터(화면에는 안 펼치지만 채워두기는 함)
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

      // 상세페이지 URL: D열 address 우선, 없으면 slug 기반
      var detailUrl = '';
      if (p.address) {
        detailUrl = p.address;
      } else if (p.slug) {
        detailUrl = buildDetailHref(p.slug);
      }

      if (linkEl) {
        if (detailUrl) {
          linkEl.href = detailUrl;
        } else {
          linkEl.remove();
        }
      }

      // 버튼: 상세페이지로 바로 이동
      if (btn) {
        if (detailUrl) {
          btn.addEventListener('click', function () {
            window.location.href = detailUrl;
          });
        } else {
          btn.disabled = true;
        }
      }

      tbody.appendChild(mainTr);
      // detailTr는 여전히 append하지만 display:none
      tbody.appendChild(detailTr);
    });
  }

  /* -------------------------------------------------------
     8. 테이블 슬롯 초기화
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
     9. 카드 모드
  ------------------------------------------------------- */
  const CAT_CARD_CONFIG = {
    sgando: { sheets: ['china'],  region: '서간도'   },
    bgando: { sheets: ['china'],  region: '북간도'   },
    gov:    { sheets: ['china'],  region: '임시정부' },
    jpn:    { sheets: ['japan'],  region: '도쿄'     },
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

    // 썸네일
    var imgSrc = p.image || 'https://placehold.co/640x400/111111/ffffff?text=NAVI+TOUR';

    // 상세페이지 링크: D열 address 우선, 없으면 slug 기반
    var detailHref = p.address || (p.slug ? buildDetailHref(p.slug) : '#');

    // 예약문의 페이지 (고정)
    var contactHref = 'Support/Contact.html';

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

  async function initCardSlots(root, catKey) {
    var base = root || document;
    var slots = Array.prototype.slice.call(
      base.querySelectorAll('[data-product-cards]')
    );
    if (!slots.length) return;

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
     10. 초기 실행
  ------------------------------------------------------- */
  function prewarmSheets() {
    Object.keys(SHEETS).forEach(function (key) {
      fetchTable(key).catch(function(){});
    });
  }

  function bootAll(rootForCards) {
    var hasTableSlots = document.querySelector('[data-product-sheet][data-product-region]');
    var hasCardSlots  = document.querySelector('[data-product-cards]');
    if (!hasTableSlots && !hasCardSlots) {
      return;
    }
    prewarmSheets();
    initTables();
    initCardSlots(rootForCards);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bootAll();
    });
  } else {
    bootAll();
  }

  document.addEventListener('navitour:cards-container-mounted', function (e) {
    var root = e && e.detail && e.detail.root;
    var cat  = e && e.detail && e.detail.cat;
    initCardSlots(root, cat);
  });

  /* -------------------------------------------------------
     11. 공용 API
  ------------------------------------------------------- */
  function findProductInTable(table, slug) {
    if (!table || !slug) return null;
    var rows = table.rows || [];
    var target = String(slug || '').trim();
    if (!target) return null;

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var c = row.c || [];
      var rowSlug = String(getCell(c, COL.slug) || '').trim();
      if (!rowSlug) continue;
      if (rowSlug === target) {
        return mapRowToProduct(row);
      }
    }
    return null;
  }

  async function getProductBySlug(sheetKey, slug) {
    var table = await fetchTable(sheetKey);
    if (!table) return null;
    return findProductInTable(table, slug);
  }

  window.NaviProd = window.NaviProd || {};
  window.NaviProd.SHEETS = SHEETS;
  window.NaviProd.COL = COL;
  window.NaviProd.getTable = fetchTable;
  window.NaviProd.extractProducts = extractProducts;
  window.NaviProd.getProductBySlug = getProductBySlug;
  window.NaviProd.findProductInTable = findProductInTable;
  window.NaviProd.formatPrice = formatPrice;
  window.NaviProd.formatPriceRange = formatPriceRange;
  window.NaviProd.formatPeriod = formatPeriod;

})();
