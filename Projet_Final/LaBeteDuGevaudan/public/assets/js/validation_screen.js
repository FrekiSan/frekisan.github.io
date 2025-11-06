// validation_screen.js
const DEFAULT_PUZZLES = [
  { id: 'intro',    name: 'Introduction', href: 'index.html' },
  { id: 'enigme1',  name: 'Énigme 1', href: 'enigme1.html' },
  { id: 'enigme2',  name: 'Énigme 2', href: 'enigme2.html' },
  { id: 'enigme2A', name: 'Énigme 2A', href: 'enigme2A.html' },
  { id: 'enigme3',  name: 'Énigme 3', href: 'enigme3.html' },
  { id: 'enigme3A', name: 'Énigme 3A', href: 'enigme3A.html' },
  { id: 'enigme4',  name: 'Énigme 4', href: 'enigme4.html' },
  { id: 'enigme5',  name: 'Énigme 5', href: 'enigme5.html' },
  { id: 'enigme5A', name: 'Énigme 5A', href: 'enigme5A.html' },
  { id: 'enigme6',  name: 'Énigme 6', href: 'enigme6.html' },
  { id: 'enigme6A', name: 'Énigme 6A', href: 'enigme6A.html' },
  { id: 'enigme7',  name: 'Énigme 7', href: 'enigme7.html' },
  { id: 'enigme8',  name: 'Énigme 8', href: 'enigme8.html' },
  { id: 'enigme9',  name: 'Énigme 9', href: 'enigme9.html' },
  { id: 'enigme10', name: 'Énigme 10', href: 'enigme10.html' },
  { id: 'enigme11', name: 'Énigme 11', href: 'enigme11.html' },
  { id: 'enigme12', name: 'Énigme 12', href: 'enigme12.html' },
  { id: 'enigme13', name: 'Énigme 13', href: 'enigme13.html' },
  { id: 'enigme14', name: 'Énigme 14', href: 'enigme14.html' },
  { id: 'ending',   name: 'Fin', href: 'ending.html' },
];

const STORAGE_NAMESPACE = 'puzzle';
const CONFIG_KEY = 'puzzlesConfig';

function loadConfig(){
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
    if(Array.isArray(saved) && saved.length) return saved;
  } catch {}
  return DEFAULT_PUZZLES;
}
function saveConfig(cfg){
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

function getKeysFor(id){
  return {
    solved: `${STORAGE_NAMESPACE}:${id}:solved`,
    startedAt: `${STORAGE_NAMESPACE}:${id}:startedAt`,
    solvedAt: `${STORAGE_NAMESPACE}:${id}:solvedAt`,
    attempts: `${STORAGE_NAMESPACE}:${id}:attempts`,
    timeMs: `${STORAGE_NAMESPACE}:${id}:timeMs`,
  };
}
function readStatus(id){
  const k = getKeysFor(id);
  const solved = localStorage.getItem(k.solved) === 'true';
  const startedAt = localStorage.getItem(k.startedAt);
  const solvedAt = localStorage.getItem(k.solvedAt);
  const attempts = parseInt(localStorage.getItem(k.attempts) || '0', 10);
  const timeMs = parseInt(localStorage.getItem(k.timeMs) || '0', 10);
  let state = 'todo';
  if (solved) state = 'done';
  else if (attempts > 0 || startedAt) state = 'progress';
  return { solved, startedAt, solvedAt, attempts, timeMs, state };
}

function fmtMs(ms){
  if(!ms || ms<0) return '—';
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}
function fmtDate(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { hour12:false });
}

