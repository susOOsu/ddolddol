/* ==========================================================
   노똘똘의 견생일지 — script.js
   순서: 공통 값 → 인트로 → 눈 깜빡임 → 이미지 커서 → 헤더·메뉴
         → 스크롤 등장 효과 → Holiday → 함께한 시간 패널 → Log → Dear똘
   ========================================================== */


/* ---------- 공통 값 ---------- */
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------- 인트로 : 큼직한 사진이 하나씩 등장 → 쓩 날아감 → 페이지 시작 ---------- */
function initIntro() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  let intro = document.getElementById('intro');

  // 움직임 줄이기 설정이거나 #주소로 들어오면 인트로 없이 바로 시작
  if (reduceMotion || location.hash) {
    intro.remove();
    intro = null;
    return;
  }

  // 사진 7장. 가로 화면(컴퓨터)에서는 사진을 더 크게 보여 화면을 채움
  const BIG = ['holiday/2013-01', 'holiday/2015-02', 'holiday/2018-02', 'holiday/2021-02', 'holiday/2023-01', 'holiday/2024-03', 'holiday/2026-01'];
  const PHOTOS = BIG;
  const COUNT = PHOTOS.length;
  const wide = innerWidth / innerHeight > 1.1;

  // 타임라인(ms): 사진이 하나씩 등장 → 잠깐 머무름 → 쓩 날아감 → 페이지 시작 (사진이 많으면 더 빠르게)
  const TIME = {};
  TIME.step = Math.min(300, Math.round(2000 / COUNT));
  TIME.pop = 550;
  TIME.go = (COUNT - 1) * TIME.step + TIME.pop + 350;
  TIME.goStep = Math.min(70, Math.round(700 / COUNT));
  TIME.goDur = 650;
  TIME.out = TIME.go + (COUNT - 1) * TIME.goStep + TIME.goDur - 150;
  TIME.end = TIME.out + 700;

  // 사진 위치(화면 비율 x, y, 기울기): 위 4장, 아래 3장
  const SLOT = [
    [.14, .30, -.05], [.38, .27, .04], [.62, .30, -.03], [.86, .27, .05],
    [.26, .74, .04], [.50, .72, -.04], [.74, .74, .03]
  ];

  const canvas = document.getElementById('intro-cv');
  const ctx = canvas.getContext('2d');
  const images = [];
  let cards = [];
  let loaded = 0;
  let raf = 0;
  let startTime = 0;
  let vw, vh, dpr;

  root.classList.add('intro-lock');
  document.getElementById('intro-skip').addEventListener('click', finish);
  window.addEventListener('resize', () => { resize(); layout(); });

  resize();
  PHOTOS.forEach((name) => {
    const img = new Image();
    img.onload = img.onerror = onImageReady;
    img.src = 'img/' + name + '.jpg';
    images.push(img);
  });

  // --- 계산 도우미 ---
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function segment(t, from, to) { return clamp01((t - from) / (to - from)); }
  function easeBack(t) {
    const c1 = 1.7;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // --- 준비 ---
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    vw = innerWidth;
    vh = innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
  }

  function layout() {
    const h = wide ? Math.min(vh * .44, vw * .24) : Math.min(vh * .36, vw * .3);
    const w = h * .78;
    cards = SLOT.map((s, i) => ({ x: s[0] * vw, y: s[1] * vh, w: w, h: h, rot: s[2], img: images[i] }));
  }

  function onImageReady() {
    if (++loaded < COUNT) return;
    layout();
    raf = requestAnimationFrame(frame);
  }

  // --- 그리기 ---
  function drawCard(card, i, t) {
    const appear = segment(t, i * TIME.step, i * TIME.step + TIME.pop);
    if (appear <= 0) return;

    const go = segment(t, TIME.go + i * TIME.goStep, TIME.go + i * TIME.goStep + TIME.goDur);
    if (go >= 1) return;

    const img = card.img;
    if (!img.naturalWidth) return;

    // 화면 가운데에서 바깥쪽으로 쓩 날아감
    const dx = card.x - vw / 2;
    const dy = card.y - vh / 2;
    const len = Math.hypot(dx, dy) || 1;
    const fly = go * go * go;
    const far = Math.max(vw, vh) * 1.3;
    const x = card.x + dx / len * far * fly;
    const y = card.y + dy / len * far * fly;
    const scale = easeBack(appear) * (1 - .15 * Math.sin(Math.min(1, go * 4) * Math.PI / 2));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(card.rot + (dx > 0 ? 1 : -1) * fly * 1.2);
    ctx.scale(scale, scale);

    // 하얀 사진 프레임
    ctx.shadowColor = 'rgba(20,23,28,.25)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-card.w / 2, -card.h / 2, card.w, card.h);
    ctx.shadowColor = 'transparent';

    // 프레임 안에 사진을 꽉 채워(cover) 그림
    const pad = card.w * .06;
    const iw = card.w - pad * 2;
    const ih = card.h - pad * 2 - card.h * .08;
    const ratio = Math.max(iw / img.naturalWidth, ih / img.naturalHeight);
    const sw = iw / ratio;
    const sh = ih / ratio;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, -card.w / 2 + pad, -card.h / 2 + pad, iw, ih);
    ctx.restore();
  }

  function frame(now) {
    if (!startTime) startTime = now;
    let t = now - startTime;

    // 미리보기용: 주소 뒤에 ?introT=3000 을 붙이면 그 시점에서 멈춤
    const fixed = /[?&]introT=(\d+)/.exec(location.search);
    if (fixed) t = +fixed[1];

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);

    if (t < TIME.go + (COUNT - 1) * TIME.goStep + TIME.goDur) {
      cards.forEach((card, i) => drawCard(card, i, t));
    }
    if (t >= TIME.out) intro.style.opacity = 1 - segment(t, TIME.out, TIME.end);
    if (t >= TIME.end) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }

  // --- 끝내기 (다 보여줬거나 '건너뛰기'를 눌렀을 때) ---
  function finish() {
    if (!intro) return;
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove('intro-lock');
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('introdone'));   // 스크롤 등장 효과가 이 신호를 기다림
    intro.classList.add('out');
    setTimeout(() => {
      if (intro) { intro.remove(); intro = null; }
    }, 700);
  }
}


