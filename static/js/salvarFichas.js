document
  .getElementById("btn-salvar-ficha")
  .addEventListener("click", async () => {
    console.log("Botão clicado!");

    const motivo = document.getElementById("motivo-edicao")?.value || "";
    const senha = document.getElementById("senha-confirmacao")?.value || "";

    if (!motivo || !senha) {
      alert("Preencha o motivo e a senha.");
      return;
    }

    const fichaData = {
      motivo,
      senha,
      classe: document.querySelector('input[name="classe"]')?.value || "",
      classe_avancada:
        document.querySelector('input[name="classe_avancada"]')?.value || "",
      nivel: document.querySelector('input[name="nivel"]')?.value || "",
      experiencia: Number(
        document.querySelector('input[name="experiencia"]')?.value || 0
      ),
      rank: document.querySelector('select[name="rank"]')?.value || "",
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

      tipos_lutador: [
        {
          tipo:
            document.querySelector('input[name="tipo_lutador[]"]')?.value || "",
        },
      ],

      titulos: Array.from(
        document.querySelectorAll("#titulos-container .titulo-item")
      ).map((item) => ({
        nome: item.querySelector("input")?.value || "",
      })),

      passivas: Array.from(
        document.querySelectorAll("#passivas-container .passiva-item")
      ).map((item) => ({
        nome: item.querySelector("input")?.value || "",
      })),

      habilidades: Array.from(
        document.querySelectorAll("#habilidades-container .habilidade-item")
      ).map((item) => ({
        nome: item.querySelector("input")?.value || "",
      })),

      atributos: Array.from(document.querySelectorAll(".atributo-box")).map(
        (box) => ({
          nome: box.dataset.atributo,
          base: box.querySelector(".base-input")?.value || "0",
          bonus: Array.from(box.querySelectorAll(".bonus-container input")).map(
            (input) => input.value || "0"
          ),
        })
      ),

      equipamentos: {
        cabeca: {
          nome:
            document.querySelector("#slot-cabeca .input-equipamento-nome")
              ?.value || "",
          bonus:
            document.querySelector("#slot-cabeca .input-equipamento-bonus")
              ?.value || "",
        },
        corpo: Array.from(
          document.querySelectorAll("#slot-corpo .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        acessorios: Array.from(
          document.querySelectorAll("#container-acessorios .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        apoio: Array.from(
          document.querySelectorAll("#container-itemapoio .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          descricao:
            item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        pernas: Array.from(
          document.querySelectorAll("#slot-pernas .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        pes: Array.from(
          document.querySelectorAll("#slot-pes .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        maos: Array.from(
          document.querySelectorAll("#slot-maos .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
        armas: Array.from(
          document.querySelectorAll("#slot-armas .slot-equipamento")
        ).map((item) => ({
          nome: item.querySelector(".input-equipamento-nome")?.value || "",
          bonus: item.querySelector(".input-equipamento-bonus")?.value || "",
        })),
      },

      inventario: {
        wons: document.getElementById("wons")?.value || "0",
        itens: Array.from(
          document.querySelectorAll("#lista-itens .item-inventario")
        ).map((item) => ({
          nome: item.querySelector("input")?.value || "",
        })),
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
        window.location.href = `/ficha/${resultado.usuario_id}`;
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
