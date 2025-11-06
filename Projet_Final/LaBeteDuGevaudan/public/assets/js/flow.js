
// Global flow helpers (no module)
(function(){
  function scheduleRedirect(url, delay){
    var d = typeof delay === 'number' ? delay : 70000;
    try{
      if (typeof url !== 'string' || !url) return;
      window.setTimeout(function(){ window.location.href = url; }, d);
    }catch(e){}
  }

  // Try to reveal a story video and then redirect
  function showStoryThenRedirect(selectorOrNull, nextUrl, delay){
    try{
      var el = null;
      if (selectorOrNull){
        if (selectorOrNull[0] === '#'){
          el = document.getElementById(selectorOrNull.slice(1));
        }else{
          try { el = document.querySelector(selectorOrNull); } catch(e){}
        }
      }
      if (!el){
        el = document.getElementById('video') || document.querySelector('.video-container') || document.querySelector('iframe[src*=\"youtube.com\"]');
      }
      if (el){
        // Unhide common patterns
        el.style.display = '';
        el.classList.remove('hidden');
        // If it's an iframe, ensure it's ready (best effort)
        if (el.tagName && el.tagName.toLowerCase()==='iframe'){
          // nothing needed
        }
        // Scroll into view to help the player see it
        try{ el.scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){}
      }
    }catch(e){}
    scheduleRedirect(nextUrl, delay);
  }

  // Expose to window
  window.scheduleRedirect = scheduleRedirect;
  window.showStoryThenRedirect = showStoryThenRedirect;
})();


// Convenience wrapper: just redirect after showing story by defaults
window.afterEnigmeSuccess = function(nextUrl){
  try{ window.showStoryThenRedirect(null, nextUrl, 70000); }catch(e){}
};