/* ---------- 똘Profile 사진 : 가끔 눈을 감았다 뜸 (이따금 두 번 깜빡) ---------- */
function initBlink() {
  const el = document.getElementById('blink');
  if (!el || reduceMotion) return;

  function wait(ms, fn) { setTimeout(fn, ms); }

  function blink() {
    wait(1800 + Math.random() * 3200, () => {
      el.classList.add('shut');
      const twice = Math.random() < .3;

      wait(260, () => {
        el.classList.remove('shut');
        if (!twice) { blink(); return; }

        wait(160, () => {
          el.classList.add('shut');
          wait(220, () => {
            el.classList.remove('shut');
            blink();
          });
        });
      });
    });
  }
  blink();
}


/* ---------- 이미지 커서 ----------
   평소에는 브라우저 기본 방식(지연 없음)을 쓰고,
   브라우저가 이미지를 포기하는 화면 가장자리에서만 따라다니는 이미지로 대신 보여줌 */
function initCursor() {
  const fx = document.getElementById('fx-cursor');
  if (!fx) return;
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) { fx.remove(); return; }

  const EDGE = 72;   // 가장자리로 보는 두께(px)
  const CLICKABLE = 'a,button,[role=button],.slide,label,summary,input[type=submit],input[type=button]';
  let lastTarget = null;
  let isEars = false;
  let onEdge = false;

  function move(e) {
    const x = e.clientX;
    const y = e.clientY;
    const edge = x < EDGE || y < EDGE || x > innerWidth - EDGE || y > innerHeight - EDGE;

    if (edge !== onEdge) {
      onEdge = edge;
      root.classList.toggle('fx-cursor', edge);
      fx.classList.toggle('show', edge);
    }
    if (!edge) return;

    fx.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';

    const target = e.target;
    if (target === lastTarget) return;
    lastTarget = target;

    // 글자 입력칸 위에서는 이미지를 숨기고, 누를 수 있는 곳에서는 귀 모양으로 바꿈
    const inText = target.closest && target.closest('input,textarea');
    fx.style.visibility = inText ? 'hidden' : 'visible';
    const ears = !inText && !!(target.closest && target.closest(CLICKABLE));
    if (ears !== isEars) {
      isEars = ears;
      fx.classList.toggle('ears', ears);
    }
  }

  function press(scale) {
    fx.firstElementChild.style.transform = scale;
    fx.lastElementChild.style.transform = scale;
  }

  if ('onpointerrawupdate' in window) {
    document.addEventListener('pointerrawupdate', (e) => { if (e.pointerType === 'mouse') move(e); }, { passive: true });
  } else {
    document.addEventListener('mousemove', move, { passive: true });
  }
  document.addEventListener('mouseleave', () => {
    fx.classList.remove('show');
    root.classList.remove('fx-cursor');
    onEdge = false;
  });
  document.addEventListener('mousedown', () => press('scale(.9)'));
  document.addEventListener('mouseup', () => press(''));
}