function render(){
  const cards = document.getElementById('cards');
  cards.innerHTML = '';
  const filter = document.querySelector('.btn[data-filter].active')?.dataset.filter || 'all';
  const puzzles = loadConfig();

  let doneCount = 0;

  puzzles.forEach(p => {
    const st = readStatus(p.id);
    if(st.state === 'done') doneCount++;

    if(filter !== 'all' && st.state !== filter) return;

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.state = st.state;

    const badge = document.createElement('span');
    badge.className = 'badge ' + (st.state==='done'?'ok': st.state==='todo'?'todo':'progress');
    badge.textContent = st.state==='done' ? 'Validé' : (st.state==='todo' ? 'À faire' : 'En cours');

    const head = document.createElement('div');
    head.className = 'head';

    const h3 = document.createElement('h3');
    h3.textContent = p.name;

    head.appendChild(h3);
    head.appendChild(badge);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <span>Essais: <strong>${st.attempts}</strong></span>
      <span>Durée: <strong>${fmtMs(st.timeMs)}</strong></span>
      <span>Début: <strong>${fmtDate(st.startedAt)}</strong></span>
      <span>Fin: <strong>${fmtDate(st.solvedAt)}</strong></span>
    `;

    const actions = document.createElement('div');
    actions.className = 'actions';
    const open = document.createElement('a');
    open.href = p.href;
    open.target = '_blank';
    open.rel = 'noopener';
    open.textContent = 'Ouvrir';
    open.className = 'btn';
    actions.appendChild(open);

    const toggle = document.createElement('button');
    toggle.className = 'btn';
    toggle.textContent = st.solved ? 'Marquer non résolu' : 'Valider manuellement';
    toggle.addEventListener('click', () => {
      const k = getKeysFor(p.id);
      const now = new Date().toISOString();
      if(st.solved){
        localStorage.setItem(k.solved, 'false');
        localStorage.removeItem(k.solvedAt);
      } else {
        localStorage.setItem(k.solved, 'true');
        localStorage.setItem(k.solvedAt, now);
        if(!localStorage.getItem(k.startedAt)) localStorage.setItem(k.startedAt, now);
        // Set time if missing: rough estimate 1 minute
        if(!localStorage.getItem(k.timeMs)) localStorage.setItem(k.timeMs, String(60_000));
      }
      render();
      updateProgress();
    });
    actions.appendChild(toggle);

    const edit = document.createElement('button');
    edit.className = 'btn';
    edit.textContent = 'Lien...';
    edit.addEventListener('click', () => {
      const href = prompt(`URL/chemin pour "${p.name}"`, p.href || '');
      if(href != null){
        const cfg = loadConfig().map(x => x.id===p.id ? {...x, href} : x);
        saveConfig(cfg);
        render();
      }
    });
    actions.appendChild(edit);

    card.appendChild(head);
    card.appendChild(meta);
    card.appendChild(actions);
    cards.appendChild(card);
  });

  // Update progress bar & stats
  const total = loadConfig().length;
  const percent = total ? Math.round((doneCount/total)*100) : 0;
  const bar = document.getElementById('progress');
  const count = document.getElementById('progress-count');
  const pct = document.getElementById('progress-percent');
  bar.style.width = percent + '%';
  count.textContent = `${doneCount}/${total}`;
  pct.textContent = `${percent}%`;
}

function updateProgress(){ /* handled in render() for simplicity */ }

function setupFilters(){
  const btns = document.querySelectorAll('.btn[data-filter]');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    render();
  }));
  // Default active
  btns[0].classList.add('active');
}

function setupActions(){
  const exportBtn = document.getElementById('export-json');
  exportBtn.addEventListener('click', () => {
    const puzzles = loadConfig();
    const payload = puzzles.map(p => ({ id: p.id, name: p.name, href: p.href, ...readStatus(p.id) }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'validations_export.json'; a.click();
    URL.revokeObjectURL(url);
  });

  const resetBtn = document.getElementById('reset-progress');
  const dialog = document.getElementById('confirm-reset');
  resetBtn.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('close', () => {
    if(dialog.returnValue === 'confirm'){
      const puzzles = loadConfig();
      puzzles.forEach(p => {
        const k = getKeysFor(p.id);
        Object.values(k).forEach(key => localStorage.removeItem(key));
      });
      render();
    }
  });
}

function init(){
  document.getElementById('year').textContent = String(new Date().getFullYear());
  setupFilters();
  setupActions();
  render();
}

document.addEventListener('DOMContentLoaded', init);
