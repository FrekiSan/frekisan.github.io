function checkZoneTexteAnswer(inputId, expectedAnswers, onSuccess) {
  const input = document.getElementById(inputId).value.trim().toLowerCase();
  const isCorrect = expectedAnswers.some(ans => input === ans.toLowerCase());

  if (isCorrect) {
    const image = document.getElementById("image");
    if (image) image.style.display = "none";
    document.getElementById("input-container").style.display = "none";
    document.getElementById("video").style.display = "block";
    setTimeout(() => {
      onSuccess();
    }, 12000);
  } else {
    alert("Mauvaise réponse. Réessaie !");
  }
}