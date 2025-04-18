function adicionarTitulo(valor = "") {
  const container = document.getElementById("titulos-container");

  const div = document.createElement("div");
  div.className = "maestria-item";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "titulos[]";
  input.placeholder = "Ex: Caçador de Bestas";
  input.value = valor;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "remove-maestria";
  btn.innerHTML = "🗑️";
  btn.onclick = () => container.removeChild(div);

  div.appendChild(input);
  div.appendChild(btn);
  container.appendChild(div);
}
