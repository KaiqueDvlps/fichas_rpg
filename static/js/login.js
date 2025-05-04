document.addEventListener("DOMContentLoaded", function () {
  // Criar runas mágicas flutuantes
  createFloatingRunes();

  // Efeitos nos inputs
  const inputs = document.querySelectorAll(".input-group input");
  inputs.forEach((input) => {
    // Efeito ao focar
    input.addEventListener("focus", function () {
      this.parentElement.querySelector("label").style.color = "#d4af37";
      this.style.boxShadow = "0 0 15px rgba(212, 175, 55, 0.7)";
    });

    // Efeito ao sair
    input.addEventListener("blur", function () {
      this.parentElement.querySelector("label").style.color = "#d4af37";
      this.style.boxShadow = "none";
    });

    // Efeito de digitação
    input.addEventListener("keyup", function () {
      if (this.value.length > 0) {
        this.style.background = "rgba(30, 58, 138, 0.5)";
      } else {
        this.style.background = "rgba(30, 58, 138, 0.3)";
      }
    });
  });

  // Validação do formulário com efeitos
  const form = document.querySelector(".login-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = this.querySelector('input[name="username"]').value.trim();
    const password = this.querySelector('input[name="senha"]').value.trim();

    // Resetar erros
    document.querySelectorAll(".error-message").forEach((el) => el.remove());

    if (!username || !password) {
      // Efeito de erro
      if (!username) {
        showError(
          this.querySelector('input[name="username"]'),
          "O nome do jogador é obrigatório!"
        );
      }
      if (!password) {
        showError(
          this.querySelector('input[name="senha"]'),
          "A senha do portal é necessária!"
        );
      }

      // Efeito visual de erro
      this.classList.add("shake");
      setTimeout(() => this.classList.remove("shake"), 500);
    } else {
      // Efeito de sucesso antes do submit
      this.classList.add("success");
      setTimeout(() => {
        this.submit();
      }, 1000);
    }
  });

  // Função para mostrar erros com estilo
  function showError(input, message) {
    const error = document.createElement("div");
    error.className = "error-message";
    error.textContent = message;
    error.style.color = "#dc3545";
    error.style.marginTop = "5px";
    error.style.fontSize = "0.9rem";
    error.style.animation = "fadeIn 0.3s ease-out";
    input.parentElement.appendChild(error);

    // Efeito de pulso no input com erro
    input.style.animation = "pulseError 0.5s";
    setTimeout(() => (input.style.animation = ""), 500);
  }

  // Criar runas flutuantes
  function createFloatingRunes() {
    const runes = ["⚔️", "🛡️", "🔮", "🧿", "⚡", "🔥", "❄️", "🌑"];
    const container = document.querySelector("body");

    for (let i = 0; i < 8; i++) {
      const rune = document.createElement("div");
      rune.className = "rune";
      rune.textContent = runes[Math.floor(Math.random() * runes.length)];
      rune.style.left = `${Math.random() * 90 + 5}%`;
      rune.style.top = `${Math.random() * 90 + 5}%`;
      rune.style.animationDuration = `${Math.random() * 10 + 10}s`;
      rune.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(rune);
    }
  }
});

// Adicionando animações ao CSS via JavaScript
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes pulseError {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
    50% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0.3); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  
  .success {
    position: relative;
    overflow: hidden;
  }
  
  .success::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(40,167,69,0.3) 0%, rgba(40,167,69,0) 70%);
    animation: successPulse 1s ease-out;
  }
  
  @keyframes successPulse {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
`;
document.head.appendChild(style);
