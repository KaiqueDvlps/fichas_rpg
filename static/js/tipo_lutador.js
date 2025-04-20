document.addEventListener("DOMContentLoaded", function () {
  const btnAdicionar = document.getElementById("btn-adicionar-lutador");
  const container = document.getElementById("lutadores-container");
  let campoAtual = null; // Armazena a referência do campo atual

  if (btnAdicionar && container) {
    btnAdicionar.addEventListener("click", function () {
      if (!campoAtual) {
        // Só adiciona se não existir campo
        adicionarCampoLutador();

        // Efeito visual ao adicionar
        btnAdicionar.style.transform = "scale(0.95)";
        setTimeout(() => {
          btnAdicionar.style.transform = "scale(1)";
        }, 100);
      }
    });
  }

  function adicionarCampoLutador() {
    // Remove campo existente antes de criar novo (segurança extra)
    if (campoAtual) {
      campoAtual.remove();
    }

    const div = document.createElement("div");
    div.className = "campo-dinamico";
    campoAtual = div; // Armazena referência do novo campo

    const input = document.createElement("input");
    input.type = "text";
    input.name = "tipo_lutador";
    input.placeholder = "Ex: Mago";
    input.className = "input-lutador";

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.innerHTML = "🗑️";
    btnRemover.className = "btn-remover";

    btnRemover.addEventListener("click", function (e) {
      // Cria efeito de onda
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      this.appendChild(ripple);

      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      setTimeout(() => {
        ripple.remove();
        div.remove();
        campoAtual = null; // Limpa a referência ao remover
      }, 300);
    });

    div.appendChild(input);
    div.appendChild(btnRemover);
    container.appendChild(div);
    input.focus();
  }
});
