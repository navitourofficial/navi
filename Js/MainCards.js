// PATH: /Js/MainCards.js :: FULL REPLACE
(function () {
  const MAP = {
    all: '전체', sgando: '서간도의 길', bgando: '북간도의 길',
    gov: '임시정부의 발자취', fareast: '극동 연해주',
    jpn: '일본 독립운동', hawaii: '하와이 독립운동'
  };

  // 카테고리별 본문 상세(타이틀/리드/대표이미지)
  const DETAIL = {
    all: {
      title: '나비투어의 신조',
      lead: '\n나비투어는 단순한 관광이 아닌 과거의 시간 속에서 미래의 길을 찾는 여행입니다.\n 사적지와 관광지, 문학과 인물, 그리고 과거와 현재를 한 코스로 묶었습니다.\n전용 차량, 전문 해설사와 현지 가이드가 최고의 경험을 선물해 줍니다.',
      img: 'Image/Prod/2.png'
    },
    sgando: {
      title: '서간도의 길',
      lead: '압록강 너머 북쪽 일대, 오늘 날의 중국 길림성 서부 지역.\n‘지붕 없는 고구려 박물관’이라 불릴 만큼 유적과 서사가 빼곡한 땅입니다.\n명동학교와 신흥무관학교에서 이어진 ‘배움과 단련’의 정신으로 대표됩니다.\n또한 백두산권, 성곽과 산성, 사찰과 봉분 등 대규모 유산군이 곳곳에 남아 있어 \n학술·교육 여행지로도 가치가 높습니다.\n\n 나비투어는 이 공간의 연속적인 장면을 따라가며 과거의 의지와 오늘의 질문을 연결합니다.',
      img: 'Image/Prod/chn/sgando/0.png'
    },
    bgando: {
      title: '북간도의 길',
      lead: '북간도는 고조선·부여·고구려·발해의 옛 강역으로, 특히 부여와 발해 문화유산이\n집중된 우리 북방사의 핵심 무대입니다.\n수많은 독립운동가를 길러낸 민족교육의 요람이자 대한독립운동의 전장이자,\n자유를 향한 투쟁의 불씨가 꺼지지 않던 땅이었습니다.\n\n나비투어는 독립전쟁의 사건과 인물, 공간의 서사를 씨줄·날줄로 엮어 드립니다.\n현장에서 체감하는 냉철한 역사 인식과 뜨거운 민족의 열정은 우리의 가슴 속에 \n다시금 독립의 정신을 새기게 할 것입니다. ',
      img: 'Image/Prod/chn/bgando/0.png'
    },
    gov: {
      title: '임시정부의 발자취',
      lead: '대한민국 임시정부는 1919년 3·1운동 직후, 일제의 무단통치에 맞서 국가의 법통과 주권을 계승하기 위해 세워진 독립운동의 최고 기관이었습니다.\n 상하이에서 시작된 임시정부는 망명 정부이자 민주공화국의 시원으로서,\n ‘임시’라는 이름 아래에서도 국가의 형태와 정신을 온전히 지켜냈습니다.\n\n나비투어는 상하이에서 충칭까지 이어진 임정의 여정을 따라 민족의 이상과\n민주주의의 초석을 체험하며 현장에서 느끼는 국가의 시작, 독립의 정신은 오늘의\n우리에게 대한민국의 근원적 의미를 새롭게 일깨워줄 것입니다.',
      img: 'Image/Prod/chn/kpg/0.png'
    },
    fareast: {
      title: '극동 연해주',
      lead: '연해주는 러시아 극동의 블라디보스토크·우수리스크 일대를 중심으로 한 지역으로, 19세기 후반부터 간도·함경일대의 조선인이 이주해 정착하며 한인 공동체가 형성되었으며, 신한촌을 비롯해 대한국민의회 등 독립운동 단체가 활발히 활동했고, 이동휘를 비롯한 혁신적 지도자들의 사상과 조직 활동이 이곳에서 꽃피었습니다.\n \n나비투어는 블라디보스토크와 우수리스크 일대를 따라 이주·정착·연대·망명과 귀환의 이야기까지 시간의 흐름으로 엮어 드립니다.\n현장에서 마주하는 기록과 장소, 사람의 서사는 우리의 오늘을 비추는 또 하나의 거울이 될 것입니다.',
      img: 'Image/Prod/rus/yhaeju/1.png'
    },
    jpn: {
      title: '일본 독립운동',
      lead: '일본은 단순한 ‘타국’이 아닙니다. 조국의 독립을 꿈꾸던 청년들이 가장 먼저 부딪히고, 가장 치열하게 사상과 신념을 다듬었던현대 독립운동의 출발점이었습니다.\n이곳은 ‘저항이 태동한 땅’입니다. 1919년 2월 8일, 도쿄 조선기독교청년회관에서 울려 퍼진 2·8독립선언은 일제의 심장부 한가운데서 조선 청년들이 세계를 향해 던진 첫 외침이었습니다. 그 선언은 한 달 뒤 3·1운동으로 이어져 민족 전체를 깨우는 거대한 물결을 만들었습니다.\n\n나비투어는 도쿄의 2·8독립선언 터에서 히로시마 평화기념공원까지, 저항과 각성의 여정을 따라가는 사상과 실천의 루트입니다. 청년들의 결의, 그리고 평화를 향한 인류의 약속을 현장에서 직접 마주하며, 깨어 있는 역사 인식과 지속되는 독립정신을 다시금 우리의 마음에 새기게 될 것입니다. ',
      img: 'Image/Prod/jpn/tokyo/1.png'
    },
    hawaii: {
      title: '하와이 독립운동',
      lead: '하와이는 태평양 한가운데 자리한 낯선 섬이지만, 우리 민족에게는 가장 먼 곳에서 시작된 독립의 땅이었습니다. 1903년 첫 이민선이 도착한 이래, 사탕수수밭의 고된\n노동 속에서도 한인들은 서로를 의지하며 조국의 꿈을 잊지 않았습니다.\n하와이는 ‘바다 건너 깨어난 독립의 시작점’입니다. 안창호와 박용만을 비롯한 청년들은 이곳에서 학교를 세우고, 신문을 발간하며,대한인국민회를 중심으로 독립운동의 조직을 만들어갔습니다. 그들의 모금과 결의는 태평양을 건너 임시정부와 독립군에게 전달되었고, 하와이는 곧 ‘이민의 땅’을 넘어 민족운동의 전초기지가 되었습니다.\n\n나비투어는 사탕수수밭과 국민회관, 평화기념비를 잇는 여정 속에서 이민의 눈물과 독립의 불꽃을 함께 보여드립니다. 하와이는 단순한 남국의 섬이 아니라, 푸른 바다 위에서 피어난 조국의 혼을 느낄 수 있는 살아 있는 역사교육의 현장입니다.',
      img: 'Image/Prod/usa/hwaii/1.png'
    }
  };

  // 카드 DB
  const DB = {
    all: [
      item('중국·연변','4박 5일','독립 유적','북간도의 길: 용정·명동·왕청 라인','시베리아 횡단의 관문, 민족 교육의 심장',1290000,'Image/Product/sample-1.jpg',5),
      item('중국·길림','3박 4일','문학/탐방','서간도의 길: 통화·환인·집안','만주 벌판의 역사와 영웅 서사',990000,'Image/Product/sample-2.jpg',4),
      item('일본·도쿄','2박 3일','프리미엄 해설','일본 독립운동: 도쿄·요코하마 라인','공간에 남은 선언과 흔적을 읽다',1150000,'Image/Product/sample-3.jpg',5),
    ],
    sgando: [
      item('중국·길림','3박 4일','문학/탐방','서간도의 길: 통화·환인·집안','만주 벌판의 역사와 영웅 서사',990000,'Image/Prod/chn/sgando/1.png',4),
      item('중국·통화','2박 3일','역사/탐방','서간도 분기 루트','압록과 혼하, 성채와 요충지',890000,'Image/Prod/chn/sgando/2.png',4),
      item('중국·집안','3박 4일','프리미엄 해설','백두 남사면 라인','장군총과 집안 고분군 라이트 코스',1090000,'Image/Prod/chn/sgando/3.png',5),
      item('중국·환인','2박 3일','고고/유적','오녀산성 라인','고구려 시원 유적과 성채군 탐방',920000,'Image/Prod/chn/sgando/4.png',4),
      item('중국·집안','2박 3일','역사/탐방','압록강변 스토리','강과 성채, 국경의 시간 읽기',950000,'Image/Prod/chn/sgando/5.png',4),
    ],
    bgando: [
      item('중국·연변','4박 5일','독립 유적','북간도의 길: 용정·명동·왕청 라인','민족 교육의 심장',1290000,'Image/Prod/chn/bgando/1.png',5),
      item('중국·연길','3박 4일','문학/탐방','연길·도문 라인','국경의 기억과 철로의 시간',990000,'Image/Prod/chn/bgando/2.png',4),
      item('중국·용정','2박 3일','프리미엄 해설','명동촌 심화','학교·교회·기념관 집중 투어',1050000,'Image/Prod/chn/bgando/3.png',5),
      item('중국·왕청','3박 4일','역사/답사','왕청·용정 심층','산간 마을과 독립 네트워크',1120000,'Image/Prod/chn/bgando/4.png',4),
      item('중국·도문','2박 3일','역사/탐방','두만강변 라인','강과 철교, 이주의 흔적',930000,'Image/Prod/chn/bgando/5.png',4),
    ],
    gov: [
      item('중국·상하이','3박 4일','프리미엄 해설','임정 1기 상하이','임정 발족과 임시의정원',1190000,'Image/Prod/chn/kpg/1.png',5),
      item('중국·항저우','2박 3일','역사/탐방','임정 2기 항저우','망명지의 흔적을 잇다',990000,'Image/Prod/chn/kpg/2.png',4),
      item('중국·충칭','3박 4일','기록/답사','임정 3기 충칭','전시 수도의 시간',1290000,'Image/Prod/chn/kpg/3.png',5),
      item('중국·자싱','2박 3일','역사/탐방','항일 네트워크','교통·연락 거점의 기록',970000,'Image/Prod/chn/kpg/4.png',4),
      item('중국·난징','2박 3일','도시/답사','임시 루트','피난과 재건의 경로를 따라',1010000,'Image/Prod/chn/kpg/5.png',4),
    ],
    fareast: [
      item('러시아·블라디보스토크','3박 4일','독립 유적','연해주 항만 라인','한인촌과 항만의 기록',1190000,'Image/Prod/rus/yhaeju/1.png',5),
      item('러시아·우수리스크','2박 3일','역사/탐방','철도와 고려인','이주와 노동의 현장',920000,'Image/Prod/rus/yhaeju/2.png',4),
      item('러시아·하바롭스크','3박 4일','프리미엄 해설','아무르 라인','국경 도시들의 변천',1290000,'Image/Prod/rus/yhaeju/3.png',5),
      item('러시아·포시에트','2박 3일','역사/답사','연해안 소도시','항만과 정착의 흔적',880000,'Image/Prod/rus/yhaeju/4.png',4),
      item('러시아·스파스크달니','2박 3일','기록/답사','농업촌 라인','정착·이주의 생활사',900000,'Image/Prod/rus/yhaeju/5.png',4),
    ],
    jpn: [
      item('일본·도쿄','2박 3일','프리미엄 해설','도쿄·요코하마 라인','공간에 남은 선언과 흔적',1150000,'Image/Prod/jpn/tokyo/1.png',5),
      item('일본·교토','3박 4일','문학/탐방','교토 라인','사상과 저항의 발자취',1080000,'Image/Prod/jpn/tokyo/2.png',4),
      item('일본·오사카','2박 3일','역사/탐방','오사카 라인','항만·상업 도시의 네트워크',980000,'Image/Prod/jpn/tokyo/3.png',4),
      item('일본·후쿠오카','2박 3일','역사/탐방','규슈 라인','항만·학교·신문관 탐사',970000,'Image/Prod/jpn/tokyo/4.png',4),
      item('일본·요코하마','2박 3일','도시/답사','만국교와 항만','이민·무역의 경계에서',990000,'Image/Prod/jpn/tokyo/5.png',4),
    ],
    hawaii: [
      item('미국·하와이','4박 5일','프리미엄 해설','하와이 독립운동 라인','사탕수수 밭과 모금 네트워크',1790000,'Image/Prod/usa/hwaii/1.png',5),
      item('미국·오아후','3박 4일','역사/탐방','오아후 심화','이민사와 교육의 길',1590000,'Image/Prod/usa/hwaii/2.png',5),
      item('미국·마우이','3박 4일','기록/답사','마우이 라인','농장·교회·공동체',1490000,'Image/Prod/usa/hwaii/3.png',4),
      item('미국·하와이','2박 3일','역사/답사','호놀룰루 시내','청년회·학교·사적지',1380000,'Image/Prod/usa/hwaii/4.png',4),
      item('미국·하와이','3박 4일','도시/답사','빅아일랜드 라인','이민 초기 정착촌 기록',1550000,'Image/Prod/usa/hwaii/5.png',4),
    ],
  };

  function item(area, dur, theme, title, sub, price, img, stars) {
    return { area, dur, theme, title, sub, price, img, stars };
  }
  const fmt = n => '₩' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '~';

  // 히어로에서 호출
  window.setCategory = function (cat) {
    const key = (cat in MAP) ? cat : 'all';
    const url = new URL(location.href);
    url.searchParams.set('cat', key);
    history.pushState({ cat: key }, '', url);
    render(key);
  };

  // 초기화
  document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('navitour:main-loaded', boot);
  window.addEventListener('popstate', () => render(getCatFromURL()));

  function boot() {
    // 필요한 노드가 붙을 때까지 반복 확인
    const tick = () => {
      if (document.getElementById('cards-root') && document.getElementById('detail-title')) {
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

  function render(cat) {
    // 본문 상세 교체
    const d = DETAIL[cat] || DETAIL.all;
    const tEl = document.getElementById('detail-title');
    const pEl = document.getElementById('detail-lead');
    const ph  = document.getElementById('detail-figure-ph');

    if (tEl) tEl.textContent = d.title;
    // 줄바꿈: DETAIL.lead 안에 \n 넣으면 <br>로 바꿔서 표기
    if (pEl) pEl.innerHTML = (d.lead || '').replace(/\n/g, '<br>');
    if (ph)  ph.style.background =
      "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.18)), url('"+ d.img +"') center/cover no-repeat";

    // 카드 렌더
    const root = document.getElementById('cards-root');
    if (root) {
      const list = (cat === 'all') ? DB.all : (DB[cat] || DB.all);
      root.innerHTML = list.map(renderCard).join('');
    }

    // 칩 동기화
    document.querySelectorAll('.chiprail .chip')
      .forEach(c => c.classList.toggle('is-active', c.dataset && c.dataset.cat === cat));
  }

  function renderCard(d) {
    return `
    <article class="card">
      <div class="thumb" aria-hidden="true" style="--img:url('${d.img}')"></div>
      <div class="body">
        <div class="meta"><span>${d.area}</span><span>${d.dur}</span><span>${d.theme}</span></div>
        <h3 class="title">${d.title}</h3>
        <p class="subtitle">${d.sub}</p>
        <div class="row">
          <div class="stars">${'★'.repeat(d.stars)}${'☆'.repeat(5 - d.stars)}</div>
          <div class="price"><b>${fmt(d.price)}</b></div>
        </div>
      </div>
    </article>`;
  }

  /* 카드 썸네일 보정: 좌상단만 보이던 문제 해결 */
  const style = document.createElement('style');
  style.textContent = `
    .card .thumb{ position:relative }
    .card .thumb::before{
      content:"";
      display:block;
      width:100%;
      aspect-ratio:16 / 9;
      background:
        linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.18)),
        var(--img, none) !important;
      background-position: center, center !important;
      background-size: auto, cover !important;
      background-repeat: no-repeat, no-repeat !important;
    }
  `;
  document.head.appendChild(style);
})();
