function setupOrdreClic(correctOrder, successCallback) {
  let currentStep = 0;

  window.handleClick = function(id) {
    if (id === correctOrder[currentStep]) {
      document.getElementById(id).style.border = "2px solid lime";
      currentStep++;

      if (currentStep === correctOrder.length) {
        setTimeout(() => {
          successCallback();
        }, 1000);
      }
    } else {
      alert("Mauvais ordre ! Recommence.");
      resetPuzzle();
    }
  };

  window.resetPuzzle = function() {
    currentStep = 0;
    document.querySelectorAll('.click-zone, .clickable').forEach(zone => {
      zone.style.border = "2px solid transparent";
    });
  };
}