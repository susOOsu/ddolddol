/* ==========================================================
   노똘똘의 견생일지 — profile.js (똘Profile 상세 페이지)
   순서: 부위·감정·스킬 데이터 → 모바일 메뉴 → 3D 보기 → 감정 도감 → 스킬 도감
   고치는 곳: PARTS(부위 설명·점 위치), SKILLS(스킬 목록)
   ========================================================== */


/* ---------- 부위 데이터 ----------
   position / normal : 3D 모델 위의 점 위치 (주소 뒤에 ?edit 를 붙여서 잡을 수 있음. null 이면 점이 안 나옴)
   orbit            : 부위를 누르면 카메라가 돌아갈 각도 (예: '30deg 75deg 60%')  */
const PARTS = [
  { id: 'ears',  name: '귀',   title: '귀 · 길고 부드러운 귀',   text: '축 처진 귀는 똘똘이의 매력 포인트예요. 소리에는 아주 예민해서 간식 봉지 소리는 100m 밖에서도 알아들어요.', fact: '귀를 만지면 기분이 좋아서 눈이 스르르 감겨요.', position: null, normal: null, orbit: null },
  { id: 'eyes',  name: '눈',   title: '눈 · 반짝이는 눈',        text: '동그랗고 큰 눈으로 올려다보면 간식이 나온다는 걸 아주 잘 알아요.', fact: '사진 찍을 때 가끔 눈을 감았다 뜨는 건 비밀이에요.', position: null, normal: null, orbit: null },
  { id: 'nose',  name: '코',   title: '코 · 킁킁 대장',         text: '산책길의 모든 냄새를 기억하는 똘똘이의 레이더예요. 닥스훈트는 원래 사냥개라 냄새 맡는 실력이 최고래요.', fact: '코가 촉촉하면 오늘도 건강하다는 뜻!', position: null, normal: null, orbit: null },
  { id: 'mouth', name: '입',   title: '입 · 웃는 입',           text: '신나면 활짝 웃으면서 혀가 쏙 나와요. 사진 속 똘똘이 표정은 대부분 이 표정이에요.', fact: '간식을 받을 땐 세상에서 제일 빠르게 입을 벌려요.', position: null, normal: null, orbit: null },
  { id: 'body',  name: '몸통', title: '몸통 · 길쭉한 허리',      text: '스탠다드 닥스훈트라 몸이 길쭉해요. 그래서 소파에 올라갈 땐 가족이 엉덩이를 살짝 받쳐 줘요.', fact: '긴 허리가 아프지 않게 계단은 조심조심!', position: null, normal: null, orbit: null },
  { id: 'paws',  name: '발',   title: '발 · 짧고 힘센 다리',     text: '다리는 짧지만 땅 파기와 달리기 실력은 최고예요. "손!" 하면 가장 먼저 내미는 곳이기도 해요.', fact: '발바닥 젤리는 간식 냄새가 나요 (아마도).', position: null, normal: null, orbit: null },
  { id: 'tail',  name: '꼬리', title: '꼬리 · 기분 안테나',      text: '기분이 좋으면 프로펠러처럼 빙글빙글 돌아가요. 꼬리만 봐도 똘똘이 마음을 알 수 있어요.', fact: '미어캣 자세를 할 땐 꼬리가 균형을 잡아 줘요.', position: null, normal: null, orbit: null }
];


/* ---------- 스킬 데이터 ----------
   모든 스킬은 "간식이 있을 때"만 성공! (성공률도 간식이 있을 때 기준)
   status: 'master'(마스터) · 'training'(연마중) · 'forgot'(까먹음) / rate: 성공률(%) / img: 사진(없으면 이모지) */
