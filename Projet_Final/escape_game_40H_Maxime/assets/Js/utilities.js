
/**
 * utilities.js : Fonctions utilitaires réutilisables
 */

// Formate un nombre en deux chiffres (ex: 4 → "04")
function pad(num) {
  return String(num).padStart(2, '0');
}

// Convertit un timestamp en mm:ss
function formatTime(ms) {
  const minutes = pad(Math.floor(ms / 60000));
  const seconds = pad(Math.floor((ms % 60000) / 1000));
  return `${minutes}:${seconds}`;
}

// Reset timer
document.getElementById("reset-timer-btn")?.addEventListener("click", () => {
  localStorage.removeItem("startTime");
  window.location.href = "index.html";
});