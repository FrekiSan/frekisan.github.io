function checkMotDePasseAnswer(inputId, expectedAnswers, onSuccess) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  const userInput = inputEl.value.trim().toLowerCase();
  const match = expectedAnswers.some(ans => userInput === ans.toLowerCase());

  if (match) {
    const inputContainer = document.getElementById("input-container");
    if (inputContainer) inputContainer.style.display = "none";

    const video = document.getElementById("video");
    if (video) video.style.display = "block";

    setTimeout(() => {
      onSuccess();
    }, 12000);
  } else {
    alert("Mot de passe incorrect. Réessaie !");
  }
}