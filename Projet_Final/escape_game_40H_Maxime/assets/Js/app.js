
/**
 * app.js : Logique principale de l'application
 */

document.addEventListener("DOMContentLoaded", () => {
  startGlobalTimer();

  const overlay = document.getElementById("modalOverlay");
  const modalContact = document.getElementById("modalContact");
  const modalCredits = document.getElementById("modalCredits");
  const modalClassements = document.getElementById("modalClassements");
  
  document.getElementById("openContact")?.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.style.display = "block";
    modalContact.style.display = "block";
  });

  document.getElementById("openCredits")?.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.style.display = "block";
    modalCredits.style.display = "block";
  });

  document.getElementById("openClassements")?.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.style.display = "block";
    modalCredits.style.display = "block";
  });

  overlay?.addEventListener("click", () => {
    overlay.style.display = "none";
    modalContact.style.display = "none";
    modalCredits.style.display = "none";
  });

function checkAnswer(expected, nextPage) {
  const val = document.getElementById("answer")?.value.toLowerCase().trim();
  if (val === expected.toLowerCase().trim()) {
    const video = document.getElementsByClassName("video-histoire");
    if (video) video.style.display = "block";
    setTimeout(() => {
      window.location.href = nextPage;
    }, 8000);
  }
}

  function loadClassement() {
  const tableau = document.querySelector("#classementTable tbody");
  tableau.innerHTML = "";

  let scores = JSON.parse(localStorage.getItem("classement")) || [];

  scores.sort((a, b) => a.time - b.time);

  scores.forEach((entry, index) => {
    const li = document.createElement("li");

    // Attribution des classes selon la position
    if (index === 0) li.classList.add("gold");
    else if (index === 1) li.classList.add("silver");
    else if (index === 2) li.classList.add("bronze");

    li.innerHTML = `<strong>${index + 1}.</strong> ${entry.name} — ${formatTime(entry.time)}`;
    list.appendChild(li);
  });
}
  
function observeLockee(id, callback) {
  const target = document.getElementById(id);
  if (!target) return;
  const observer = new MutationObserver(() => {
    try {
      if (target.contentWindow.document.body.innerText.includes("Bravo!")) {
        callback();
      }
    } catch (e) {}
  });
  setTimeout(() => {
    observer.observe(target, { childList: true, subtree: true });
  }, 5000);
}

});
