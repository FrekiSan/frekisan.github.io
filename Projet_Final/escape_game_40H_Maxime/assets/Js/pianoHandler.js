function setupPiano(sequence, onSuccess) {
  let userSequence = [];
  const notes = [
    { note: "c", label: "Do" },
    { note: "c#", label: "Do#" },
    { note: "d", label: "Ré" },
    { note: "d#", label: "Ré#" },
    { note: "e", label: "Mi" },
    { note: "f", label: "Fa" },
    { note: "f#", label: "Fa#" },
    { note: "g", label: "Sol" },
    { note: "g#", label: "Sol#" },
    { note: "a", label: "La" },
    { note: "a#", label: "La#" },
    { note: "b", label: "Si" }
  ];

  // Génère le clavier
  const container = document.getElementById("piano-container");
  if (container) {
    container.innerHTML = "";
    notes.forEach(n => {
      const key = document.createElement("div");
      key.className = "key" + (n.note.includes("#") ? " black" : "");
      key.textContent = n.label;
      key.onclick = () => window.pressNote(n.note);
      container.appendChild(key);
    });
  }
  window.pressNote = function(note) {
    userSequence.push(note);
    if (userSequence.length === sequence.length) {
      if (userSequence.join() === sequence.join()) {
        document.getElementById("piano-container").style.display = "none";
        document.getElementById("video").style.display = "block";
        setTimeout(() => {
          onSuccess();
        }, 12000);
      } else {
        alert("Mauvaise séquence !");
        userSequence = [];
      }
    }
  };
}