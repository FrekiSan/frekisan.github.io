(function(){
  let expected = [];
  let idx = 0;
  let successCb = ()=>{};

  function norm(x){ return String(x||'').trim().toLowerCase(); }

  function resetBorders(){
    document.querySelectorAll('.click-zone,.clickable').forEach(el=>{
      el.style.border = "2px solid transparent";
    });
  }

  function good(el){ el && (el.style.border = "2px solid lime"); }
  function bad(){ /* pas d'alert: on repart de zéro pour éviter le spam */ }

  function handleClick(rawId){
    const id = norm(rawId);
    if (!expected.length) return;
    const want = norm(expected[idx]);
    if (id === want){
      good(document.getElementById(rawId));
      idx++;
      if (idx === expected.length){
        setTimeout(()=>{
          resetBorders();
          document.getElementById('video')?.style.setProperty("display","block");
          successCb && successCb();
        }, 250);
      }
    } else {
      bad();
      idx = 0;
      resetBorders();
    }
  }

  function setupOrdreClic(order, onSuccess){
    // Si des data-order existent dans la page, on les priorise
    const domOrder = Array.from(document.querySelectorAll('[data-order]'))
      .sort((a,b)=> Number(a.dataset.order) - Number(b.dataset.order))
      .map(el => el.id)
      .filter(Boolean);

    expected = (domOrder.length ? domOrder : Array.from(order||[]));
    idx = 0;
    successCb = typeof onSuccess === 'function' ? onSuccess : ()=>{};
  }

  // Expose en global (compat onclick="handleClick('z1')")
  window.setupOrdreClic = setupOrdreClic;
  window.handleClick = handleClick;
})();
