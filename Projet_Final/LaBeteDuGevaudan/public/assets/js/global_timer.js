// global_timer.js
(function(){
  if (window.__escapeTimerLoopInitialized) return;
  window.__escapeTimerLoopInitialized = true;

  const el = document.getElementById('global-timer')|| document.getElementById('timer');
  if(!el) return;

  const TIMER_STATE_KEY = 'escape_timer_state';

  function readState(){
    try {
      const raw = localStorage.getItem(TIMER_STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function computeElapsed(state){
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

  function fallbackElapsed(){
    const iso = localStorage.getItem('globalTimerStartISO');
    if (!iso) return 0;
    const start = Date.parse(iso);
    if (Number.isNaN(start)) return 0;
    return Math.max(0, Date.now() - start);
  }

  function fmt(n){ return String(n).padStart(2,'0'); }

  function tick(){
    const state = readState();
    let ms = computeElapsed(state);
    if (ms === null) {
      ms = fallbackElapsed();
    }
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds/3600);
    const m = Math.floor((totalSeconds%3600)/60);
    const s = totalSeconds%60;
    el.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    requestAnimationFrame(tick);
  }

  tick();
})();
