function checkZoneTexteAnswer(inputId, expectedAnswers, onSuccess) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const userInput = input.value.trim().toLowerCase();
  const isCorrect = expectedAnswers.some(ans => userInput === ans.toLowerCase());

  if (isCorrect) {
    const inputContainer = document.getElementById("input-container");
    if (inputContainer) inputContainer.style.display = "none";

    const video = document.getElementById("video");
    if (video) video.style.display = "block";

    //Redirection immédiate SANS délai
    onSuccess();
  } else {
    alert("Mauvaise réponse. Réessaie !");
  }
}
