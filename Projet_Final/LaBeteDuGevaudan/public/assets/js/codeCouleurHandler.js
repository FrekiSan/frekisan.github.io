let selectedColor = null;
let colorSequence = [];
let expectedSequence = [];
let onSuccessCallback = null;

function setupColorCode(expected, callback) {
  expectedSequence = expected;
  onSuccessCallback = callback;
  colorSequence = new Array(expected.length).fill(null);

  document.querySelectorAll('.color-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const index = parseInt(slot.dataset.index);
      if (selectedColor !== null) {
        colorSequence[index] = selectedColor;
        slot.style.backgroundColor = colorNameToCSS(selectedColor);
        checkColorSequence();
      }
    });
  });
}

function pickColor(color) {
  selectedColor = color;
}

function resetColors() {
  selectedColor = null;
  colorSequence = new Array(expectedSequence.length).fill(null);
  document.querySelectorAll('.color-slot').forEach(slot => {
    slot.style.backgroundColor = 'grey';
  });
}

function checkColorSequence() {
  if (colorSequence.includes(null)) return; // toutes les cases ne sont pas remplies
  const isCorrect = expectedSequence.every((val, i) => val === colorSequence[i]);
  if (isCorrect) {
    document.getElementById("color-selector").style.display = "none";
    document.getElementById("video").style.display = "block";
    setTimeout(() => {
      onSuccessCallback();
    }, 12000);
  }
}

function colorNameToCSS(nom) {
  const couleurs = {
    rouge: "red",
    orange: "orange",
    jaune: "yellow",
    vert: "green",
    bleu: "blue",
    violet: "violet",
    indigo: "indigo",
    rose: "pink",
    marron: "brown",
    gris: "grey",
    noir: "black",
    blanc: "white"
  };
  return couleurs[nom] || "grey";
}
