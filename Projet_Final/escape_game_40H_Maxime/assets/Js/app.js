
/**
 * app.js : Logique principale de l'application
 */

document.addEventListener("DOMContentLoaded", () => {
  startGlobalTimer();

  const overlay = document.getElementById("modalOverlay");
  const modalContact = document.getElementById("modalContact");
  const modalCredits = document.getElementById("modalCredits");

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

  overlay?.addEventListener("click", () => {
    overlay.style.display = "none";
    modalContact.style.display = "none";
    modalCredits.style.display = "none";
  });

function checkAnswer(expected, nextPage) {
  const val = document.getElementById("answer")?.value.toLowerCase().trim();
  if (val === expected.toLowerCase().trim()) {
    const video = document.getElementById("video-histoire");
    if (video) video.style.display = "block";
    setTimeout(() => {
      window.location.href = nextPage;
    }, 8000);
  }
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
