// PATH: /Js/MainCards.js :: FULL REPLACE

/* =======================================================================
   NAVI TOUR – 메인 상세 영역 + 외부 카드 레이아웃 로더
   (cat별 상세 텍스트 + Main_about.html / Main_Card.html 조각 로딩)
======================================================================= */

(function () {

  // 1. 카테고리 key ↔ 한글 라벨
  const MAP = {
    all: '전체',
    sgando: '서간도의 길',
    bgando: '북간도의 길',
    gov: '임시정부의 발자취',
    fareast: '극동 연해주의 길',
    jpn: '일본내 독립운동',
    hawaii: '하와이 독립운동'
  };

  // 1-1. 상세보기 링크 (네가 여기 href만 바꾸면 됨)
  const DETAIL_LINK = {
    sgando: 'Country/CHN/sgando.html',
    bgando: 'Country/CHN/bgando.html',
    gov: 'Country/CHN/KPG.html',
    jpn: 'Country/JPN/tokyo.html',
    fareast: 'Country/RUS/yhaeju.html',
    hawaii: 'Country/USA/hawaii.html'
  };

  // "전체" 전용 조각
  const ABOUT_URL = 'Main/Main_about.html';
  let ABOUT_HTML    = null;
  let ABOUT_LOADING = false;

  // 카드 레이아웃 조각(Main_Card.html)
  const CARD_URL = 'Main/Main_Card.html';
  let CARD_HTML    = null;
  let CARD_LOADING = false;
  let CARD_ASSET_APPLIED = false;

  // 상세 텍스트 데이터
  const DETAIL = {
    all: {
      title: '나비투어의 신조',
      lead: `
나비투어는 단순한 관광이 아닌 과거의 시간 속에서 미래의 길을 찾는 여행입니다.
사적지와 관광지, 문학과 인물, 그리고 과거와 현재를 한 코스로 묶었습니다.
전용 차량, 전문 해설사와 현지 가이드가 최고의 경험을 선물해 줍니다.
      `,
      img: 'Image/Prod/2.png'
    },
    sgando: {
      title: '서간도의 길',
      lead: `
압록강 너머 북쪽 일대, 오늘 날의 중국 길림성 서부 지역.
‘지붕 없는 고구려 박물관’이라 불릴 만큼 유적과 서사가 빼곡한 땅입니다.
명동학교와 신흥무관학교에서 이어진 ‘배움과 단련’의 정신으로 대표됩니다.
또한 백두산권, 성곽과 산성, 사찰과 봉분 등 대규모 유산군이 곳곳에 남아 있어
학술·교육 여행지로도 가치가 높습니다.

고구려는 약 700년에 걸쳐 동아시아를 호령한 문화 강국이었습니다. 정치·경제·군사적으로 강력했을 뿐 아니라, 평화를 주도하고 풍요로운 예술과 문화를 꽃피웠습니다. 오늘날 서간도 지역에는 세계적으로도 보기 드문 벽화고분, 1,500년 넘게 보존된 성곽과 산성, 정교한 무덤 건축기술 등 수많은 유적이 남아 있습니다.


나비투어의 ‘서간도의 길’은 잊혀가는 독립운동의 현장을 찾아가 “우리 민족의 현재를 성찰하고 미래를 꿈꾸는 여정”으로 안내합니다. 
역사와 사람, 장소가 어우러진 이 여행은 서간도 땅에서 다시 태어나는 우리 정신의 기록이 될 것입니다. 
      `,
      img: 'Image/Man/1.webp'
    },
    bgando: {
      title: '북간도의 길',
      lead: `
북간도는 고조선·부여·고구려·발해의 옛 강역으로, 특히 부여와 발해 문화유산이
집중된 우리 북방사의 핵심 무대입니다.
수많은 독립운동가를 길러낸 민족교육의 요람이자 대한독립운동의 전장이자,
자유를 향한 투쟁의 불씨가 꺼지지 않던 땅이었습니다.

이곳은 대한독립운동의 전장이자, 자유를 향한 투쟁의 불씨가 꺼지지 않던 땅이었습니다. 
이범윤과 안중근의 국내진공작전, 홍범도와 최진동이 이끈 봉오동전투, 김좌진·홍범도 연합군의 
청산리대첩, 지청천의 쌍성보·동경성·경박호·대전자령 전투가 모두 이 북간도 일대에서 벌어졌습니다. 
두만강을 건너와 마을을 이루었던 우리 민족은 이곳에서 학교와 교회, 협동 조직을 세우며 
독립운동의 기반을 다졌습니다. 이상설·이동녕의 서전서숙, 김약연의 명동학교, 이동휘의 길동학교는 
수많은 독립운동가를 길러낸 민족교육의 요람이었습니다. 

나비투어는 독립전쟁의 사건과 인물, 공간의 서사를 씨줄·날줄로 엮어 드립니다.
현장에서 체감하는 냉철한 역사 인식과 뜨거운 민족의 열정은 우리의 가슴 속에
다시금 독립의 정신을 새기게 될 것입니다.
      `,
      img: 'Image/Man/2.webp'
    },
    gov: {
      title: '임시정부의 발자취',
      lead: `
대한민국 임시정부는 1919년 3·1운동 직후, 일제의 무단통치에 맞서
국가의 법통과 주권을 계승하기 위해 세워진 독립운동의 최고 기관이었습니다.
상하이에서 시작된 임시정부는 망명 정부이자 민주공화국의 시원으로서,
‘임시’라는 이름 아래에서도 국가의 형태와 정신을 온전히 지켜냈습니다.
백범 김구를 중심으로 한 대한민국임시정부의 재건(1932~1945) 시기에는 
한국광복군 창설, 연합국과의 공조 외교, 대일선전포고 등 실질적인 전시정부로 발전했습니다. 
임정의 외교부·군무부·교통부는 각지의 독립단체를 하나로 모으고, 
임시의정원은 헌정 질서의 중심으로서 기능했습니다.

충칭 시절의 청사와 백범 김구·조소앙·김규식 등 임정 요인들의 거처는 지금도 그 시대의 긴박함과 
신념을 증언하는 살아있는 역사 현장입니다. 

나비투어는 상하이에서 충칭까지 이어진 임정의 여정을 따라 민족의 이상과
민주주의의 초석을 체험하게 합니다. 현장에서 느끼는 국가의 시작, 독립의 정신은
오늘의 우리에게 대한민국의 근원적 의미를 새롭게 일깨워줄 것입니다.
      `,
      img: 'Image/Man/3.webp'
    },
    fareast: {
      title: '극동 연해주의 길',
      lead: `
연해주는 러시아 극동의 블라디보스토크·우수리스크 일대를 중심으로 한 지역으로,
19세기 후반부터 간도·함경일대의 조선인이 이주해 정착하며 한인 공동체가 형성되었습니다.
신한촌을 비롯해 대한국민의회 등 독립운동 단체가 활발히 활동했고, 이동휘를 비롯한
혁신적 지도자들의 사상과 조직 활동이 이곳에서 꽃피었습니다.

또한 안중근 의사의 하얼빈 의거를 가능케 한 배후 거점 중 하나로 연해주가 기능했으며, 
권업신문과 같은 언론, 각종 학교·교회가 민족교육과 계몍의 토대가 되었습니다. 
1937년 소련의 강제이주 정책으로 다수의 고려인이 중앙아시아로 이주했지만, 
연해주의 기억과 흔적은 도시의 골목과 기념비, 박물관에 또렷이 남아 있습니다.

나비투어는 블라디보스토크와 우수리스크 일대를 따라
이주·정착·연대·망명과 귀환의 이야기까지 시간의 흐름으로 엮어 드립니다.
현장에서 마주하는 기록과 장소, 사람의 서사는
우리의 오늘을 비추는 또 하나의 거울이 될 것입니다.
      `,
      img: 'Image/Man/4.webp'
    },
    jpn: {
      title: '일본내 독립운동',
      lead: `
일본은 단순한 ‘타국’이 아닙니다. 조국의 독립을 꿈꾸던 청년들이 가장 먼저 부딪히고,
가장 치열하게 사상과 신념을 다듬었던 현대 독립운동의 출발점이었습니다.
이곳은 ‘저항이 태동한 땅’입니다. 1919년 2월 8일, 도쿄 조선기독교청년회관에서
울려 퍼진 2·8독립선언은 일제의 심장부 한가운데서 조선 청년들이 세계를 향해 던진 첫 외침이었습니다.
그 선언은 한 달 뒤 3·1운동으로 이어져 민족 전체를 깨우는 거대한 물결을 만들었습니다.

도쿄·교토·요코하마·오사카 등지에는 유학생과 지식인들이 결집한 항일 네트워크가 형성되었습니다. 
그들은 펜으로, 강연으로, 신앙과 문화운동으로 자유의 사상을 퍼뜨렸고, 많은 인물이 귀국 후 임시정부와 독립군의 주축이 되었습니다.

나비투어는 도쿄의 2·8독립선언 터에서 히로시마 평화기념공원까지,
저항과 각성의 여정을 따라가는 사상과 실천의 루트입니다.
청년들의 결의, 그리고 평화를 향한 인류의 약속을 현장에서 직접 마주하며,
깨어 있는 역사 인식과 지속되는 독립정신을 다시금 우리의 마음에 새기게 될 것입니다.
      `,
      img: 'Image/Man/5.webp'
    },
    hawaii: {
      title: '하와이 독립운동',
      lead: `
하와이는 태평양 한가운데 자리한 낯선 섬이지만,
우리 민족에게는 가장 먼 곳에서 시작된 독립의 땅이었습니다.
1903년 첫 이민선이 도착한 이래, 사탕수수밭의 고된 노동 속에서도
한인들은 서로를 의지하며 조국의 꿈을 잊지 않았습니다.

하와이는 ‘바다 건너 깨어난 독립의 시작점’입니다.
안창호와 박용만을 비롯한 청년들은 이곳에서 학교를 세우고, 신문을 발간하며,
대한인국민회를 중심으로 독립운동의 조직을 만들어갔습니다.
그들의 모금과 결의는 태평양을 건너 임시정부와 독립군에게 전달되었고,
하와이는 곧 ‘이민의 땅’을 넘어 민족운동의 전초기지가 되었습니다.

나비투어는 사탕수수밭과 국민회관, 평화기념비를 잇는 여정 속에서
이민의 눈물과 독립의 불꽃을 함께 보여드립니다.
하와이는 단순한 남국의 섬이 아니라, 푸른 바다 위에서 피어난 조국의 혼을 느낄 수 있는
살아 있는 역사교육의 현장입니다.
      `,
      img: 'Image/Man/6.webp'
    }
  };


  // Main_about 로더
  function loadAboutFragment(cb) {
    if (ABOUT_HTML !== null) {
      if (typeof cb === 'function') cb(ABOUT_HTML);
      return;
    }
    if (ABOUT_LOADING) return;
    ABOUT_LOADING = true;

    fetch(ABOUT_URL, { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        ABOUT_HTML = html;
        ABOUT_LOADING = false;
        if (typeof cb === 'function') cb(html);
      })
      .catch(err => {
        ABOUT_LOADING = false;
        console.error('[NAVI TOUR] Main_about load failed:', ABOUT_URL, err);
      });
  }

  // Main_Card 로더
  function loadCardFragment(cb) {
    if (CARD_HTML !== null) {
      if (typeof cb === 'function') cb(CARD_HTML);
      return;
    }
    if (CARD_LOADING) return;
    CARD_LOADING = true;

    fetch(CARD_URL, { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        CARD_HTML = html;
        CARD_LOADING = false;
        if (typeof cb === 'function') cb(html);
      })
      .catch(err => {
        CARD_LOADING = false;
        console.error('[NAVI TOUR] Main_Card load failed:', CARD_URL, err);
      });
  }

  // 카드 컨테이너 mount (카테고리 키 전달)
  function mountCardContainer(currentCat) {
    const root = document.getElementById('cards-root');
    if (!root) return;

    const apply = (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // CSS 자산은 한 번만 head에 주입
      if (!CARD_ASSET_APPLIED) {
        CARD_ASSET_APPLIED = true;
        doc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
          const tag = el.tagName.toLowerCase();
          if (tag === 'link') {
            let href = el.getAttribute('href');
            if (!href) return;

            // 조각 안에서는 Main_Card.css 로 되어 있으니 실제 경로로 보정
            if (href === 'Main_Card.css') {
              href = 'Main/Main_Card.css';
            }

            if (document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
          } else if (tag === 'style') {
            document.head.appendChild(el.cloneNode(true));
          }
        });
      }

      const container =
        doc.getElementById('list') ||
        doc.querySelector('.grid3') ||
        doc.body.firstElementChild;

      root.innerHTML = '';

      if (container) {
        root.appendChild(container.cloneNode(true));
      } else {
        const msg = document.createElement('div');
        msg.style.padding = '32px 12px';
        msg.style.textAlign = 'center';
        msg.style.color = '#999';
        msg.textContent = '카드 레이아웃을 불러오지 못했습니다.';
        root.appendChild(msg);
      }

      // 카드 컨테이너가 새로 붙었다는 신호 + 현재 카테고리
      document.dispatchEvent(new CustomEvent('navitour:cards-container-mounted', {
        detail: { root, cat: currentCat }
      }));
    };

    if (CARD_HTML !== null) {
      apply(CARD_HTML);
    } else {
      root.innerHTML = '';
      loadCardFragment(apply);
    }
  }

  // 외부에서 칩이 호출하는 API
  window.setCategory = function (cat) {
    const key = (cat in MAP) ? cat : 'all';
    const url = new URL(location.href);
    url.searchParams.set('cat', key);
    history.pushState({ cat: key }, '', url);
    render(key);
  };

  // 상세 CTA 버튼 이동
  function mountDetailCta(key) {
    const btn = document.getElementById('heroCta');
    if (!btn) return;

    if (key === 'all') {
      btn.style.display = 'none';
      return;
    }

    const lead = document.getElementById('detail-lead');
    if (!lead || !lead.parentElement) {
      btn.style.display = 'none';
      return;
    }

    const parent = lead.parentElement;
    if (parent !== btn.parentElement) {
      parent.appendChild(btn);
    }
    btn.classList.add('detail-cta');
    btn.style.display = '';
  }

  // 이미지 안 "상세 보기" 버튼 생성/업데이트
  function updateImageCta(key) {
    const ph = document.getElementById('detail-figure-ph');
    if (!ph) return;

    let btn = ph.querySelector('.detail-img-cta');

    // all 카테고리는 버튼 감추기
    if (key === 'all') {
      if (btn) btn.style.display = 'none';
      return;
    }

    const href = DETAIL_LINK[key] || '#';

    if (!btn) {
      btn = document.createElement('a');
      btn.className = 'detail-img-cta';
      btn.textContent = '상세 보기';
      btn.setAttribute('role', 'button');
      ph.appendChild(btn);
    }

    btn.href = href;
    btn.style.display = '';
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('navitour:main-loaded', boot);
  window.addEventListener('popstate', () => render(getCatFromURL()));

  function boot() {
    const tick = () => {
      if (document.getElementById('cards-root') &&
          document.getElementById('detail-title')) {
        render(getCatFromURL());
      } else {
        setTimeout(tick, 50);
      }
    };
    tick();
  }

  function getCatFromURL() {
    return new URLSearchParams(location.search).get('cat') || 'all';
  }

  // 렌더
  function render(cat) {
    const key = (cat in MAP) ? cat : 'all';

    const tEl  = document.getElementById('detail-title');
    const pEl  = document.getElementById('detail-lead');
    const ph   = document.getElementById('detail-figure-ph');
    const root = document.getElementById('cards-root');

    mountDetailCta(key);

    // 전체: Main_about 사용
    if (key === 'all') {
      if (tEl) tEl.textContent = '';
      if (pEl) pEl.innerHTML = '';
      if (ph)  ph.style.background = 'none';

      const detailWrap = tEl && tEl.closest ? tEl.closest('.detail-section') : null;
      if (detailWrap) detailWrap.style.display = 'none';

      if (root) {
        if (ABOUT_HTML !== null) {
          root.innerHTML = ABOUT_HTML;
        } else {
          root.innerHTML = '';
          loadAboutFragment(function (html) {
            if (getCatFromURL() === 'all') {
              const againRoot = document.getElementById('cards-root');
              if (againRoot) againRoot.innerHTML = html;
            }
          });
        }
      }

      document.querySelectorAll('.chiprail .chip')
        .forEach(c => c.classList.toggle('is-active', c.dataset && c.dataset.cat === 'all'));

      // 이미지 CTA도 같이 감추기
      updateImageCta('all');

      return;
    }

    // 개별 카테고리
    const detailWrap = tEl && tEl.closest ? tEl.closest('.detail-section') : null;
    if (detailWrap) detailWrap.style.display = '';

    const d = DETAIL[key] || DETAIL.all;

    if (tEl) tEl.textContent = d.title;
    if (pEl) pEl.innerHTML = (d.lead || '').replace(/\n/g, '<br>');

    if (ph) {
      ph.style.background =
        "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.18)), url('" +
        d.img +
        "') center/cover no-repeat";
    }

    // 이미지 안 CTA 버튼 업데이트
    updateImageCta(key);

    if (root) {
      // 카드 컨테이너 mount + 현재 카테고리 전달
      mountCardContainer(key);
    }

    document.querySelectorAll('.chiprail .chip')
      .forEach(c => c.classList.toggle('is-active', c.dataset && c.dataset.cat === key));
  }

  // 상세 CTA + 이미지 CTA 스타일 주입
  const style = document.createElement('style');
  style.textContent = `
    .detail-cta{
      margin-top:24px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:10px;
      padding:12px 20px;
      border-radius:10px;
      font-weight:800;
      letter-spacing:.2px;
      background:linear-gradient(
        180deg,
        var(--cta1, #D7BB83),
        var(--cta2, #C3A36A)
      );
      color:#22170A;
      text-decoration:none;
      box-shadow:0 8px 18px rgba(201,168,106,.25);
      white-space:nowrap;
      align-self:flex-end;
    }
    .detail-cta:focus-visible{
      outline:2px solid rgba(255,255,255,.9);
      outline-offset:2px;
    }

    /* 이미지 안 상세보기 버튼 */
    #detail-figure-ph{
      position:relative;
    }
    .detail-img-cta{
      position:absolute;
      left:50%;
      bottom:20px;
      transform:translateX(-50%);
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:10px 18px;
      border-radius:10px;
      font-size:.9rem;
      font-weight:700;
      letter-spacing:.04em;
      background:rgba(10,12,18,.88);
      color:#F9F5E9;
      text-decoration:none;
      box-shadow:0 10px 25px rgba(0,0,0,.45);
      backdrop-filter:blur(10px);
      -webkit-backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,.15);
      cursor:pointer;
      white-space:nowrap;
    }
    .detail-img-cta:hover{
      background:rgba(98, 105, 104, 0.92);
      color:#FDFCF8;
      transform:translateX(-50%) translateY(-1px);
      box-shadow:0 14px 30px rgba(0,0,0,.55);
    }
    .detail-img-cta:focus-visible{
      outline:2px solid rgba(255,255,255,.9);
      outline-offset:3px;
    }
  `;
  document.head.appendChild(style);
})();
