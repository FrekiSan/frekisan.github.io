
// Centralized auth & header behaviors
(function(){
  function isLogged(){
    // Standard key
    const k1 = localStorage.getItem('loggedIn') === 'true';
    // Fallbacks for legacy keys
    const k2 = !!localStorage.getItem('userLogged');
    const k3 = !!localStorage.getItem('authToken');
    return k1 || k2 || k3;
  }

  function updateHeaderAuth(){
    const login = document.getElementById('openLogin');
    const logout = document.getElementById('logoutBtn');
    const logged = isLogged();
    if (login) login.style.display = logged ? 'none' : '';
    if (logout) logout.style.display = logged ? '' : 'none';
  }

  function wireAuthButtons(){
    const login = document.getElementById('openLogin');
    const logout = document.getElementById('logoutBtn');
    if (login){
      login.addEventListener('click', (e)=>{
        // Prefer existing openModal if present
        if (typeof openModal === 'function'){ e.preventDefault(); openModal('loginModal'); }
      }, { once:false });
    }
    if (logout){
      logout.addEventListener('click', (e)=>{
        e.preventDefault();
        // Clear known keys
        localStorage.setItem('loggedIn','false');
        localStorage.removeItem('userLogged');
        localStorage.removeItem('authToken');
        updateHeaderAuth();
      }, { once:false });
    }
  }

  function wireLogoNav(){
    const logo = document.querySelector('header .logo');
    if (!logo) return;
    logo.style.cursor = 'pointer';
    // Simple click -> index.html
    logo.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    // Long press (5s) only on enigme14.html -> histoire.html
    const isEnigme14 = /enigme14\.html(?:$|\?)/i.test(location.pathname) || document.title.toLowerCase().includes('énigme 14');
    if (isEnigme14){
      let pressTimer = null;
      const start = () => {
        clearTimeout(pressTimer);
        pressTimer = setTimeout(()=>{ window.location.href = 'histoire.html'; }, 5000);
      };
      const cancel = () => { clearTimeout(pressTimer); };
      ['mousedown','touchstart'].forEach(ev => logo.addEventListener(ev, start));
      ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => logo.addEventListener(ev, cancel));
    }
  }

  function normalizeHrefRedirectDelays(){
    // Adjust any setTimeout(... window.location.href=..., N) created dynamically
    // This is a safety net; primary replacement done in HTML as well.
    const _setTimeout = window.setTimeout;
    window.setTimeout = function(fn, t){
      try{
        if (typeof fn === 'function'){
          const s = fn.toString();
          if (/window\.location\.href\s*=/.test(s)) { t = 70000; }
        }
      }catch(e){}
      return _setTimeout(fn, t);
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    updateHeaderAuth();
    wireAuthButtons();
    wireLogoNav();
    normalizeHrefRedirectDelays();
  });
})();
