let currentSequence = [];
let expectedSequence = [];
let successCallback = null;

function setupFleches(sequence, onSuccess) {
  expectedSequence = sequence;
  successCallback = onSuccess;
  currentSequence = [];
  updateSequenceDisplay();
}

function addDirection(direction) {
  currentSequence.push(direction);
  updateSequenceDisplay();
}

function resetFleches() {
  currentSequence = [];
  updateSequenceDisplay();
}

function validateFleches() {
  const isCorrect = currentSequence.length === expectedSequence.length &&
    currentSequence.every((val, index) => val === expectedSequence[index]);

  if (isCorrect) {
    document.getElementById("arrows").style.display = "none";
    document.getElementById("video").style.display = "block";
    setTimeout(() => {
      successCallback();
    }, 12000);
  } else {
    alert("Mauvaise combinaison !");
  }
}

function updateSequenceDisplay() {
  const display = document.getElementById("sequence-affichee");
  display.textContent = currentSequence.join(" → ");
}