/* ---------- 헤더 · 모바일 메뉴 ---------- */
function initHeader() {
  const header = document.querySelector('header.site');
  const nav = document.getElementById('main-nav');
  const menuBtn = document.querySelector('.menu-btn');
  const holiday = document.getElementById('holiday');
  let lastY = window.scrollY;
  let ticking = false;

  // 아래로 스크롤하면 숨고, 위로 스크롤하면 다시 나타남 (고정된 헤더가 사진을 가리지 않도록)
  function update() {
    ticking = false;
    const y = window.scrollY;
    const dy = y - lastY;
    const menuOpen = nav.classList.contains('open');
    const rect = holiday.getBoundingClientRect();
    const inHoliday = rect.top < 90 && rect.bottom > window.innerHeight * .5;   // 똘Holiday는 화면에 고정된 연출이라 헤더 유지

    if (y < 100 || menuOpen || inHoliday || dy < -6) header.classList.remove('hide');
    else if (dy > 6) header.classList.add('hide');

    if (Math.abs(dy) > 6) lastY = y;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  // 모바일 메뉴 열고 닫기
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });
}


/* ---------- 스크롤하면 스윽 나타나는 효과 ---------- */
function initReveal() {
  // 대상에 reveal 클래스와 순차 지연(--d)을 붙임
  //   opt.dir : 들어오는 방향 클래스 (from-left / from-right / zoom)
  //   opt.base: 첫 요소의 지연(초),  opt.step: 요소마다 늘어나는 지연(초)
  function mark(elements, opt) {
    opt = opt || {};
    elements.forEach((el, i) => {
      el.classList.add('reveal');
      if (opt.dir) el.classList.add(opt.dir);
      el.style.setProperty('--d', ((opt.base || 0) + (opt.step || 0) * i).toFixed(2) + 's');
    });
  }
  function markSelf(selector, opt) {
    mark(document.querySelectorAll(selector), opt);
  }
  function markChildren(parentSelector, childSelector, opt) {
    document.querySelectorAll(parentSelector).forEach((parent) => {
      mark(parent.querySelectorAll(childSelector), opt);
    });
  }

  markChildren('.hero-copy', ':scope > *', { step: .12 });
  markSelf('.hero-visual', { dir: 'from-right', base: .25 });
  markSelf('.profile-photo', { dir: 'from-left' });
  markChildren('.profile-info', ':scope > :not(dl), .info-line', { step: .1, base: .1 });   // 정보 4줄은 한 줄씩
  markSelf('.tricks > h3');
  markChildren('.trick-row', '.trick', { step: .12, base: .1, dir: 'zoom' });
  markSelf('.hol-head');
  markSelf('.time-panel', { dir: 'from-right', base: .2 });
  markSelf('.log-head, .slider', { step: .08 });
  markChildren('.dear-copy', ':scope > *', { step: .1 });
  markSelf('.dear-body', { dir: 'from-right', base: .15 });
  markSelf('footer.site .shell');

  // 인트로가 끝나기 전에 보이게 된 요소는 모아 두었다가 끝난 뒤에 등장시킴
  let waiting = [];
  function show(el) { el.classList.add('in'); }
  function showWaiting() { waiting.forEach(show); waiting = []; }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(show);
    return;
  }

  // 화면에 들어오면 나타나고, 화면 밖으로 완전히 벗어나면 다시 숨겨서 다음에 또 나타나게 함
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.intersectionRatio >= .12) {
        if (!root.classList.contains('intro-lock')) show(el);
        else if (waiting.indexOf(el) < 0) waiting.push(el);
      } else if (entry.intersectionRatio === 0) {
        el.classList.remove('in');
        const i = waiting.indexOf(el);
        if (i >= 0) waiting.splice(i, 1);
      }
    });
  }, { threshold: [0, .12], rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  window.addEventListener('introdone', showWaiting);
}


