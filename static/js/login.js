// Validação do Formulário
document.querySelector(".login-form").addEventListener("submit", function (e) {
  const username = this.querySelector('input[name="username"]').value.trim();
  const password = this.querySelector('input[name="senha"]').value.trim();

  if (!username || !password) {
    e.preventDefault();
    alert("Por favor, preencha todos os campos!");
  }
});

// Efeitos de Foco nos Inputs
const inputs = document.querySelectorAll(".input-group input");
inputs.forEach((input) => {
  input.addEventListener("focus", function () {
    this.style.borderColor = "#4a6cf7";
    this.parentElement.style.transform = "scale(1.02)";
  });

  input.addEventListener("blur", function () {
    this.style.borderColor = "#ddd";
    this.parentElement.style.transform = "scale(1)";
  });
});
