document
  .getElementById("btn-salvar-ficha")
  .addEventListener("click", async () => {
    console.log("Botão clicado!");

    const motivoElem = document.getElementById("motivo-edicao");
    const senhaElem = document.getElementById("senha-confirmacao");

    if (!motivoElem || !senhaElem) {
      console.error("Os campos motivo ou senha não foram encontrados no DOM!");
      alert("Os campos motivo ou senha não estão presentes.");
      return;
    }

    const motivo = motivoElem.value;
    const senha = senhaElem.value;

    if (!motivo || !senha) {
      console.log("Motivo ou senha não preenchidos!");
      alert("Preencha o motivo e a senha.");
      return;
    }

    const fichaData = {
      motivo: motivo,
      senha: senha,
      classe: document.querySelector('input[name="classe"]')?.value || "",
      classe_avancada:
        document.querySelector('input[name="classe_avancada"]')?.value || "",
      nivel: document.querySelector('input[name="nivel"]')?.value || "",
      experiencia:
        document.querySelector('input[name="experiencia"]')?.value || "",
      rank: document.querySelector('select[name="rank-select"]')?.value || "",
      lado: document.querySelector('select[name="lado"]')?.value || "",

      maestrias: Array.from(
        document.querySelectorAll("#maestrias-container .maestria-item")
      ).map((item) => ({
        nome: item.querySelector('[name="nome_maestria[]"]')?.value || "",
        treino: item.querySelector('[name="treino[]"]')?.value || "",
        duelo: item.querySelector('[name="duelo[]"]')?.value || "",
        boss: item.querySelector('[name="boss[]"]')?.value || "",
        nivel: item.querySelector('[name="nivel[]"]')?.value || "",
      })),

      tipos_lutador: Array.from(
        document.querySelectorAll("#lutadores-container .tipo-lutador")
      ).map((item) => ({
        tipo: item.querySelector('input[name="tipo_lutador[]"]')?.value || "",
      })),

      equipamentos: {
        cabeca: {
          nome:
            document.querySelector(
              ".equipamento-grupo:nth-child(1) .input-equipamento-nome"
            )?.value || "",
          bonus:
            document.querySelector(
              ".equipamento-grupo:nth-child(1) .input-equipamento-bonus"
            )?.value || "",
        },
        corpo: Array.from(
          document.querySelectorAll(
            ".equipamento-grupo:nth-child(2) .slot-equipamento"
          )
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        // Adicione outros grupos de equipamentos aqui se necessário
      },
    };

    console.log("Dados da ficha:", fichaData);

    try {
      const resposta = await fetch("/salvar_ficha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fichaData),
      });

      const resultado = await resposta.json();

      if (resultado.success) {
        alert(resultado.message);
        // Se quiser redirecionar manualmente
        window.location.href = `/ficha/${fichaData.usuario_id}`;
      } else {
        alert("Erro ao salvar ficha!");
      }
    } catch (err) {
      console.error("Erro de Conexão:", err);
      showCustomAlert(
        "Erro de Conexão",
        "Não foi possível conectar ao servidor: " + err,
        "error"
      );
    }
  });

// Função para mostrar alertas personalizados
function showCustomAlert(title, message, type) {
  const alertBox = document.createElement("div");
  alertBox.className = `custom-alert ${type}`;
  alertBox.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <button onclick="this.parentElement.remove()">OK</button>
  `;
  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 5000);
}