/* ---------- 똘Holiday : 스크롤하면 1~14살 사진이 날아와 제자리에 놓임 (끝나면 14장이 모두 보임) ---------- */
function initHoliday() {
  const FIRST_YEAR = 2012;   // 똘똘이 태어난 해 (세는 나이로 1살)
  const LAST_YEAR = 2025;    // 14살
  const section = document.getElementById('holiday');
  const frame = document.getElementById('hol-frame');
  const mobile = window.matchMedia('(max-width: 960px)');

  // 나이별 사진 만들기 (img/age/연도.jpg). 자리는 CSS(.tile:nth-child)가 정함
  const tiles = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
    const age = year - FIRST_YEAR + 1;
    const tile = document.createElement('figure');
    tile.className = 'tile';

    const img = document.createElement('img');
    img.src = 'img/age/' + year + '.jpg';
    img.alt = age + '살 노똘똘';
    img.width = 800;
    img.height = 1000;
    if (year > FIRST_YEAR) img.loading = 'lazy';

    const caption = document.createElement('figcaption');
    caption.textContent = age + '살';

    tile.appendChild(img);
    tile.appendChild(caption);
    frame.appendChild(tile);
    tiles.push(tile);
  }
  const COUNT = tiles.length;

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // 스크롤 진행도(0~1): 컴퓨터는 고정된 영역을 스크롤한 만큼, 모바일은 사진 모음이 화면을 지나가는 만큼
  function getProgress() {
    if (mobile.matches) {
      const rect = frame.getBoundingClientRect();
      const start = window.innerHeight * .85;
      const end = window.innerHeight * .9 - rect.height;
      return clamp01((start - rect.top) / (start - end));
    }
    const total = section.offsetHeight - window.innerHeight;
    return clamp01(-section.getBoundingClientRect().top / total);
  }

  // 사진을 한 장씩 차례로 날려 보냄. 진행도 88%에서 14장이 모두 도착해 마지막은 가만히 보임
  function update() {
    const flown = clamp01(getProgress() / .88) * COUNT;
    const side = window.innerWidth * .9;

    tiles.forEach((tile, i) => {
      const t = reduceMotion ? 1 : clamp01(flown - i);
      const e = easeOut(t);
      const dir = i % 2 ? 1 : -1;   // 홀수는 오른쪽, 짝수는 왼쪽에서 날아옴
      const x = dir * side * (1 - e);
      const y = -window.innerHeight * .25 * (1 - e);
      const rot = dir * 25 * (1 - e);
      tile.style.opacity = t > 0 ? 1 : 0;
      tile.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg)';
    });
  }

  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
  update();
}


