const audio = document.getElementById('audio');
const insertCoinBtn = document.getElementById('insert-coin');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const playlist = document.getElementById('playlist');
const playlistItems = playlist.querySelectorAll('li');
const codeButtons = document.querySelectorAll('.code-buttons button');
const vinyl = document.getElementById('vinyl');
const volumeSlider = document.querySelector('.volume-control input[type="range"]');

const tracks = [
  "Asset/music/1_Amour_sous_la_lune.mp3",
  "Asset/music/2_When_the_Stars_Whisper_Your_Name.mp3",
  "Asset/music/3_Moonlight_Rendezvous.mp3",
  "Asset/music/4_Whispered_Serenade.mp3",
  "Asset/music/5_Moonlit_Memories.mp3.mp3",
  "Asset/music/6_Nostalgic_Serenade.mp3",
  "Asset/music/7_Moonlit_Serenade.mp3",
  "Asset/music/8_When_The_Saints_Go_Marching_In.mp3",
  "Asset/music/9_The_Entertainer.mp3",
  "Asset/music/10_St_Louis_Blues.mp3",
  "Asset/music/11_Baby_wont_you_please_come_home.mp3",
  "Asset/music/12_Glow_Worm.mp3"
];

const codeToIndex = {
  'A1': 0,
  'A2': 1,
  'A3': 2,
  'B1': 3,
  'B2': 4,
  'B3': 5,
  'C1': 6,
  'C2': 7,
  'C3': 8,
  'D1': 9,
  'D2': 10,
  'D3': 11
};

let currentTrack = 0;
let coinInserted = false;
let isPlaying = false;

// Placeholder sounds (mettre les vrais sons dans 'sounds/')
const coinSound = new Audio('Asset/effet/coin.mp3');
const changeSound = new Audio('Asset/effet/disc-change.wav');

// Désactive boutons avant insertion pièce
playBtn.disabled = true;
prevBtn.disabled = true;
nextBtn.disabled = true;
codeButtons.forEach(btn => btn.disabled = true);

// Mise à jour UI piste active
function highlightTrack(index) {
  playlistItems.forEach((item, i) => {
    if (i === index) {
      item.classList.add('active');
      item.textContent = item.textContent.replace(/^▶️ /, '');
      item.textContent = '▶️ ' + item.textContent;
    } else {
      item.classList.remove('active');
      item.textContent = item.textContent.replace(/^▶️ /, '');
    }
  });
}

// Charger et jouer une piste
function changeTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentTrack = index;
  audio.pause();
  isPlaying = false;
  highlightTrack(index);

  changeSound.currentTime = 0;
  changeSound.play();

  const loading = document.getElementById('loading-indicator');
  loading.classList.remove('hidden');
  vinyl.classList.remove('hidden');
  vinyl.classList.remove('spin'); // reset rotation

  setTimeout(() => {
    audio.src = tracks[index];
    audio.play();
    isPlaying = true;
    loading.classList.add('hidden');
    vinyl.classList.add('spin');
  }, 6000);
}


// Gestion lecture/pause
playBtn.addEventListener('click', () => {
  if (!coinInserted) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    vinyl.classList.remove('spin');
  } else {
    audio.play();
    isPlaying = true;
    vinyl.classList.add('spin');
  }
});

// Suivant
nextBtn.addEventListener('click', () => {
  if (!coinInserted) return;
  currentTrack = (currentTrack + 1) % tracks.length;
  changeTrack(currentTrack);
});

// Précédent
prevBtn.addEventListener('click', () => {
  if (!coinInserted) return;
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  changeTrack(currentTrack);
});

// Playlist clic
playlistItems.forEach((item, index) => {
  item.style.pointerEvents = 'none'; // désactivé avant pièce
  item.style.opacity = '0.6';
  item.addEventListener('click', () => {
    if (!coinInserted) return;
    currentTrack = index;
    changeTrack(index);
  });
});

// Code boutons clic
codeButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (!coinInserted) return;
    const code = button.dataset.code;
    const index = codeToIndex[code];
    if (index !== undefined && index < tracks.length) {
      currentTrack = index;
      changeTrack(index);
    }
  });
});

// Après insertion pièce
insertCoinBtn.addEventListener('click', () => {
  coinSound.play();
  coinInserted = true;
  insertCoinBtn.disabled = true;
  insertCoinBtn.textContent = "✔️ Pièce insérée !";
  insertCoinBtn.style.background = "#0f0";
  insertCoinBtn.style.boxShadow = "0 0 10px #0f0";

  playBtn.disabled = false;
  prevBtn.disabled = false;
  nextBtn.disabled = false;

  playlistItems.forEach(item => {
    item.style.pointerEvents = 'auto';
    item.style.opacity = '1';
  });

  codeButtons.forEach(btn => btn.disabled = false);
});

// Jouer la piste suivante automatiquement quand la piste termine
audio.addEventListener('ended', () => {
  if (!coinInserted) return;
  vinyl.classList.remove('spin');
  currentTrack = (currentTrack + 1) % tracks.length;
  changeTrack(currentTrack);
});

/// controle du volume

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

function updateSliderBackground(value) {
  const percentage = (value - volumeSlider.min) / (volumeSlider.max - volumeSlider.min) * 100;

  volumeSlider.style.background = `
    linear-gradient(90deg,
      #3600f8 0%,
      #6d00f8 20%,
      #a000f8 40%,
      #f000c0 60%,
      #f85040 80%,
      #f81d00 100%)
  `;
  volumeSlider.style.backgroundSize = '100% 100%';
  volumeSlider.style.backgroundRepeat = 'no-repeat';
}

// Initial setup
updateSliderBackground(volumeSlider.value);

// On input
volumeSlider.addEventListener('input', (e) => {
  updateSliderBackground(e.target.value);
  audio.volume = e.target.value;
});

// Init
highlightTrack(currentTrack);
