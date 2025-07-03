
/**
 * manager.js : Gère les états globaux (timer, stockage)
 */

let timerInterval;

function startGlobalTimer() {
  const timerDisplay = document.getElementById("timer");
  if (!timerDisplay) return;

  let startTime = localStorage.getItem("startTime");
  if (!startTime) {
    startTime = Date.now();
    localStorage.setItem("startTime", startTime);
  }

  function updateTimer() {
    const now = Date.now();
    timerDisplay.textContent = "⏱ Temps écoulé : " + formatTime(now - startTime);
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}