/* ---------- 함께한 시간 패널 : 화면에 들어오면 숫자가 와르르 돌다가 멈춤 ---------- */
function initTogether() {
  const BIRTH = new Date('2012-05-26T00:00:00');   // 똘똘이 생일
  const section = document.getElementById('together');

  // 년 → 달 → 주 → 일 → 시간 → 초 순서로 멈추고, 마지막 초는 계속 올라감
  const counters = ['c-year', 'c-month', 'c-week', 'c-day', 'c-hour', 'c-sec'].map((id) => document.getElementById(id));
  const STOP_AT = [1300, 2200, 3100, 4000, 4900, 5800];   // 각 숫자가 멈추는 시간(ms)
  let stopped = counters.map(() => false);
  let started = false;
  let runId = 0;

  function format(n) { return n.toLocaleString(); }

  // 지금까지 함께한 시간 [년, 달, 주, 일, 시간, 초]
  function realValues() {
    const now = new Date();
    const ms = now - BIRTH;
    const months = (now.getFullYear() - BIRTH.getFullYear()) * 12 + now.getMonth() - BIRTH.getMonth() - (now.getDate() < BIRTH.getDate() ? 1 : 0);
    return [Math.floor(months / 12), months, Math.floor(ms / 604800000), Math.floor(ms / 86400000), Math.floor(ms / 3600000), Math.floor(ms / 1000)];
  }

  // 돌아가는 동안 보여줄, 자릿수가 같은 아무 숫자
  function randomLike(n) {
    let digits = '';
    for (let i = 0, len = String(n).length; i < len; i++) digits += Math.floor(Math.random() * 10);
    return format(+digits);
  }

  // 이미 멈춘 숫자를 실제 값으로 갱신
  function paint() {
    const values = realValues();
    counters.forEach((el, i) => { if (stopped[i]) el.textContent = format(values[i]); });
  }

  function startCount() {
    if (started) return;
    started = true;
    const myRun = ++runId;
    const t0 = performance.now();
    counters.forEach((el) => el.classList.add('spin'));

    if (reduceMotion) {
      stopped = counters.map(() => true);
      counters.forEach((el) => el.classList.remove('spin'));
      paint();
      return;
    }

    (function tick(now) {
      if (myRun !== runId) return;   // 도중에 리셋되었으면 멈춤
      const t = now - t0;
      const values = realValues();
      let done = true;

      counters.forEach((el, i) => {
        if (stopped[i]) return;
        if (t >= STOP_AT[i]) {
          stopped[i] = true;
          el.textContent = format(values[i]);
          el.classList.remove('spin');
          el.parentNode.classList.add('stop');
        } else {
          el.textContent = randomLike(values[i]);
          done = false;
        }
      });
      if (!done) setTimeout(() => requestAnimationFrame(tick), 50);
    })(t0);
  }

  // 영역을 벗어나면 숫자를 처음 상태로 되돌려서, 다시 오면 또 돌아가게 함
  function resetCount() {
    if (!started) return;
    started = false;
    runId++;
    stopped = counters.map(() => false);
    counters.forEach((el) => {
      el.textContent = '0';
      el.classList.remove('spin');
      el.parentNode.classList.remove('stop');
    });
  }

  function update() {
    const rect = section.getBoundingClientRect();
    const introOn = root.classList.contains('intro-lock');
    if (!introOn && rect.top < window.innerHeight * .6 && rect.bottom > window.innerHeight * .4) startCount();
    else if (rect.top >= window.innerHeight || rect.bottom <= 0) resetCount();
  }

  setInterval(paint, 1000);
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
  update();
}


