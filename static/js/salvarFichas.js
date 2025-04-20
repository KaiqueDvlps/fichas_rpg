document
  .getElementById("btn-salvar-ficha")
  .addEventListener("click", async () => {
    const motivo = document.getElementById("motivo-edicao").value;
    const senha = document.getElementById("senha-confirmacao").value;

    if (!motivo || !senha) {
      alert("Preencha o motivo e a senha.");
      return;
    }

    // Exemplo de dados que você precisa capturar:
    const fichaData = {
      motivo: motivo,
      senha: senha,
      classe: document.querySelector('input[name="classe"]').value,
      classe_avancada: document.querySelector('input[name="classe_avancada"]')
        .value,
      nivel: document.querySelector('input[name="nivel"]').value,
      experiencia: document.querySelector('input[name="nivel-input"]').value,
      rank: document.querySelector('select[name="rank-select"]').value,
      lado: document.querySelector('select[name="lado"]').value,
      wons: document.querySelector("#wons").value,
      // Você pode continuar com outros campos dinâmicos abaixo
      maestrias: [],
      titulos: [],
      passivas: [],
      habilidades: [],
      equipamentos: [],
      atributos: {},
    };

    // Pegando maestrias
    document
      .querySelectorAll("#maestrias-container .maestria-item")
      .forEach((item) => {
        fichaData.maestrias.push({
          nome: item.querySelector('[name="nome_maestria[]"]').value,
          treino: item.querySelector('[name="treino[]"]').value,
          duelo: item.querySelector('[name="duelo[]"]').value,
          boss: item.querySelector('[name="boss[]"]').value,
          nivel: item.querySelector('[name="nivel[]"]').value,
        });
      });

    // Pegando atributos
    document.querySelectorAll(".atributo-box").forEach((box) => {
      const nome = box.getAttribute("data-atributo");
      const base = box.querySelector(".base-input")?.value || 0;
      fichaData.atributos[nome] = { base: base };
    });

    // (Repita para lutador, titulos, passivas, habilidades, equipamentos e inventário)

    // Envio via fetch
    try {
      const resposta = await fetch("/salvar_ficha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fichaData),
      });

      const result = await resposta.json();
      if (resposta.ok) {
        alert("Ficha salva com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao salvar: " + result.mensagem);
      }
    } catch (err) {
      alert("Erro de conexão: " + err);
    }
  });
