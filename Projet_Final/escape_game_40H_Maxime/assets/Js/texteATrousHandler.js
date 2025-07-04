function checkTexteATrous(answers, onSuccess) {
  const val1 = document.getElementById("input1").value.trim().toLowerCase();
  const val2 = document.getElementById("input2").value.trim().toLowerCase();
  const val3 = document.getElementById("input3").value.trim().toLowerCase();

  if (val1 === answers[0] && val2 === answers[1] && val3 === answers[2]) {
    document.getElementById("puzzle").style.display = "none";
    document.getElementById("video").style.display = "block";
    setTimeout(() => {
      onSuccess();
    }, 12000);
  } else {
    alert("Mauvaises réponses !");
  }
}