/* ---------- 똘Log : 가로 슬라이드 사진첩 ---------- */
function initLog() {
  const PHOTOS = [
    { src: 'img/log/01.jpg', cap: '안녕하세요 🐾', sub: '전 방금 태어났고, 평생 가족을 만났어요.', alt: '가족의 손 위에 안겨 있는 갓 태어난 노똘똘' },
    { src: 'img/log/06.jpg', cap: '저는 산책이 정말 좋아요.', sub: '저기 뭐가 있는 것 같아요. 킁킁', alt: '파란 목줄을 하고 산책길 앞쪽을 바라보는 노똘똘의 뒷모습' },
    { src: 'img/log/02.jpg', cap: '견생 첫 강아지카페', sub: '완전 동공지진이예요. 얼음!', alt: '강아지 카페에서 잔뜩 얼어 있는 노똘똘' },
    { src: 'img/log/07.jpg', cap: '발을 다쳤어요..', sub: '그래도 천방지축!', alt: '발에 붕대를 감고 넥카라를 쓴 채 혀를 내밀고 있는 노똘똘' },
    { src: 'img/log/03.jpg', cap: '이건 절 위해 차려진 밥상이겠죠?', alt: '식탁에 차려진 밥상을 의자 위에서 지켜보는 노똘똘의 뒷모습' },
    { src: 'img/log/09.jpg', cap: '저도 이제 세상을 좀 알아요.', alt: '천 원짜리 지폐를 베고 소파에 엎드려 카메라를 바라보는 노똘똘' },
    { src: 'img/log/04.jpg', cap: '눈 앞에 간식이 있는데 나갈 수가 없어요.', sub: '분명 들어오는 건 쉬웠는데...', alt: '투명한 상자 안에 갇혀 바닥의 간식을 바라보는 노똘똘' },
    { src: 'img/log/05.jpg', cap: '할스훈트가 되었지만, 여전히 산책은 좋아요!', alt: '유모차에서 눈을 감고 산책을 즐기는 노똘똘' }
  ];
  const COUNT = PHOTOS.length + 1;   // 사진 + 마지막 "더 보러가기" 카드

  const slider = document.getElementById('slider');
  const dots = document.getElementById('dots');
  let moved = false;   // 마우스로 끌었는지 (끌었다면 클릭으로 보지 않음)

  // ----- 슬라이드와 점 만들기 -----
  function makeElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function addDot(label, index) {
    const dot = makeElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', label);
    dot.addEventListener('click', () => go(index));
    dots.appendChild(dot);
  }

  PHOTOS.forEach((photo, i) => {
    const slide = makeElement('li', 'slide');

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt || photo.cap;
    img.draggable = false;
    img.loading = 'lazy';
    const frame = makeElement('div', 'ph');
    frame.appendChild(img);

    const caption = makeElement('div', 'cap');
    caption.appendChild(makeElement('h3', 'ct', photo.cap));
    if (photo.sub) caption.appendChild(makeElement('p', 'cs', photo.sub));

    slide.appendChild(frame);
    slide.appendChild(caption);
    slide.addEventListener('click', () => { if (!moved) go(i); });
    slider.appendChild(slide);

    addDot((i + 1) + '번째 사진', i);
  });

  // 마지막에 화살표로 넘기면 나오는 "사진 더 보러가기" 카드
  // (사진첩 페이지가 만들어지면 #more-btn 에 이동 동작을 연결하면 됨. 지금은 눌러도 아무 일도 없음)
  const more = makeElement('li', 'slide more');
  more.innerHTML = '<div class="more-in"><span class="pawbig" aria-hidden="true">🐾</span><p>아무래도 더<br>보고싶죠??</p><button type="button" class="btn btn-point" id="more-btn">사진 더 보러가기 →</button></div>';
  slider.appendChild(more);
  addDot('사진 더 보러가기', PHOTOS.length);

  // ----- 사진들을 잇는 구불구불한 점선 -----
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const pathSvg = document.createElementNS(SVG_NS, 'svg');
  const pathItem = makeElement('li', 'log-path');   // ul 안에는 li 만 둘 수 있어서 li 로 감쌈
  pathItem.setAttribute('aria-hidden', 'true');
  pathItem.appendChild(pathSvg);
  slider.appendChild(pathItem);

  function drawPath() {
    const slides = slider.querySelectorAll('.slide');
    if (!slides.length) return;

    const W = slider.scrollWidth;
    const H = slider.scrollHeight;
    pathSvg.setAttribute('width', W);
    pathSvg.setAttribute('height', H);
    pathSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    // 각 사진의 한가운데 점
    const points = Array.prototype.map.call(slides, (slide) => {
      const target = slide.querySelector('.ph') || slide;
      return [slide.offsetLeft + slide.offsetWidth / 2, slide.offsetTop + target.offsetTop + target.offsetHeight / 2];
    });

    const first = points[0];
    const last = points[points.length - 1];
    const startX = first[0] - 120;
    const startY = first[1] + 60;
    const endX = last[0] + 220;
    const endY = last[1] + 60;

    let d = 'M' + startX + ' ' + startY;
    d += ' C' + (first[0] - 60) + ' ' + (first[1] + 60) + ' ' + (first[0] - 60) + ' ' + first[1] + ' ' + first[0] + ' ' + first[1];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const mx = (a[0] + b[0]) / 2;
      d += ' C' + mx + ' ' + a[1] + ' ' + mx + ' ' + b[1] + ' ' + b[0] + ' ' + b[1];
    }
    d += ' C' + (last[0] + 100) + ' ' + last[1] + ' ' + (last[0] + 140) + ' ' + (last[1] + 60) + ' ' + endX + ' ' + endY;

    pathSvg.innerHTML = '<path d="' + d + '"/><circle cx="' + startX + '" cy="' + startY + '" r="6"/><circle cx="' + endX + '" cy="' + endY + '" r="6"/>';
  }

  // ----- 넘기기 -----
  function stepWidth() {
    const slide = slider.querySelector('.slide');
    return slide.offsetWidth + parseFloat(getComputedStyle(slider).gap);
  }
  function currentIndex() {
    return Math.min(COUNT - 1, Math.round(slider.scrollLeft / stepWidth()));
  }
  function go(i) {
    slider.scrollTo({ left: i * stepWidth(), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function goNext() { go(Math.min(COUNT - 1, currentIndex() + 1)); }
  function goPrev() { go(Math.max(0, currentIndex() - 1)); }

  function updateDots() {
    const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5;
    const active = atEnd ? COUNT - 1 : currentIndex();
    Array.prototype.forEach.call(dots.children, (dot, i) => dot.classList.toggle('on', i === active));
  }

  document.getElementById('next').addEventListener('click', goNext);
  document.getElementById('prev').addEventListener('click', goPrev);
  slider.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
  });

  // ----- 마우스로 끌어서 넘기기 -----
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  slider.addEventListener('mousedown', (e) => {
    dragging = true;
    moved = false;
    startX = e.pageX;
    startScroll = slider.scrollLeft;
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 5) {
      moved = true;
      slider.classList.add('drag');
    }
    if (moved) slider.scrollLeft = startScroll - dx;
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    if (moved) {
      slider.classList.remove('drag');
      go(currentIndex());   // 가장 가까운 사진에 맞춰 멈춤
    }
  });

  window.addEventListener('resize', drawPath);
  window.addEventListener('load', drawPath);
  drawPath();
  updateDots();
}


