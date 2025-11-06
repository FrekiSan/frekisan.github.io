document.addEventListener("DOMContentLoaded", () => {
  (function(){
    const fn = (window.Manager && typeof Manager.startGlobalTimer === 'function')
      ? Manager.startGlobalTimer
      : (typeof window.startGlobalTimer === 'function' ? window.startGlobalTimer : null);
    if (fn) { try { fn(); } catch(e){} } else {
      try { localStorage.setItem('escape_global_started', String(Date.now())); } catch(e){}
    }
  })();

  const $ = (sel,root=document)=>root.querySelector(sel);
  const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));

  function ensureModalScaffold(){
    const bodyEl = document.body;
    if (!bodyEl) return;

    let overlayEl = document.getElementById('modalOverlay');
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.id = 'modalOverlay';
      overlayEl.className = 'modal-overlay';
      overlayEl.setAttribute('aria-hidden', 'true');
      bodyEl.appendChild(overlayEl);
    }

    function ensureModal(id, titleId, innerHtml){
      let modal = document.getElementById(id);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        bodyEl.appendChild(modal);
      }
      modal.classList.add('modal');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      if (titleId) modal.setAttribute('aria-labelledby', titleId);
      modal.innerHTML = innerHtml.trim();
      return modal;
    }

    ensureModal('loginModal', 'loginModalTitle', `
      <div class="modal-content">
        <button type="button" class="modal-close" data-close="loginModal" aria-label="Fermer">&times;</button>
        <h2 id="loginModalTitle">Connexion / Inscription</h2>

        <form id="registerForm" class="auth-form">
          <h3>Créer un compte</h3>
          <input type="text" id="reg-username" name="username" placeholder="Pseudo" required>
          <input type="email" id="reg-email" name="email" placeholder="Email" required>
          <input type="password" id="reg-password" name="password" placeholder="Mot de passe" required>

          <label class="rgpd-consent">
            <input type="checkbox" id="reg-consent" name="consent" value="1" required>
            J’accepte la <a href="privacy.html" target="_blank" rel="noopener">Politique de confidentialité</a>.
          </label>

          <button type="submit">Créer un compte</button>
        </form>

        <form id="loginForm" class="auth-form">
          <h3>Se connecter</h3>
          <input type="text" id="login-username" name="username" placeholder="Pseudo ou e-mail" required>
          <input type="password" id="login-password" name="password" placeholder="Mot de passe" required>
          <button type="submit">Se connecter</button>
        </form>
      </div>
    `);

    ensureModal('modalCredits', 'modalCreditsTitle', `
      <div class="modal-content">
        <button type="button" class="modal-close" data-close="modalCredits" aria-label="Fermer">&times;</button>
        <h2 id="modalCreditsTitle">Crédits</h2>
        <p>Escape Game réalisé par <b>Groom Escape</b> (<i>Yann S. &amp; Maxime "Freki" Orange</i>)<br>
           Codé par <b>Anima'Escape</b> (<i>Maxime "Freki" Orange</i>)<br>
           Acteurs : Hafid D., Yann S., Maxime "Freki" Orange<br>
           <i>Escape réalisé en collaboration avec la ville de Clermont-Ferrand (février 2020)</i>
        </p>
      </div>
    `);

    ensureModal('modalContact', 'modalContactTitle', `
      <div class="modal-content">
        <button type="button" class="modal-close" data-close="modalContact" aria-label="Fermer">&times;</button>
        <h2 id="modalContactTitle">Contact</h2>
        <form>
          <input type="text" placeholder="Votre nom" required>
          <input type="email" placeholder="Votre email" required>
          <textarea placeholder="Votre message" required></textarea>
          <button type="submit">Envoyer</button>
        </form>
      </div>
    `);

    ensureModal('classementModal', 'classementModalTitle', `
      <div class="modal-content">
        <button type="button" class="modal-close" data-close="classementModal" aria-label="Fermer">&times;</button>
        <h2 id="classementModalTitle">Classement</h2>
        <ul id="classementList" class="leaderboard"></ul>
      </div>
    `);
  }

  ensureModalScaffold();

  const TIMER_STATE_KEY = 'escape_timer_state';
  let authState = { logged:false, userId:null, run:null };

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

  function writeTimerState(state){
    try {
      if (!state) {
        localStorage.removeItem(TIMER_STATE_KEY);
        return;
      }
      const payload = {
        userId: state.userId ?? null,
        totalElapsedMs: Number(state.totalElapsedMs || 0),
        currentStartISO: state.currentStartISO || null
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(payload));
    } catch (err) {}
  }

  function ensureTimerStateForUser(userId){
    if (!userId) return;
    const state = readTimerState();
    if (state && state.userId && state.userId !== userId) {
      writeTimerState(null);
    } else if (state && !state.userId) {
      writeTimerState({
        userId,
        totalElapsedMs: Number(state.totalElapsedMs || 0),
        currentStartISO: state.currentStartISO || null
      });
    }
  }

  function applyRunState(run){
    authState.run = run || null;
    if (!authState.userId || !run) return;
    writeTimerState({
      userId: authState.userId,
      totalElapsedMs: Number(run.total_elapsed_ms || 0),
      currentStartISO: run.current_start_at || null
    });
  }

  function freezeTimerState(totalMs, userId = authState.userId){
    if (!userId) return;
    const base = readTimerState() || {};
    base.userId = userId;
    base.totalElapsedMs = Number(totalMs || 0);
    base.currentStartISO = null;
    writeTimerState(base);
  }

  const overlay = $("#modalOverlay");
  const body = document.body;
  const focusMemory = new Map();
  const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const startLink = document.getElementById('startLink');
  const startLinkHref = startLink?.getAttribute('href') || null;

  function refreshStartLink(){
    if (!startLink) return;
    const disabled = !authState.logged;
    startLink.classList.toggle('is-disabled', disabled);
    startLink.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (disabled) {
      startLink.setAttribute('tabindex', '-1');
    } else {
      startLink.setAttribute('tabindex', '0');
    }
  }

  if (startLink) {
    startLink.classList.add('is-disabled');
    startLink.setAttribute('aria-disabled', 'true');
    startLink.addEventListener('click', async (event) => {
      if (!startLinkHref) return;
      if (!authState.logged) {
        event.preventDefault();
        if (typeof window.openModal === 'function') {
          openModal('loginModal');
        }
        return;
      }
      event.preventDefault();
      startLink.classList.add('is-busy');
      startLink.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch('api/start_run.php', { method: 'POST', credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (data && data.run) {
          applyRunState(data.run);
        }
        window.location.href = startLinkHref;
      } catch (err) {
        alert('Impossible de démarrer la partie pour le moment. Veuillez réessayer.');
      } finally {
        startLink.classList.remove('is-busy');
        startLink.removeAttribute('aria-busy');
      }
    });
  }

  function getFocusableElements(modal) {
    if (!modal) return [];
    return $$(focusableSelectors, modal).filter(el => {
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none' && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  function syncModalState() {
    const anyOpen = $$('.modal').some(modal => modal.classList.contains('is-active'));
    overlay?.classList.toggle('is-active', anyOpen);
    overlay?.setAttribute('aria-hidden', anyOpen ? 'false' : 'true');
    body.classList.toggle('modal-open', anyOpen);
  }

  function handleFocusTrap(e, modal) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusableElements(modal);
    if (!focusable.length) {
      e.preventDefault();
      modal.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  }

  function closeAllModals() {
    $$('.modal.is-active').forEach(modal => window.closeModal(modal.id));
  }

  $$('.modal').forEach(modal => {
    modal.setAttribute('aria-hidden', modal.classList.contains('is-active') ? 'false' : 'true');
    if (!modal.hasAttribute('tabindex')) {
      modal.setAttribute('tabindex', '-1');
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeModal(modal.id);
    });
    modal.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-active')) return;
      handleFocusTrap(e, modal);
    });
  });

  window.openModal = function(id){
    const modal = document.getElementById(id);
    if (!modal) return;
    focusMemory.set(modal, document.activeElement instanceof HTMLElement ? document.activeElement : null);
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    syncModalState();
    const focusable = getFocusableElements(modal);
    const target = focusable[0] || modal;
    try {
      target.focus({ preventScroll: true });
    } catch (err) {
      target.focus();
    }
    if (id === "classementModal" && typeof loadClassement === "function") {
      try { loadClassement(); } catch(e){}
    }
  };

  window.closeModal = function(id){
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    const previous = focusMemory.get(modal);
    if (previous && typeof previous.focus === 'function') {
      previous.focus({ preventScroll: true });
    }
    focusMemory.delete(modal);
    syncModalState();
  };

  overlay?.addEventListener('click', () => closeAllModals());

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-close]');
    if (!trigger) return;
    event.preventDefault();
    const targetId = trigger.getAttribute('data-close');
    if (targetId) {
      window.closeModal(targetId);
    } else {
      closeAllModals();
    }
  });

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') {
      const open = $$('.modal').filter(m => m.classList.contains('is-active')).pop();
      if (open) window.closeModal(open.id);
    }
  });

  $("#openContact")?.addEventListener("click", (e)=>{ e.preventDefault(); openModal('modalContact'); });
  $("#openCredits")?.addEventListener("click", (e)=>{ e.preventDefault(); openModal('modalCredits'); });
  $("#openClassement")?.addEventListener("click", (e)=>{ e.preventDefault(); openModal('classementModal'); });

  $$('.spoiler').forEach(el => el.addEventListener('click', ()=> el.classList.toggle('revealed')));

  function bindLogoutButton(){
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn || logoutBtn.dataset.bound === '1') return;
    logoutBtn.dataset.bound = '1';
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      let total = null;
      let userId = authState.userId;
      try {
        const res = await fetch('api/logout.php', { method: 'POST', credentials: 'include' });
        const payload = await res.json().catch(()=>({}));
        if (payload && Object.prototype.hasOwnProperty.call(payload, 'total_elapsed_ms')) {
          total = Number(payload.total_elapsed_ms);
        }
        if (payload && typeof payload.user_id === 'number') {
          userId = payload.user_id;
        }
      } catch (err) {}
      if (total !== null && !Number.isNaN(total)) {
        freezeTimerState(total, userId || undefined);
      }
      authState = { logged:false, userId:null, run:null };
      location.href = 'index.html';
    });
  }

  (async () => {
    try {
      const res = await fetch('api/me.php', {credentials:'include'});
      const me  = await res.json().catch(()=>({}));
      const logged = !!me.authenticated;
      authState.logged = logged;
      authState.userId = logged ? Number(me.user_id || 0) || null : null;
      authState.run = logged && me.run ? me.run : null;

      if (authState.userId) {
        ensureTimerStateForUser(authState.userId);
        if (authState.run) {
          applyRunState(authState.run);
        }
      }

      document.querySelectorAll('[data-auth="guest"]').forEach(el => el.style.display = logged ? 'none' : '');
      document.querySelectorAll('[data-auth="logged"]').forEach(el => el.style.display = logged ? '' : 'none');
      refreshStartLink();
      bindLogoutButton();

      const path = location.pathname.toLowerCase();
      const isEnigme = /enigme[0-9ab]*\.html$/.test(path);
      if (!logged && isEnigme) location.href = 'index.html?auth=required';
    } catch (e) {
      refreshStartLink();
    }
  })();

  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const consent = document.getElementById('reg-consent');
      if (!consent || !consent.checked) { alert('Pour créer un compte, vous devez accepter la Politique de confidentialité.'); return; }
      const fd = new FormData(regForm);
      const res = await fetch('api/register.php', { method:'POST', body:fd, credentials:'include' });
      const data = await res.json().catch(()=>({}));
      if (res.ok && data.ok) {
        const u = fd.get('username'), p = fd.get('password');
        const r2 = await fetch('api/login.php', {
          method:'POST', body: new URLSearchParams({ username:String(u||''), password:String(p||'') }),
          credentials:'include'
        });
        if (r2.ok) { closeModal('loginModal'); location.reload(); }
        else { alert('Compte créé, mais connexion auto impossible.'); }
      } else {
        alert(data.error || 'Inscription impossible.');
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const res = await fetch('api/login.php', { method:'POST', body:fd, credentials:'include' });
      const data = await res.json().catch(()=>({}));
      if (res.ok && data.ok) { closeModal('loginModal'); location.reload(); }
      else { alert('Identifiants invalides.'); }
    });
  }

  window.checkAnswer = function(expected, nextPage){
    const input = document.getElementById('answer');
    const val = input ? String(input.value||'').toLowerCase().trim() : '';
    if (val === String(expected||'').toLowerCase().trim()) {
      const block = document.getElementById('video');
      if (block) block.style.display = 'block';
      setTimeout(()=>{ window.location.href = nextPage; }, 8000);
    }
  };
});