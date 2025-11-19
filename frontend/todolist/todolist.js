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

// ============================================================
// === LÓGICA DO RADIX SORT (ALGORITMO DE ORDENAÇÃO) ===
// ============================================================

// 1. Pega o dígito em uma posição específica (ex: unidade, dezena)
function getDigit(num, place) {
  return Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;
}

// 2. Conta quantos dígitos o número tem
function digitCount(num) {
  if (num === 0) return 1;
  return Math.floor(Math.log10(Math.abs(num))) + 1;
}

// 3. Descobre o número com mais dígitos na lista
function mostDigits(nums) {
  let maxDigits = 0;
  for (let i = 0; i < nums.length; i++) {
    maxDigits = Math.max(maxDigits, digitCount(nums[i]));
  }
  return maxDigits;
}

/**
 * Aplica o Radix Sort diretamente nos elementos do DOM
 * @param {HTMLElement} taskListElement - O container .task-list
 */
function sortTasksByPriority(taskListElement) {
  // 1. Coletar tarefas e suas prioridades
  let tasks = Array.from(taskListElement.querySelectorAll(".task"));
  
  // Se tiver 0 ou 1 item, não precisa ordenar
  if (tasks.length <= 1) return;

  // Criar um array de objetos para manter a referência do DOM junto com o valor
  let taskObjects = tasks.map(task => {
    const input = task.querySelector(".task-priority");
    // Se não tiver valor, assume 999 (baixa prioridade)
    const priority = input.value && input.value !== "" ? parseInt(input.value) : 999;
    return { element: task, priority: priority };
  });

  // Pegar apenas os números para calcular a quantidade de loops
  const priorities = taskObjects.map(t => t.priority);
  const maxDigitCount = mostDigits(priorities);

  // === LOOP DO RADIX SORT ===
  for (let k = 0; k < maxDigitCount; k++) {
    // Criar 10 baldes (buckets) vazios (0 a 9)
    let digitBuckets = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < taskObjects.length; i++) {
      let digit = getDigit(taskObjects[i].priority, k);
      digitBuckets[digit].push(taskObjects[i]);
    }

    // Reconstruir a lista concatenando os baldes
    taskObjects = [].concat(...digitBuckets);
  }

  // === APLICAR NO DOM ===
  // O Radix Sort é estável, então a ordem relativa é mantida
  taskObjects.forEach(obj => {
    taskListElement.appendChild(obj.element);
  });
  
  // Feedback visual
  taskListElement.style.opacity = "0.5";
  setTimeout(() => taskListElement.style.opacity = "1", 300);
}

// ============================================================
// === FIM DO RADIX SORT ===
// ============================================================

// === CRIAR LISTA ===
function createList(title) {
  const list = document.createElement("div");
  list.classList.add("list");
  list.draggable = true;

  // Adicionado o botão de Ordenar (🔢)
  list.innerHTML = `
    <div class="list-header">
      <span class="list-title" contenteditable="true">${title}</span>
      <div class="list-actions">
        <button class="sort-btn" title="Ordenar por Prioridade (Radix Sort)">🔢</button>
        <button class="list-color-btn" title="Mudar cor">🎨</button>
        <button class="delete-list" title="Excluir lista">🗑️</button>
      </div>
    </div>
    <div class="task-list"></div>
    <button class="add-task-btn">+ Adicionar Tarefa</button>
  `;

  const taskList = list.querySelector(".task-list");

  // Evento do Radix Sort
  list.querySelector(".sort-btn").addEventListener("click", () => {
    sortTasksByPriority(taskList);
  });

  // Adicionar tarefa
  list.querySelector(".add-task-btn").addEventListener("click", () => {
    const text = prompt("Nova tarefa:");
    if (text) createTask(taskList, text);
  });

  // Alterar cor da lista
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
    input.addEventListener("change", () => input.remove());
    input.addEventListener("blur", () => { try { input.remove(); } catch(e){} });
  });

  // Excluir lista
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

  // Adicionado o input .task-priority
  task.innerHTML = `
    <div style="display: flex; align-items: center;">
      <input type="number" class="task-priority" placeholder="Prio" min="0" max="999">
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

  // Excluir
  task.querySelector(".delete-task").addEventListener("click", () => {
    const textPreview = task.querySelector(".task-text").textContent;
    itemToDelete = task;
    confirmText.textContent = `Deseja realmente excluir a tarefa "${textPreview}"?`;
    confirmModal.style.display = "flex";
  });

  // Concluir
  const checkbox = task.querySelector(".done");
  checkbox.addEventListener("change", () => handleTaskStatusChange(task, checkbox));

  enableTaskDrag(task);
  taskList.appendChild(task);
}

// === MOVER TAREFA ENTRE LISTAS ===
function handleTaskStatusChange(task, checkbox) {
  const textEl = task.querySelector(".task-text");
  if (checkbox.checked) {
    textEl.style.textDecoration = "line-through";
    textEl.style.opacity = "0.6";
    task.classList.add("completed");
  } else {
    textEl.style.textDecoration = "none";
    textEl.style.opacity = "1";
    task.classList.remove("completed");
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
  taskList.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".task.dragging");
    if (!dragging) return;

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

// === DRAG LISTAS ===
function enableListDrag(list) {
  list.addEventListener("dragstart", e => {
    list.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  list.addEventListener("dragend", () => list.classList.remove("dragging"));
}

board.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".list.dragging");
  if (!dragging) return;
  const elem = document.elementFromPoint(e.clientX, e.clientY);
  if (!elem) return;
  const closestList = elem.closest(".list");
  if (!closestList || closestList === dragging) return;
  const box = closestList.getBoundingClientRect();
  const midpoint = box.left + box.width / 2;
  if (e.clientX < midpoint) {
    if (closestList.previousElementSibling !== dragging) board.insertBefore(dragging, closestList);
  } else {
    if (closestList.nextElementSibling !== dragging) board.insertBefore(dragging, closestList.nextElementSibling);
  }
});