/* ---------- Dear똘 : 편지 남기기 (이 브라우저에만 저장. 서버 연결 전 임시) ---------- */
function initLetters() {
  const STORAGE_KEY = 'ddoldol-letters';
  const form = document.getElementById('letter-form');
  const list = document.getElementById('letters');

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function save(letters) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(letters)); }
    catch (e) { /* 저장이 막힌 브라우저에서는 무시 */ }
  }
  function removeLetter(index) {
    const letters = load();
    letters.splice(index, 1);
    save(letters);
    render();
  }

  function makeElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function makeButton(label, className, onClick) {
    const btn = makeElement('button', 'del ' + (className || ''), label);
    btn.type = 'button';
    btn.addEventListener('click', onClick);
    return btn;
  }

  // 편지 한 장
  function makeLetter(letter, index) {
    const item = makeElement('article', 'letter');
    const top = makeElement('div', 'top');
    const who = makeElement('span', 'who', 'From. ' + (letter.name || '익명') + ' · ' + letter.date);
    const act = makeElement('div', 'act');

    // 삭제 버튼 → "삭제할까요? 네 / 아니요" 로 한 번 더 물어봄
    function showDelete() {
      act.textContent = '';
      const del = makeButton('삭제', '', showConfirm);
      del.setAttribute('aria-label', (letter.name || '익명') + '님의 편지 삭제');
      act.appendChild(del);
    }
    function showConfirm() {
      act.textContent = '';
      act.appendChild(makeElement('span', 'ask', '삭제할까요?'));
      act.appendChild(makeButton('네', 'yes', () => {
        item.classList.add('gone');
        setTimeout(() => removeLetter(index), 300);
      }));
      act.appendChild(makeButton('아니요', '', showDelete));
    }
    showDelete();

    top.appendChild(who);
    top.appendChild(act);
    item.appendChild(top);
    item.appendChild(makeElement('p', '', letter.msg));
    return item;
  }

  // 목록 (최근 편지가 위로)
  function render() {
    const letters = load();
    list.textContent = '';

    if (!letters.length) {
      list.appendChild(makeElement('p', 'empty', '아직 도착한 편지가 없어요.'));
      return;
    }
    letters.slice().reverse().forEach((letter, i) => {
      list.appendChild(makeLetter(letter, letters.length - 1 - i));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('l-msg').value.trim();
    if (!msg) return;

    const now = new Date();
    const letters = load();
    letters.push({
      name: document.getElementById('l-name').value.trim(),
      msg: msg,
      date: now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate()
    });
    save(letters);
    form.reset();
    render();
  });

  render();
}


/* ---------- 시작 ---------- */
initIntro();
initBlink();
initCursor();
initHeader();
initReveal();
initHoliday();
initTogether();
initLog();
initLetters();
