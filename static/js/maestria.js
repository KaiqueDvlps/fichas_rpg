document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("add-maestria");
  const container = document.getElementById("maestrias-container");

  if (addBtn && container) {
    addBtn.addEventListener("click", function () {
      const item = document.createElement("div");
      item.className = "maestria-item";
      item.innerHTML = `
                <input type="text" name="nome_maestria[]" placeholder="Nome da Maestria">
                <input type="text" name="treino[]" placeholder="Treino (Ex: 0/20)">
                <input type="text" name="duelo[]" placeholder="Duelo (Ex: 0/5)">
                <input type="text" name="boss[]" placeholder="Boss (Ex: 0/3)">
                <input type="text" name="nivel[]" placeholder="Nível (Ex: 1)">
                <button type="button" class="remove-maestria" onclick="removerMaestria(this)">🗑️</button>
            `;
      container.appendChild(item);
    });
  }
});

function removerMaestria(btn) {
  btn.parentElement.remove();
}
