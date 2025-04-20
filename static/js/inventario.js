document.addEventListener("DOMContentLoaded", function () {
  // Elementos do modal
  const promptOverlay = document.getElementById("custom-prompt-overlay");
  const btnYes = document.getElementById("custom-prompt-yes");
  const btnNo = document.getElementById("custom-prompt-no");

  // Função para mostrar o prompt personalizado
  function showCustomPrompt() {
    return new Promise((resolve) => {
      promptOverlay.style.display = "flex";

      // Limpa a resposta anterior quando o modal é aberto novamente
      btnYes.onclick = () => {
        promptOverlay.style.display = "none";
        resolve(true);
      };

      btnNo.onclick = () => {
        promptOverlay.style.display = "none";
        resolve(false);
      };
    });
  }

  // Adiciona evento ao botão de adicionar item
  document
    .querySelector(".btn-add-item")
    .addEventListener("click", async function () {
      const isConsumivel = await showCustomPrompt();
      adicionarItem(isConsumivel);
    });

  // Controle do input de Wons
  const inputWons = document.getElementById("wons");
  inputWons.value = 0; // Define valor inicial como 0

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

  // Container de ações (lixeira + seta)
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("item-actions");

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
    totalUp.innerHTML = "↑";

    const totalDown = document.createElement("button");
    totalDown.classList.add("arrow-down");
    totalDown.type = "button";
    totalDown.innerHTML = "↓";

    // Cria elementos para quantidade usada
    const usadoDiv = document.createElement("div");
    usadoDiv.classList.add("quantidade-container");

    const usadoLabel = document.createElement("label");
    usadoLabel.textContent = "Usado:";

    const usadoInputContainer = document.createElement("div");
    usadoInputContainer.classList.add("number-input-container");

    const usadoInput = document.createElement("input");
    usadoInput.type = "number";
    usadoInput.value = "0"; // Valor inicial 0
    usadoInput.min = "0";
    usadoInput.classList.add("input-quantidade");

    const usadoArrows = document.createElement("div");
    usadoArrows.classList.add("number-input-arrows");

    const usadoUp = document.createElement("button");
    usadoUp.classList.add("arrow-up");
    usadoUp.type = "button";
    usadoUp.innerHTML = "↑";

    const usadoDown = document.createElement("button");
    usadoDown.classList.add("arrow-down");
    usadoDown.type = "button";
    usadoDown.innerHTML = "↓";

    // Contador e botão de reverter
    const contador = document.createElement("span");
    contador.classList.add("contador");
    contador.textContent = "0/1";

    const btnReverter = document.createElement("button");
    btnReverter.innerHTML = "&#x21bb;";
    btnReverter.title = "Reverter";
    btnReverter.classList.add("btn-reverter");
    btnReverter.style.display = "none";

    // Função para atualizar o contador com validação
    function atualizarContador() {
      let total = parseInt(totalInput.value) || 1;
      let usado = parseInt(usadoInput.value) || 0;

      // Impede de usar mais do que tem
      if (usado > total) {
        usado = total;
        usadoInput.value = total;
      }

      contador.textContent = `${usado}/${total}`;

      // Mostra botão de reverter quando usado = total
      if (usado >= total && total > 0) {
        btnReverter.style.display = "inline-block";

        // ZERA TUDO (TOTAL E USADO) quando usado = total
        setTimeout(() => {
          totalInput.value = 0;
          usadoInput.value = 0;
          contador.textContent = "0/0";
          btnReverter.style.display = "none";
        }, 1000);
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
        // Ajusta usado se necessário
        if (parseInt(usadoInput.value) > parseInt(totalInput.value)) {
          usadoInput.value = totalInput.value;
        }
        atualizarContador();
      }
    });

    // Event listeners para os controles de usado
    usadoUp.addEventListener("click", () => {
      const total = parseInt(totalInput.value) || 1;
      const usado = parseInt(usadoInput.value) || 0;

      if (usado < total) {
        usadoInput.stepUp();
        atualizarContador();
      }
    });

    usadoDown.addEventListener("click", () => {
      if (usadoInput.value > 0) {
        usadoInput.stepDown();
        atualizarContador();
      }
    });

    // Input listeners com validação
    totalInput.addEventListener("input", () => {
      if (totalInput.value < 1) totalInput.value = 1;
      atualizarContador();
    });

    usadoInput.addEventListener("input", () => {
      const total = parseInt(totalInput.value) || 1;
      if (usadoInput.value < 0) usadoInput.value = 0;
      if (usadoInput.value > total) usadoInput.value = total;
      atualizarContador();
    });

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

    // Botão de ação (seta)
    const btnAction = document.createElement("button");
    btnAction.innerHTML = "➔";
    btnAction.classList.add("item-action-arrow");
    btnAction.addEventListener("click", () => {
      // Lógica para ações adicionais pode ser adicionada aqui
      console.log("Ação adicional para o item");
    });

    // Event listener para reverter
    btnReverter.addEventListener("click", () => {
      usadoInput.value = 0;
      atualizarContador();
    });

    // Adiciona todos os elementos ao container
    consumivelContainer.appendChild(totalDiv);
    consumivelContainer.appendChild(usadoDiv);
    consumivelContainer.appendChild(contador);
    consumivelContainer.appendChild(btnReverter);

    itemDiv.appendChild(nomeInput);
    itemDiv.appendChild(consumivelContainer);

    // Adiciona botões de ação
    actionsDiv.appendChild(btnAction);
    actionsDiv.appendChild(btnRemover);
    itemDiv.appendChild(actionsDiv);
  } else {
    // Para itens não consumíveis
    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = "🗑️";
    btnRemover.classList.add("btn-remover-item");
    btnRemover.addEventListener("click", () => {
      itemDiv.remove();
    });

    // Botão de ação (seta)
    const btnAction = document.createElement("button");
    btnAction.innerHTML = "➔";
    btnAction.classList.add("item-action-arrow");
    btnAction.addEventListener("click", () => {
      // Lógica para ações adicionais pode ser adicionada aqui
      console.log("Ação adicional para o item");
    });

    itemDiv.appendChild(nomeInput);

    // Adiciona botões de ação
    actionsDiv.appendChild(btnAction);
    actionsDiv.appendChild(btnRemover);
    itemDiv.appendChild(actionsDiv);
  }

  document.getElementById("lista-itens").appendChild(itemDiv);
}
