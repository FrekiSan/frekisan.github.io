(function(){
  function normalize(s){ return (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]/gi,'').toLowerCase(); }
  window.checkZoneTexteAnswer = function(inputId, accepted, cb){
    const el=document.getElementById(inputId); if(!el) return;
    const ok=(accepted||[]).some(a=> normalize(a)===normalize(el.value));
    const error=document.getElementById("error");
    if(ok){
      if(error) error.style.display="none";
      document.getElementById("video")?.style.setProperty("display","block");
      setTimeout(()=>cb&&cb(),8000);
    } else {
      if(error) error.style.display="block";
      else alert("Mauvaise réponse, réessayez.");
    }
  }
})();
