document.addEventListener("DOMContentLoaded", () => {
  // Função para formatar números inteiros
  const formatNumber = (num) => parseInt(num) || 0;

  // Função para calcular o valor TOTAL de um atributo (base + bônus)
  const calcularValorTotal = (atributoBox) => {
    const base =
      parseFloat(atributoBox.querySelector(".base-input")?.value) || 0;
    const bonuses = Array.from(
      atributoBox.querySelectorAll(".bonus-group")
    ).map((group) => ({
      value: parseFloat(group.querySelector(".bonus-input").value) || 0,
      operation: group.querySelector(".operation-select").value,
    }));

    let total = base;

    bonuses.forEach((bonus) => {
      switch (bonus.operation) {
        case "+":
          total += bonus.value;
          break;
        case "*":
          total *= bonus.value;
          break;
        case "%":
          total += (base * bonus.value) / 100;
          break;
      }
    });

    return total;
  };

  // Função principal para calcular o MP
  const calcularMP = () => {
    const inteligenciaBox = document.querySelector(
      '[data-atributo="inteligencia"]'
    );
    const mpBox = document.querySelector('[data-atributo="mp"]');

    if (!inteligenciaBox || !mpBox) return;

    // Pega o valor TOTAL da inteligência (base + todos bônus)
    const intTotal = calcularValorTotal(inteligenciaBox);
    const totalMP = 100 + intTotal * 100;

    mpBox.querySelector(".mp-value").textContent = formatNumber(totalMP);
  };

  // Configuração dos atributos normais
  document
    .querySelectorAll('.atributo-box:not([data-atributo="mp"])')
    .forEach((box) => {
      const baseInput = box.querySelector(".base-input");
      const bonusContainer = box.querySelector(".bonus-container");
      const btnAddBonus = box.querySelector(".btn-add-bonus");
      const resultadoSpan = box.querySelector(".calc-text");

      // Adicionar bônus
      btnAddBonus?.addEventListener("click", () => {
        const bonusGroup = document.createElement("div");
        bonusGroup.className = "bonus-group";
        bonusGroup.innerHTML = `
        <select class="operation-select">
          <option value="+">+ Soma</option>
          <option value="*">× Mult</option>
          <option value="%">% Porc</option>
        </select>
        <input type="number" class="bonus-input" placeholder="Valor" min="0">
        <button class="remove-bonus">×</button>
      `;

        bonusContainer.appendChild(bonusGroup);

        // Eventos
        const updateEvents = () => {
          calcularAtributo();
          if (box.dataset.atributo === "inteligencia") calcularMP();
        };

        bonusGroup
          .querySelector(".bonus-input")
          .addEventListener("input", updateEvents);
        bonusGroup
          .querySelector(".operation-select")
          .addEventListener("change", updateEvents);
        bonusGroup
          .querySelector(".remove-bonus")
          .addEventListener("click", () => {
            bonusGroup.remove();
            updateEvents();
          });

        updateEvents();
      });

      // Calcular atributo normal
      function calcularAtributo() {
        const total = calcularValorTotal(box);
        const bonuses = Array.from(
          bonusContainer.querySelectorAll(".bonus-group")
        ).map((group) => ({
          value: formatNumber(group.querySelector(".bonus-input").value),
          operation: group.querySelector(".operation-select").value,
        }));

        const operacoes = [formatNumber(baseInput.value || 0)];

        bonuses.forEach((bonus) => {
          operacoes.push(
            `${bonus.operation === "*" ? "×" : bonus.operation} ${bonus.value}${
              bonus.operation === "%" ? "%" : ""
            }`
          );
        });

        resultadoSpan.innerHTML = `${operacoes.join(" ")} = ${formatNumber(
          total
        )}`;
      }

      baseInput.addEventListener("input", () => {
        calcularAtributo();
        if (box.dataset.atributo === "inteligencia") calcularMP();
      });

      calcularAtributo(); // Cálculo inicial
    });

  // Cálculo inicial do MP
  calcularMP();
});
