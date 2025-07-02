
// classement.js : gère l'enregistrement et l'affichage du classement des joueurs

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitScore");
  const playerInput = document.getElementById("playerName");
  const finalTime = document.getElementById("finalTime");
  const leaderboard = document.getElementById("leaderboard");

  // Affiche le temps final
  const startTime = localStorage.getItem("startTime");
  if (startTime && finalTime) {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    finalTime.textContent = `⏱ Temps : ${minutes}:${seconds}`;
  }

  // Enregistrer le score
  submitBtn?.addEventListener("click", () => {
    const name = playerInput.value.trim();
    if (!name) return alert("Veuillez entrer un pseudo.");

    const startTime = localStorage.getItem("startTime");
    if (!startTime) return alert("Temps non disponible.");

    const elapsed = Date.now() - startTime;
    const newEntry = { name, time: elapsed };

    // Récupération des scores existants
    let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    scores.push(newEntry);

    // Tri des meilleurs temps (plus petit d'abord)
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10); // Top 10

    localStorage.setItem("leaderboard", JSON.stringify(scores));
    window.location.href = "classement.html";
  });

  // Affichage du classement
  if (leaderboard) {
    const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    leaderboard.innerHTML = scores.map((entry, index) => {
      const minutes = Math.floor(entry.time / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((entry.time % 60000) / 1000).toString().padStart(2, '0');

      let medalClass = "";
      if (index === 0) medalClass = "gold";
      else if (index === 1) medalClass = "silver";
      else if (index === 2) medalClass = "bronze";

      return`
        <li class="${medalClass}">
          <strong> ${index + 1}.</strong> ${entry.name} – ${minutes}:${seconds}
        </li>`;
    }).join("");
  }
});