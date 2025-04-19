document.addEventListener("DOMContentLoaded", function () {
  // Elementos do modal
  const promptOverlay = document.getElementById("custom-prompt-overlay");
  const btnYes = document.getElementById("custom-prompt-yes");
  const btnNo = document.getElementById("custom-prompt-no");

  // Variável para armazenar a resposta
  let consumivelResponse = null;
  let resolvePrompt = null;

  // Função para mostrar o prompt personalizado
  function showCustomPrompt() {
    return new Promise((resolve) => {
      resolvePrompt = resolve;
      promptOverlay.style.display = "flex";
    });
  }

  // Event listeners para os botões
  btnYes.addEventListener("click", () => {
    consumivelResponse = true;
    promptOverlay.style.display = "none";
    if (resolvePrompt) resolvePrompt(true);
  });

  btnNo.addEventListener("click", () => {
    consumivelResponse = false;
    promptOverlay.style.display = "none";
    if (resolvePrompt) resolvePrompt(false);
  });

  // Adiciona evento ao botão de adicionar item
  document
    .querySelector(".btn-add-item")
    .addEventListener("click", async function () {
      const isConsumivel = await showCustomPrompt();
      adicionarItem(isConsumivel);
    });

  // Controle do input de Wons
  const inputWons = document.getElementById("wons");

  window.incrementar = function () {
    inputWons.stepUp();
  };

  window.decrementar = function () {
    if (inputWons.value > 0) {
      inputWons.stepDown();
    }
  };

  // Adiciona evento de teclado para o input de Wons
  inputWons.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      incrementar();
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      decrementar();
      e.preventDefault();
    }
  });
});

async function adicionarItem(isConsumivel) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item-inventario");

  const nomeInput = document.createElement("input");
  nomeInput.type = "text";
  nomeInput.placeholder = "Nome do item";
  nomeInput.classList.add("input-item-inventario");

  if (isConsumivel) {
    const consumivelContainer = document.createElement("div");
    consumivelContainer.classList.add("consumivel-container");

    // Cria elementos para quantidade total
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("quantidade-container");

    const totalLabel = document.createElement("label");
    totalLabel.textContent = "Total:";

    const totalInputContainer = document.createElement("div");
    totalInputContainer.classList.add("number-input-container");

    const totalInput = document.createElement("input");
    totalInput.type = "number";
    totalInput.value = "1";
    totalInput.min = "1";
    totalInput.classList.add("input-quantidade");

    const totalArrows = document.createElement("div");
    totalArrows.classList.add("number-input-arrows");

    const totalUp = document.createElement("button");
    totalUp.classList.add("arrow-up");
    totalUp.type = "button";

    const totalDown = document.createElement("button");
    totalDown.classList.add("arrow-down");
    totalDown.type = "button";

    // Cria elementos para quantidade usada
    const usadoDiv = document.createElement("div");
    usadoDiv.classList.add("quantidade-container");

    const usadoLabel = document.createElement("label");
    usadoLabel.textContent = "Usado:";

    const usadoInputContainer = document.createElement("div");
    usadoInputContainer.classList.add("number-input-container");

    const usadoInput = document.createElement("input");
    usadoInput.type = "number";
    usadoInput.value = "0";
    usadoInput.min = "0";
    usadoInput.classList.add("input-quantidade");

    const usadoArrows = document.createElement("div");
    usadoArrows.classList.add("number-input-arrows");

    const usadoUp = document.createElement("button");
    usadoUp.classList.add("arrow-up");
    usadoUp.type = "button";

    const usadoDown = document.createElement("button");
    usadoDown.classList.add("arrow-down");
    usadoDown.type = "button";

    // Contador e botão de reverter
    const contador = document.createElement("span");
    contador.classList.add("contador");
    contador.textContent = "0/1";

    const btnReverter = document.createElement("button");
    btnReverter.innerHTML = "&#x21bb;";
    btnReverter.title = "Reverter";
    btnReverter.classList.add("btn-reverter");
    btnReverter.style.display = "none";

    // Função para atualizar o contador
    function atualizarContador() {
      const total = parseInt(totalInput.value) || 1;
      const usado = parseInt(usadoInput.value) || 0;
      contador.textContent = `${usado}/${total}`;

      if (usado >= total && total > 0) {
        btnReverter.style.display = "inline-block";
      } else {
        btnReverter.style.display = "none";
      }
    }

    // Event listeners para os controles de total
    totalUp.addEventListener("click", () => {
      totalInput.stepUp();
      atualizarContador();
    });

    totalDown.addEventListener("click", () => {
      if (totalInput.value > 1) {
        totalInput.stepDown();
        atualizarContador();
      }
    });

    // Event listeners para os controles de usado
    usadoUp.addEventListener("click", () => {
      usadoInput.stepUp();
      atualizarContador();
    });

    usadoDown.addEventListener("click", () => {
      if (usadoInput.value > 0) {
        usadoInput.stepDown();
        atualizarContador();
      }
    });

    // Input listeners
    totalInput.addEventListener("input", atualizarContador);
    usadoInput.addEventListener("input", atualizarContador);

    // Monta a estrutura de total
    totalArrows.appendChild(totalUp);
    totalArrows.appendChild(totalDown);
    totalInputContainer.appendChild(totalInput);
    totalInputContainer.appendChild(totalArrows);
    totalDiv.appendChild(totalLabel);
    totalDiv.appendChild(totalInputContainer);

    // Monta a estrutura de usado
    usadoArrows.appendChild(usadoUp);
    usadoArrows.appendChild(usadoDown);
    usadoInputContainer.appendChild(usadoInput);
    usadoInputContainer.appendChild(usadoArrows);
    usadoDiv.appendChild(usadoLabel);
    usadoDiv.appendChild(usadoInputContainer);

    // Botão de remover
    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = "🗑️";
    btnRemover.classList.add("btn-remover-item");
    btnRemover.addEventListener("click", () => {
      itemDiv.remove();
    });

    // Event listener para reverter
    btnReverter.addEventListener("click", () => {
      usadoInput.value = totalInput.value;
      atualizarContador();
      btnReverter.style.display = "none";
    });

    // Adiciona todos os elementos ao container
    consumivelContainer.appendChild(totalDiv);
    consumivelContainer.appendChild(usadoDiv);
    consumivelContainer.appendChild(contador);
    consumivelContainer.appendChild(btnReverter);

    itemDiv.appendChild(nomeInput);
    itemDiv.appendChild(consumivelContainer);
    itemDiv.appendChild(btnRemover);
  } else {
    // Para itens não consumíveis
    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = "🗑️";
    btnRemover.classList.add("btn-remover-item");
    btnRemover.addEventListener("click", () => {
      itemDiv.remove();
    });

    itemDiv.appendChild(nomeInput);
    itemDiv.appendChild(btnRemover);
  }

  document.getElementById("lista-itens").appendChild(itemDiv);
}
