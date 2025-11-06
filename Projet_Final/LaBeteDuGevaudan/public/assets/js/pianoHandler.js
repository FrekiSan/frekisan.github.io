(function(){
  const NOTES = [
    { note: "c",  label: "Do" },
    { note: "c#", label: "Do#" },
    { note: "d",  label: "Ré" },
    { note: "d#", label: "Ré#" },
    { note: "e",  label: "Mi" },
    { note: "f",  label: "Fa" },
    { note: "f#", label: "Fa#" },
    { note: "g",  label: "Sol" },
    { note: "g#", label: "Sol#" },
    { note: "a",  label: "La" },
    { note: "a#", label: "La#" },
    { note: "b",  label: "Si" }
  ];

  function renderKeyboard(){
    const el = document.getElementById('piano-container');
    if (!el) return null;
    el.innerHTML = "";
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '6px';

    NOTES.forEach(n=>{
      const b = document.createElement('button');
      b.textContent = n.label;   // Affiche Do, Ré, Mi…
      b.dataset.note = n.note;
      b.className = 'key' + (n.note.includes('#') ? ' black' : '');
      wrap.appendChild(b);
    });
    el.appendChild(wrap);
    return el;
  }

  window.setupPiano = function(seq, cb){
    const cont = renderKeyboard();
    if (!cont) return;
    const exp = seq.map(s => s.toLowerCase());
    let idx = 0;
    cont.addEventListener('click', e=>{
      const b = e.target.closest('button[data-note]');
      if (!b) return;
      const n = b.dataset.note;
      if (n === exp[idx]){
        idx++;
        if (idx === exp.length){
          document.getElementById('video')?.style.setProperty("display","block");
          setTimeout(()=>cb&&cb(), 5000);
        }
      } else {
        idx = 0;
      }
    });
  }
})();
