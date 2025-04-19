document.addEventListener("DOMContentLoaded", () => {
  const slotsComLimite = {
    acessorios: {
      limiteTipo: 2,
      container: document.getElementById("container-acessorios"),
    },
  };

  // Sistema de alerta personalizado (mantido igual)
  const customAlert = {
    overlay: document.getElementById("custom-alert-overlay"),
    message: document.getElementById("custom-alert-message"),
    button: document.getElementById("custom-alert-button"),

    show: function (message, title = "Atenção") {
      document.querySelector(".custom-alert-title").textContent = title;
      this.message.textContent = message;
      this.overlay.classList.add("show");
      this.button.focus();
    },

    hide: function () {
      this.overlay.classList.remove("show");
    },

    init: function () {
      this.button.addEventListener("click", () => this.hide());
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.hide();
      });
    },
  };

  customAlert.init();

  // Função para criar slot de equipamento (mantendo suas classes originais)
  function criarSlotEquipamento() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("slot-equipamento");

    const inputNome = document.createElement("input");
    inputNome.placeholder = "Nome do item";
    inputNome.className = "input-equipamento-nome";

    const inputBonus = document.createElement("input");
    inputBonus.placeholder = "Bônus (ex: +15)";
    inputBonus.className = "input-equipamento-bonus";

    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = "🗑️";
    btnRemover.className = "remove-maestria"; // Mantida sua classe original
    btnRemover.onclick = () => wrapper.remove();

    inputNome.addEventListener("input", (e) => {
      const tipo = e.target.value.trim().toLowerCase();
      if (
        tipo.includes("anel da associação") ||
        tipo.includes("anel da associacao")
      ) {
        wrapper.setAttribute("data-is-special", "true");
      } else {
        wrapper.removeAttribute("data-is-special");
      }
    });

    wrapper.append(inputNome, inputBonus, btnRemover);
    return wrapper;
  }

  // Função para criar item de apoio (mantendo o estilo que você quer)
  function criarItemApoio() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("slot-equipamento", "item-apoio-wrapper");

    const inputNome = document.createElement("input");
    inputNome.placeholder = "Item de apoio";
    inputNome.className = "input-item-apoio-nome";

    const separador = document.createElement("span");
    separador.className = "item-apoio-separador";
    separador.textContent = " ";

    const inputDescricao = document.createElement("input");
    inputDescricao.placeholder = "Descrição";
    inputDescricao.className = "input-item-apoio-descricao";

    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = "🗑️";
    btnRemover.className = "remove-maestria"; // Mantida sua classe original
    btnRemover.onclick = () => wrapper.remove();

    wrapper.append(inputNome, separador, inputDescricao, btnRemover);
    return wrapper;
  }

  // Funções de adicionar itens (mantidas iguais)
  function adicionarItemApoio() {
    const container = document.getElementById("container-itemapoio");
    container.appendChild(criarItemApoio());
  }

  function adicionarAcessorio() {
    const container = slotsComLimite.acessorios.container;
    const acessorios = container.querySelectorAll(".slot-equipamento");

    const anelAssociacaoExists = Array.from(acessorios).some((slot) => {
      const nomeItem = slot
        .querySelector(".input-equipamento-nome")
        .value.trim()
        .toLowerCase();
      return (
        nomeItem.includes("anel da associação") ||
        nomeItem.includes("anel da associacao")
      );
    });

    if (anelAssociacaoExists) {
      customAlert.show("Você só pode ter um Anel da Associação");
      return;
    }

    const novoSlot = criarSlotEquipamento();
    const inputNome = novoSlot.querySelector(".input-equipamento-nome");

    inputNome.addEventListener("input", () => {
      const tipo = inputNome.value.trim().toLowerCase();
      if (
        tipo.includes("anel da associação") ||
        tipo.includes("anel da associacao")
      )
        return;

      const tiposContagem = {};
      acessorios.forEach((slot) => {
        const itemTipo = slot
          .querySelector(".input-equipamento-nome")
          .value.trim()
          .toLowerCase();
        if (
          !itemTipo ||
          itemTipo.includes("anel da associação") ||
          itemTipo.includes("anel da associacao")
        )
          return;
        tiposContagem[itemTipo] = (tiposContagem[itemTipo] || 0) + 1;
      });

      const count = tiposContagem[tipo] || 0;
      if (count >= slotsComLimite.acessorios.limiteTipo) {
        customAlert.show(
          `Você só pode ter até ${slotsComLimite.acessorios.limiteTipo} acessórios do tipo "${tipo}"`
        );
        inputNome.value = "";
      }
    });

    container.appendChild(novoSlot);
  }

  // Ativadores dos botões (mantendo suas classes originais)
  document
    .getElementById("btn-add-acessorio")
    ?.addEventListener("click", adicionarAcessorio);
  document
    .getElementById("btn-add-itemapoio")
    ?.addEventListener("click", adicionarItemApoio);
});
