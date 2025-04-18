function adicionarHabilidade(valor = "") {
  const container = document.getElementById("habilidades-container");

  const div = document.createElement("div");
  div.classList.add("maestria-item");

  const input = document.createElement("input");
  input.type = "text";
  input.name = "habilidades[]";
  input.placeholder = "Ex: Bola de Fogo";
  input.value = valor;

  const btnRemover = document.createElement("button");
  btnRemover.className = "remove-maestria";
  btnRemover.innerHTML = "🗑️";
  btnRemover.onclick = () => container.removeChild(div);

  div.appendChild(input);
  div.appendChild(btnRemover);
  container.appendChild(div);
}
