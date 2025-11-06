(function(){
  window.setupArrows=function(exp,cb){
    let idx=0; exp=exp.map(s=>s.toLowerCase());
    function handle(d){
      if(d===exp[idx]){
        idx++;
        if(idx===exp.length){
          document.getElementById("video")?.style.setProperty("display","block");
          setTimeout(()=>cb&&cb(),5000);
        }
      } else idx=0;
    }
    document.getElementById('arrows')?.addEventListener('click',e=>{
      const b=e.target.closest('button[data-dir]'); if(b) handle(b.dataset.dir);
    });
    window.addEventListener('keydown',e=>{
      const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
      if(map[e.key]) handle(map[e.key]);
    });
  }
})();
