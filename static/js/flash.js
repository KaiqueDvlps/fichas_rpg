window.addEventListener("DOMContentLoaded", (event) => {
  setTimeout(function () {
    const alert = document.getElementById("flash-alert");
    if (alert) {
      // Adiciona a classe de fade para desaparecer suavemente
      alert.classList.add("fade");
      alert.classList.remove("show");

      // Após 1 segundo, remove o alerta da DOM
      setTimeout(function () {
        alert.remove();
      }, 1000); // Tempo para a animação de desaparecer
    }
  }, 5000); // Tempo de 5 segundos antes de começar a desaparecer
});