const SKILLS = [
  { name: '앉아',       status: 'master',   rate: 85, img: 'img/trick-sit.png',     emoji: '🐕', comment: '간식을 쥔 손이 올라가는 순간 엉덩이가 먼저 바닥에 닿아요. 간식이 없으면? 못 들은 척!' },
  { name: '엎드려',     status: 'master',   rate: 32, img: 'img/trick-down.png',    emoji: '🐶', comment: '간식이 바닥에 있어야 엎드려요. 위에 있으면 오히려 일어서요. 그래도 마스터!' },
  { name: '미어캣',     status: 'master',   rate: 75, img: 'img/trick-meerkat.png', emoji: '🦦', comment: '간식을 머리 위로 올리면 자동으로 기립! 균형은 꼬리가 잡아 줘요.' },
  { name: '손',         status: 'master',   rate: 55, img: 'img/trick-paw.png',     emoji: '🐾', comment: '55%면 둘 중 한 번은 성공이니까 마스터라고 할 수 있죠. (간식은 선불이에요)' },
  { name: '기다려',     status: 'training', rate: 20, img: '', emoji: '⏳', comment: '“기다려” 하고 간식을 내려놓는 순간 이미 입 안에 있어요. 연마 중!' },
  { name: '한 바퀴',    status: 'training', rate: 0,  img: '', emoji: '🌀', comment: '아직 한 번도 성공한 적이 없어요. 간식이 있어도요. 평생 연마 중!' },
  { name: '하이파이브', status: 'training', rate: 40, img: '', emoji: '🙌', comment: '미어캣 자세일 때만 약 40%. 단독으로 하면 실패! 손바닥은 간식이 아니라서요.' },
  { name: '빵야',       status: 'forgot',   rate: 0,  img: '', emoji: '💥', comment: '“빵야!” 하면 벌러덩 눕던 시절이 있었는데… 지금은 간식 먼저 찾아요.' }
];

/* ---------- 감정 데이터 ----------
   img: 표정 사진 (없으면 이모지) / tip: "이럴 땐 이렇게!" 한 줄 */
const EMOTIONS = [
  { name: '포커페이스', emoji: '😐', img: '', text: '아무 생각 없어 보이지만 사실은 머릿속으로 간식이 어디 있는지 계산 중이에요.', tip: '이럴 땐? 간식 봉지를 슬쩍 만져 보세요. 표정이 0.1초 만에 무너져요.' },
  { name: '햅삐',       emoji: '😄', img: '', text: '꼬리는 프로펠러, 혀는 쏙! 산책 소리만 들려도 이 표정이 나와요.', tip: '이럴 땐? 같이 신나게 웃어 주세요. 행복은 전염돼요.' },
  { name: '시무룩',     emoji: '🥺', img: '', text: '간식이 없거나 가족이 외출 가방을 들면 눈썹이 팔(八)자가 돼요.', tip: '이럴 땐? 간식 한 개면 바로 회복돼요. (연기일 수 있어요)' },
  { name: '졸려',       emoji: '😴', img: '', text: '하품 한 번 하고 소파로 직행! 눈이 반쯤 감기면 이미 반은 꿈나라예요.', tip: '이럴 땐? 건드리지 마세요. 깨우면 시크 모드로 변신해요.' },
  { name: '신남',       emoji: '🤩', img: '', text: '미어캣 점프에 빙글빙글! 이 모습이 나오면 산책은 확정이에요.', tip: '이럴 땐? 목줄부터 챙기세요. 그래야 진정돼요.' },
  { name: '삐짐',       emoji: '😤', img: '', text: '엉덩이를 돌리고 앉아서 곁눈질만 해요. 귀는 쫑긋, 마음은 서운해요.', tip: '이럴 땐? 간식 한 개로 풀리고, 두 개면 완전히 풀려요.' }
];

const STATUS_LABEL = { master: '마스터', training: '연마중', forgot: '까먹음' };


/* ---------- 모바일 메뉴 ---------- */
function initMenu() {
  const nav = document.getElementById('main-nav');
  const btn = document.querySelector('.menu-btn');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  }
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });
}


