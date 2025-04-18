function adicionarTipoLutador(valor = "") {
  const container = document.getElementById("lutadores-container");

  const div = document.createElement("div");
  div.className = "campo-dinamico";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "tipos_lutador[]";
  input.placeholder = "Ex: Mago";
  input.value = valor;

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.textContent = "🗑️";
  btnRemover.className = "btn-remover";
  btnRemover.onclick = () => div.remove();

  div.appendChild(input);
  div.appendChild(btnRemover);
  container.appendChild(div);
}
