const Manager = (() => {
  let MANIFEST = null;
  async function loadManifest(){ 
    if(MANIFEST) 
      return MANIFEST; 
    const r=await fetch('manifest.json'); 
    MANIFEST = await r.json(); 
    return MANIFEST; 
  }

  async function getScenario(){ 
    return (await loadManifest()).scenario || []; 
  }

  function getStepIndex(){ 
    const i=Number(sessionStorage.getItem("escape_step_index")||0); 
    return Number.isFinite(i)?i:0; 
  }

  function setStepIndex(i){ 
    sessionStorage.setItem("escape_step_index", String(i)); 
  }

  async function currentStep(){ 
    const s=await getScenario(); 
    return s[getStepIndex()] || s[0]; 
  }

  async function next(){ 
    const s=await getScenario(); 
    const i=getStepIndex()+1; 
    setStepIndex(i); 
    const step=s[i]; 
    if(!step){ alert("Fin du scénario 👏"); 
      return; } 
      window.location.href = step.page; 
    }

  async function assertOn(type,opts){ 
    const step=await currentStep(); 
    if(step.type!==type){ window.location.replace(step.page); 
      return false;
     } 
     if(opts && opts.position && step.position && Number(opts.position)!==Number(step.position))
      { console.warn("Position mismatch", opts.position, step.position);

       } 
       return true; 
      }

  async function ensureRun(){ 
    let runId=Number(localStorage.getItem("run_id")||0); 
    if(runId) return runId; 
    const userId=Number(localStorage.getItem("user_id")||1); 
    const js=await Utilities.apiPost("/runs",{ user_id:userId }); 
    runId=js.run_id; 
    localStorage.setItem("run_id", String(runId)); 
    return runId; 
  }
  function startGlobalTimer(){ 
    localStorage.setItem("escape_global_started", 
      String(Date.now())); 
    }

  async function saveElapsed(position, elapsed){ 
    try{ const runId=await ensureRun(); 
      await Utilities.apiPost("/puzzle-times",{ run_id:runId, position, elapsed_seconds:elapsed }); 
      return true; 
    } 
      catch(e){ 
        console.error("saveElapsed error", e); 
        return false; } 
      }

  let _puzzlesCache=null;
  async function loadPuzzles(){ 
    if(_puzzlesCache) 
      return _puzzlesCache; 
    const js=await Utilities.apiGet("/puzzles"); 
    _puzzlesCache=js.puzzles||[]; 
    return _puzzlesCache; 
  }
  async function getPuzzleByPosition(pos){ const ps=await loadPuzzles(); return ps.find(p=>Number(p.position)===Number(pos)); }
  async function getPuzzleMainVideoId(pos){ const p=await getPuzzleByPosition(pos); return p && (p.youtube_main_id || p.youtube_story_id) || ""; }
  async function getPuzzleStoryVideoId(pos){ const p=await getPuzzleByPosition(pos); return p && (p.youtube_story_id || p.youtube_main_id) || ""; }
  async function getIntroVideoId(){ return await getPuzzleMainVideoId(1); }

  // *** Vérification côté serveur ***
  async function checkAnswer(position, part, attempt){
    try{
      const js = await Utilities.apiPost("/answers/check", { position, part: part||"", attempt });
      return !!js.ok;
    }catch(e){ console.error("checkAnswer error", e); return false; }
  }

  return { 
    loadManifest, 
    getScenario, 
    currentStep, 
    next, 
    assertOn,
    ensureRun, 
    startGlobalTimer, 
    saveElapsed,
    getPuzzleMainVideoId, 
    getPuzzleStoryVideoId, 
    getIntroVideoId,
    checkAnswer 
  };

})();