/* ---------- 3D 보기 + 부위 설명 ---------- */
function initViewer() {
  const params = new URLSearchParams(location.search);
  const MODEL = params.get('model') || 'models/ddoldol.glb';   // 3D 모델 파일 (.glb)
  const editMode = params.has('edit');

  const mv = document.getElementById('mv');
  const fallback = document.getElementById('pf-fallback');
  const hint = document.getElementById('pf-hint');
  const list = document.getElementById('pf-parts');
  const card = document.getElementById('pf-card');
  const cardTitle = document.getElementById('pf-card-title');
  const cardText = document.getElementById('pf-card-text');
  const cardFact = document.getElementById('pf-card-fact');
  const editBox = document.getElementById('pf-edit');
  const editOut = document.getElementById('pf-edit-out');

  let currentId = null;
  let modelReady = false;

  // --- 부위 버튼 (3D 점을 못 쓰는 화면에서도 누를 수 있음) ---
  function makeButton(id, label) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pf-part';
    btn.dataset.id = id;
    btn.textContent = label;
    btn.addEventListener('click', () => select(id));
    li.appendChild(btn);
    list.appendChild(li);
  }
  PARTS.forEach((p) => makeButton(p.id, p.name));
  makeButton('all', '전체 보기');

  // --- 부위 고르기: 설명 말풍선 바꾸기 + 3D 카메라 이동 ---
  function select(id) {
    currentId = id;
    list.querySelectorAll('.pf-part').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
    mv.querySelectorAll('.hotspot').forEach((h) => h.classList.toggle('on', h.dataset.id === id));

    if (id === 'all') {
      cardTitle.textContent = '부위를 눌러 보세요';
      cardText.textContent = '귀, 코, 발, 꼬리까지 똘똘이의 구석구석을 알려 드릴게요.';
      cardFact.hidden = true;
      if (modelReady) { mv.cameraOrbit = 'auto auto auto'; mv.cameraTarget = 'auto auto auto'; }
      return;
    }

    const part = PARTS.find((p) => p.id === id);
    cardTitle.textContent = part.title;
    cardText.textContent = part.text;
    cardFact.textContent = '💡 ' + part.fact;
    cardFact.hidden = false;
    card.classList.remove('pop');
    void card.offsetWidth;   // 애니메이션을 다시 시작시키는 트릭
    card.classList.add('pop');

    if (modelReady && part.orbit) {
      mv.removeAttribute('auto-rotate');
      mv.cameraOrbit = part.orbit;
      if (part.position) mv.cameraTarget = part.position;
    }
  }

  // --- 3D 위의 점(핫스팟) 만들기 ---
  function buildHotspots() {
    mv.querySelectorAll('.hotspot').forEach((h) => h.remove());
    PARTS.forEach((part, i) => {
      if (!part.position) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hotspot';
      btn.slot = 'hotspot-' + part.id;
      btn.dataset.id = part.id;
      btn.dataset.position = part.position;
      if (part.normal) btn.dataset.normal = part.normal;
      btn.setAttribute('aria-label', part.name + ' 자세히 보기');
      btn.innerHTML = '<span class="hotspot-num">' + (i + 1) + '</span><span class="hotspot-name">' + part.name + '</span>';
      btn.addEventListener('click', () => select(part.id));
      mv.appendChild(btn);
    });
    if (currentId) select(currentId);
  }

  // --- 모델이 없거나 3D를 못 쓰면 사진으로 대신 보여줌 ---
  function showFallback() {
    if (modelReady) return;
    mv.hidden = true;
    fallback.hidden = false;
    hint.hidden = true;
  }

  // --- 점 위치 잡기 도구 (?edit) ---
  function updateEditOut() {
    editOut.value = PARTS.map((p) => p.id + ': position \'' + (p.position || '') + '\', normal \'' + (p.normal || '') + '\'').join('\n');
  }
  function enableEdit() {
    editBox.hidden = false;
    updateEditOut();
    mv.addEventListener('click', (e) => {
      if (!modelReady || !currentId || currentId === 'all') return;
      const hit = mv.positionAndNormalFromPoint(e.clientX, e.clientY);
      if (!hit) return;
      const part = PARTS.find((p) => p.id === currentId);
      const f = (v) => v.toFixed(3) + 'm';
      part.position = f(hit.position.x) + ' ' + f(hit.position.y) + ' ' + f(hit.position.z);
      part.normal = hit.normal.x.toFixed(3) + ' ' + hit.normal.y.toFixed(3) + ' ' + hit.normal.z.toFixed(3);
      buildHotspots();
      updateEditOut();
    });
  }

  // --- 시작: 3D 도구가 준비되면 모델을 불러옴 ---
  const timer = setTimeout(showFallback, 6000);   // 3D 도구가 6초 안에 안 켜지면 사진으로
  mv.addEventListener('error', () => { clearTimeout(timer); showFallback(); });
  mv.addEventListener('load', () => {
    clearTimeout(timer);
    modelReady = true;
    buildHotspots();
    if (editMode) enableEdit();
  });
  mv.addEventListener('camera-change', (e) => {
    if (e.detail && e.detail.source === 'user-interaction') hint.hidden = true;
  });
  customElements.whenDefined('model-viewer').then(() => { mv.src = MODEL; });

  if (editMode) editBox.hidden = false;
}


