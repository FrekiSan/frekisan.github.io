/* Jukebox Manifest Adapter (Fusion complète)
 * - Ne crée AUCUNE UI
 * - Charge manifest.json distant
 * - Pilote l'audio via vos propres boutons/playlist existants
 *
 * Usage minimal :
 * <audio id="audio"></audio>
 * <button class="btn-prev"></button>
 * <button class="btn-play"></button>
 * <button class="btn-next"></button>
 * <button class="btn-shuffle"></button>
 * <button class="btn-repeat"></button>
 * <ul class="playlist"></ul>  (ou <select class="playlist"></select>)
 *
 * <script src="js/jukebox.manifest-adapter.js"></script>
 * <script>
 *   JukeboxFusion.init({
 *     manifestUrl: 'https://frekisan.github.io/jukebox-tracks/manifest.json',
 *     selectors: {
 *       audio: '#audio',
 *       prev: '.btn-prev',
 *       play: '.btn-play',
 *       next: '.btn-next',
 *       shuffle: '.btn-shuffle',
 *       repeat: '.btn-repeat',
 *       playlist: '.playlist',
 *       nowPlaying: '.now-playing',    // (optionnel) élément texte
 *       progress: '.progress',         // (optionnel) <input type="range">
 *       currentTime: '.time-current',  // (optionnel) <span>
 *       duration: '.time-duration'     // (optionnel) <span>
 *     }
 *   });
 * </script>
 */
const JukeboxFusion = (()=>{
  const st = {
    manifestUrl: '',
    base: '',
    tracks: [],
    i: 0,
    audio: null,
    els: {},
    shuffle: false,
    repeat: false,
    isSelect: false
  };

  function $(sel){ return document.querySelector(sel); }
  function text(el, s){ if (el) el.textContent = s; }
  function fmtTime(sec){ if(!isFinite(sec)) return '0:00'; const m = Math.floor(sec/60); const s = String(Math.floor(sec%60)).padStart(2,'0'); return `${m}:${s}`; }
  function title(t){ const a = t.artist && t.artist.trim()? t.artist: 'Inconnu'; return `${t.title||t.file} — ${a}`; }

  async function loadManifest(url){
    const res = await fetch(url, {cache:'no-cache'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    st.base = data.base_url || '';
    st.tracks = Array.isArray(data.tracks) ? data.tracks : [];
    if(!st.tracks.length) throw new Error('Aucune piste dans manifest');
  }

  function bindSelectors(sel){
    st.els.audio = $(sel.audio) || document.querySelector('audio');
    if(!st.els.audio) throw new Error('Élément <audio> introuvable (selectors.audio)');
    st.audio = st.els.audio;

    st.els.prev = $(sel.prev);
    st.els.play = $(sel.play);
    st.els.next = $(sel.next);
    st.els.shuffle = $(sel.shuffle);
    st.els.repeat = $(sel.repeat);
    st.els.now = $(sel.nowPlaying);
    st.els.progress = $(sel.progress);
    st.els.cur = $(sel.currentTime);
    st.els.dur = $(sel.duration);

    st.els.playlist = $(sel.playlist);
    if(!st.els.playlist) throw new Error('Playlist introuvable (selectors.playlist)');

    st.isSelect = st.els.playlist.tagName === 'SELECT';
  }

  function buildPlaylist(){
    const p = st.els.playlist;
    p.innerHTML = '';

    if(st.isSelect){
      st.tracks.forEach((t,idx)=>{
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = title(t);
        p.appendChild(opt);
      });
      p.selectedIndex = st.i;
      p.addEventListener('change', ()=> load(parseInt(p.value,10)));
    } else {
      st.tracks.forEach((t,idx)=>{
        const li = document.createElement('li');
        li.dataset.index = idx;
        li.textContent = title(t);
        li.addEventListener('click', ()=> load(idx));
        p.appendChild(li);
      });
    }
  }

  function reflectSelection(){
    if(st.isSelect) st.els.playlist.selectedIndex = st.i;
    else {
      [...st.els.playlist.children].forEach((li,idx)=>{
        li.classList.toggle('active', idx===st.i);
      });
    }
  }

  function load(i){
    st.i = (i+st.tracks.length) % st.tracks.length;
    const t = st.tracks[st.i];
    const url = st.base + t.file;
    st.audio.src = url;
    reflectSelection();
    if(st.els.now) text(st.els.now, title(t));
    st.audio.play().catch(()=>{});
    // toggle any play button state if you have CSS states in your theme
  }

  function next(){
    if(st.shuffle) st.i = Math.floor(Math.random()*st.tracks.length);
    else st.i = (st.i+1) % st.tracks.length;
    load(st.i);
  }
  function prev(){
    st.i = (st.i-1+st.tracks.length) % st.tracks.length;
    load(st.i);
  }

  function wireControls(){
    st.els.prev && st.els.prev.addEventListener('click', prev);
    st.els.next && st.els.next.addEventListener('click', next);
    st.els.play && st.els.play.addEventListener('click', ()=>{
      if(st.audio.paused){ st.audio.play(); st.els.play.classList.add('is-playing'); }
      else { st.audio.pause(); st.els.play.classList.remove('is-playing'); }
    });
    st.els.shuffle && st.els.shuffle.addEventListener('click', ()=>{
      st.shuffle = !st.shuffle;
      st.els.shuffle.classList.toggle('active', st.shuffle);
    });
    st.els.repeat && st.els.repeat.addEventListener('click', ()=>{
      st.repeat = !st.repeat;
      st.els.repeat.classList.toggle('active', st.repeat);
    });

    st.audio.addEventListener('timeupdate', ()=>{
      const cur = st.audio.currentTime||0, dur = st.audio.duration||0;
      st.els.progress && (st.els.progress.value = dur ? String((cur/dur)*100) : '0');
      st.els.cur && (st.els.cur.textContent = fmtTime(cur));
      st.els.dur && (st.els.dur.textContent = fmtTime(dur));
    });
    st.els.progress && st.els.progress.addEventListener('input', ()=>{
      const dur = st.audio.duration||0;
      st.audio.currentTime = (st.els.progress.value/100)*dur;
    });
    st.audio.addEventListener('ended', ()=>{
      if(st.repeat) load(st.i);
      else next();
    });
  }

  async function init({ manifestUrl, selectors, startIndex=0 }){
    st.manifestUrl = manifestUrl;
    st.i = startIndex||0;
    await loadManifest(manifestUrl);
    bindSelectors(selectors);
    buildPlaylist();
    wireControls();
    load(st.i);
  }

  return { init, _state: st };
})();
