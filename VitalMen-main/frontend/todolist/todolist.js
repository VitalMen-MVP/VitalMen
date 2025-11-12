const board = document.getElementById("board");
const addListBtn = document.getElementById("addListBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let itemToDelete = null;

// === LISTAS INICIAIS ===
createList("A Fazer");
createList("Concluídas");

// Criar nova lista
addListBtn.addEventListener("click", () => {
  const name = prompt("Nome da nova lista:");
  if (name) createList(name);
});

// === CRIAR LISTA ===
function createList(title) {
  const list = document.createElement("div");
  list.classList.add("list");
  list.draggable = true;

  list.innerHTML = `
    <div class="list-header">
      <span class="list-title" contenteditable="true">${title}</span>
      <div class="list-actions">
        <button class="list-color-btn" title="Mudar cor">🎨</button>
        <button class="delete-list" title="Excluir lista">🗑️</button>
      </div>
    </div>
    <div class="task-list"></div>
    <button class="add-task-btn">+ Adicionar Tarefa</button>
  `;

  const taskList = list.querySelector(".task-list");

  // Adicionar tarefa
  list.querySelector(".add-task-btn").addEventListener("click", () => {
    const text = prompt("Nova tarefa:");
    if (text) createTask(taskList, text);
  });

  // Alterar cor da lista (abre color picker)
  const colorBtn = list.querySelector(".list-color-btn");
  colorBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "color";
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();
    input.addEventListener("input", e => {
      list.style.background = e.target.value;
    });
    input.addEventListener("change", () => {
      input.remove();
    });
    // remove também se o usuário cancelar (blur)
    input.addEventListener("blur", () => {
      try { input.remove(); } catch(e){}
    });
  });

  // Excluir lista (com confirmação)
  const deleteBtn = list.querySelector(".delete-list");
  deleteBtn.addEventListener("click", () => {
    const curTitle = list.querySelector(".list-title").textContent.trim();
    itemToDelete = list;
    confirmText.textContent = `Deseja realmente excluir a lista "${curTitle}"?`;
    confirmModal.style.display = "flex";
  });

  enableListDrag(list);
  enableTaskDrop(taskList);

  board.appendChild(list);
}

// === CRIAR TAREFA ===
function createTask(taskList, text) {
  const task = document.createElement("div");
  task.classList.add("task");
  task.draggable = true;

  task.innerHTML = `
    <div>
      <input type="checkbox" class="done">
      <span class="task-text">${text}</span>
    </div>
    <div class="task-actions">
      <button class="edit-task" title="Editar">✏️</button>
      <button class="delete-task" title="Excluir">🗑️</button>
    </div>
  `;

  // Editar
  task.querySelector(".edit-task").addEventListener("click", () => {
    const current = task.querySelector(".task-text").textContent;
    const newText = prompt("Editar tarefa:", current);
    if (newText !== null) task.querySelector(".task-text").textContent = newText;
  });

  // Excluir (com confirmação)
  task.querySelector(".delete-task").addEventListener("click", () => {
    const textPreview = task.querySelector(".task-text").textContent;
    itemToDelete = task;
    confirmText.textContent = `Deseja realmente excluir a tarefa "${textPreview}"?`;
    confirmModal.style.display = "flex";
  });

  // Concluir (checkbox)
  const checkbox = task.querySelector(".done");
  checkbox.addEventListener("change", () => handleTaskStatusChange(task, checkbox));

  enableTaskDrag(task);
  taskList.appendChild(task);
}

// === MOVER TAREFA ENTRE LISTAS ===
function handleTaskStatusChange(task, checkbox) {
  const textEl = task.querySelector(".task-text");

  const listaConcluidas = [...document.querySelectorAll(".list-title")]
    .find(el => el.textContent.trim().toLowerCase() === "concluídas");
  const listaAFazer = [...document.querySelectorAll(".list-title")]
    .find(el => el.textContent.trim().toLowerCase() === "a fazer");

  if (checkbox.checked) {
    // Marcar como concluída (estilo)
    textEl.style.textDecoration = "line-through";
    textEl.style.opacity = "0.6";
    task.classList.add("completed");

    if (listaConcluidas) {
      const destino = listaConcluidas.closest(".list").querySelector(".task-list");
      destino.appendChild(task);
    }
  } else {
    // Reverter
    textEl.style.textDecoration = "none";
    textEl.style.opacity = "1";
    task.classList.remove("completed");

    if (listaAFazer) {
      const destino = listaAFazer.closest(".list").querySelector(".task-list");
      destino.appendChild(task);
    }
  }
}

// === MODAL DE CONFIRMAÇÃO ===
confirmYes.onclick = () => {
  if (itemToDelete) itemToDelete.remove();
  confirmModal.style.display = "none";
  itemToDelete = null;
};

confirmNo.onclick = () => {
  confirmModal.style.display = "none";
  itemToDelete = null;
};

// === DRAG TASKS ===
function enableTaskDrag(task) {
  task.addEventListener("dragstart", () => task.classList.add("dragging"));
  task.addEventListener("dragend", () => task.classList.remove("dragging"));
}

function enableTaskDrop(taskList) {
  // permite drop mesmo em area vazia e posiciona corretamente
  taskList.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".task.dragging");
    if (!dragging) return;

    // calcula o elemento após o cursor verticalmente
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) taskList.appendChild(dragging);
    else taskList.insertBefore(dragging, afterElement);
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".task:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// === DRAG LISTAS (corrigido usando elementFromPoint) ===
function enableListDrag(list) {
  list.addEventListener("dragstart", e => {
    list.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  list.addEventListener("dragend", () => list.classList.remove("dragging"));
}

// Board dragover: usa elementFromPoint para decidir inserção antes/depois
board.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".list.dragging");
  if (!dragging) return;

  // pega o elemento real abaixo do cursor
  const elem = document.elementFromPoint(e.clientX, e.clientY);
  if (!elem) return;
  const closestList = elem.closest(".list");
  if (!closestList || closestList === dragging) return;

  const box = closestList.getBoundingClientRect();
  const midpoint = box.left + box.width / 2;

  // se cursor está à esquerda do meio => insert antes, se direita => insert after
  if (e.clientX < midpoint) {
    // inserir antes apenas se necessário
    if (closestList.previousElementSibling !== dragging) {
      board.insertBefore(dragging, closestList);
    }
  } else {
    // inserir depois apenas se necessário
    if (closestList.nextElementSibling !== dragging) {
      board.insertBefore(dragging, closestList.nextElementSibling);
    }
  }
});