/* ---------- 감정 도감 ---------- */
function initEmotions() {
  const list = document.getElementById('pf-emotions');
  const card = document.getElementById('pf-emo-card');
  const title = document.getElementById('pf-emo-title');
  const text = document.getElementById('pf-emo-text');
  const tip = document.getElementById('pf-emo-tip');

  function select(index) {
    const emo = EMOTIONS[index];
    list.querySelectorAll('.pf-emo').forEach((b, i) => b.classList.toggle('on', i === index));
    title.textContent = emo.emoji + ' ' + emo.name;
    text.textContent = emo.text;
    tip.textContent = '💡 ' + emo.tip;
    card.classList.remove('pop');
    void card.offsetWidth;   // 애니메이션을 다시 시작시키는 트릭
    card.classList.add('pop');
  }

  EMOTIONS.forEach((emo, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pf-emo';
    btn.setAttribute('aria-label', emo.name);

    const pebble = document.createElement('span');
    pebble.className = 'pf-lp';
    if (emo.img) {
      const img = document.createElement('img');
      img.src = emo.img;
      img.alt = emo.name + ' 표정의 노똘똘';
      pebble.appendChild(img);
    } else {
      const emoji = document.createElement('span');
      emoji.className = 'pf-emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = emo.emoji;
      pebble.appendChild(emoji);
    }

    const label = document.createElement('span');
    label.className = 'pf-emo-name';
    label.textContent = emo.name;

    btn.appendChild(pebble);
    btn.appendChild(label);
    btn.addEventListener('click', () => select(i));
    li.appendChild(btn);
    list.appendChild(li);
  });
  select(0);
}


/* ---------- 스킬 도감 ---------- */
function initSkills() {
  const list = document.getElementById('pf-skills');
  const tabs = document.getElementById('pf-tabs');

  SKILLS.forEach((skill) => {
    const li = document.createElement('li');
    li.className = 'pf-skill ' + skill.status;
    li.dataset.status = skill.status;
    li.style.setProperty('--rate', skill.rate + '%');

    // 상태 배지 (마스터 / 연마중 / 까먹음): 사진 위에 작은 타원으로
    const badge = document.createElement('span');
    badge.className = 'pf-badge';
    badge.textContent = STATUS_LABEL[skill.status];

    // 사진(또는 이모지) 동그라미
    const pebble = document.createElement('div');
    pebble.className = 'pf-pebble';
    if (skill.img) {
      const img = document.createElement('img');
      img.src = skill.img;
      img.alt = skill.name + ' 하는 노똘똘';
      pebble.appendChild(img);
    } else {
      const emoji = document.createElement('span');
      emoji.className = 'pf-emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = skill.emoji;
      pebble.appendChild(emoji);
    }

    const head = document.createElement('div');
    head.className = 'pf-skill-head';
    const name = document.createElement('h3');
    name.textContent = skill.name;
    head.appendChild(name);

    // 성공률 게이지
    const gauge = document.createElement('div');
    gauge.className = 'pf-gauge';
    gauge.setAttribute('role', 'img');
    gauge.setAttribute('aria-label', '간식이 있을 때 성공률 ' + skill.rate + '%');
    gauge.innerHTML = '<span class="pf-gauge-fill"></span><span class="pf-gauge-text">간식 있을 때 ' + skill.rate + '%</span>';

    const comment = document.createElement('p');
    comment.className = 'pf-comment';
    comment.textContent = skill.comment;

    li.appendChild(badge);
    li.appendChild(pebble);
    li.appendChild(head);
    li.appendChild(gauge);
    li.appendChild(comment);
    list.appendChild(li);
  });

  // 상태별로 걸러 보기
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.pf-tab');
    if (!btn) return;
    tabs.querySelectorAll('.pf-tab').forEach((b) => b.classList.toggle('on', b === btn));
    const filter = btn.dataset.filter;
    list.querySelectorAll('.pf-skill').forEach((li) => {
      li.hidden = !(filter === 'all' || li.dataset.status === filter);
    });
  });
}


/* ---------- 시작 ---------- */
initMenu();
initViewer();
initEmotions();
initSkills();
