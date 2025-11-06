(function(){
  const TIMER_STATE_KEY = 'escape_timer_state';

  function readTimerState(){
    try {
      const raw = localStorage.getItem(TIMER_STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function computeElapsedMs(){
    const state = readTimerState();
    if (!state) return null;
    let total = Number(state.totalElapsedMs || 0);
    if (state.currentStartISO) {
      const start = Date.parse(state.currentStartISO);
      if (!Number.isNaN(start)) {
        total += Math.max(0, Date.now() - start);
      }
    }
    return total;
  }

  function formatDuration(ms){
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor(ms % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  async function fetchLeaderboard(){
    const res = await fetch('/api/leaderboard.php', { credentials: 'include' });
    if (!res.ok) throw new Error('leaderboard_http_error');
    return res.json();
  }

  function renderLeaderboard(list, rows){
    if (!rows.length) {
      list.innerHTML = '<li>Aucun joueur classé pour le moment.</li>';
      return;
    }
    list.innerHTML = '';
    rows.forEach((row, index) => {
      const li = document.createElement('li');
      if (index === 0) li.classList.add('gold');
      else if (index === 1) li.classList.add('silver');
      else if (index === 2) li.classList.add('bronze');
      const ms = Number(row.total_elapsed_ms || 0);
      li.textContent = `${index + 1}. ${row.username} — ${formatDuration(ms)}`;
      list.appendChild(li);
    });
  }

  async function loadClassement(listId = 'classementList'){
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = '<li>Chargement...</li>';
    try {
      const data = await fetchLeaderboard();
      const rows = Array.isArray(data.rows) ? data.rows : [];
      renderLeaderboard(list, rows);
    } catch (err) {
      list.innerHTML = '<li>Classement indisponible.</li>';
    }
  }

  window.loadClassement = loadClassement;

  document.addEventListener('DOMContentLoaded', () => {
    const finalTime = document.getElementById('finalTime');
    if (finalTime) {
      const elapsed = computeElapsedMs();
      if (elapsed !== null) {
        finalTime.textContent = `⏱ Temps : ${formatDuration(elapsed)}`;
      }
    }

    const showButton = document.getElementById('showClassement');
    showButton?.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof window.openModal === 'function') {
        openModal('classementModal');
      }
    });
  });
})();
