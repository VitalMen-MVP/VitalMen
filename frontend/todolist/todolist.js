// todolist.js - integrado com backend Flask
// Requisitos: rotas conforme sua mensagem:
// GET  /api/listas
// POST /api/listas
// PUT  /api/listas/<id>
// DELETE /api/listas/<id>
// GET  /api/listas/<lista_id>/tarefas
// POST /api/listas/<lista_id>/tarefas
// PUT  /api/tarefas/<id>   (aceitar posicao, prioridade, concluida, descricao e idealmente lista_id)
// DELETE /api/tarefas/<id>

const board = document.getElementById("board");
const addListBtn = document.getElementById("addListBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let itemToDelete = null;

// Radix sort helpers (mantive seu código)
function getDigit(num, place) {
  return Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;
}

function digitCount(num) {
  if (num === 0) return 1;
  return Math.floor(Math.log10(Math.abs(num))) + 1;
}

function mostDigits(nums) {
  let maxDigits = 0;
  for (let i = 0; i < nums.length; i++) {
    maxDigits = Math.max(maxDigits, digitCount(nums[i]));
  }
  return maxDigits;
}

function sortTasksByPriority(taskListElement) {
  let tasks = Array.from(taskListElement.querySelectorAll(".task"));
  if (tasks.length <= 1) return;

  let taskObjects = tasks.map(task => {
    const input = task.querySelector(".task-priority");
    const priority = input.value && input.value !== "" ? parseInt(input.value) : 999;
    return { element: task, priority: priority };
  });

  const priorities = taskObjects.map(t => t.priority);
  const maxDigitCount = mostDigits(priorities);

  for (let k = 0; k < maxDigitCount; k++) {
    let digitBuckets = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < taskObjects.length; i++) {
      let digit = getDigit(taskObjects[i].priority, k);
      digitBuckets[digit].push(taskObjects[i]);
    }
    taskObjects = [].concat(...digitBuckets);
  }

  taskObjects.forEach(obj => {
    taskListElement.appendChild(obj.element);
  });

  taskListElement.style.opacity = "0.5";
  setTimeout(() => taskListElement.style.opacity = "1", 300);

  // Depois de ordenar visualmente, atualiza posições no backend
  saveTaskPositions(taskListElement);
}

// ---------- Helpers para comunicação com backend ----------
async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} falhou: ${res.status}`);
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`POST ${url} falhou: ${res.status} ${txt}`);
  }
  return res.json();
}

async function apiPut(url, body) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PUT ${url} falhou: ${res.status} ${txt}`);
  }
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DELETE ${url} falhou: ${res.status} ${txt}`);
  }
  return res.json();
}

// ---------- Carregar tudo no DOM ----------
document.addEventListener("DOMContentLoaded", carregarListas);

addListBtn.addEventListener("click", async () => {
  const name = prompt("Nome da nova lista:");
  if (name) {
    try {
      const data = await apiPost("/api/listas", { titulo: name });
      // data.id retornado pelo backend
      await createList(name, data.id, "#ffffff");
      // não precisa chamar carregarTarefas porque lista nova está vazia
    } catch (err) {
      console.error(err);
      alert("Erro ao criar lista.");
    }
  }
});

async function carregarListas() {
  try {
    const listas = await apiGet("/api/listas");
    board.innerHTML = ""; // limpa board
    for (const lista of listas) {
      await createList(lista.titulo, lista.id, lista.cor, lista.posicao);
      await carregarTarefas(lista.id);
    }
  } catch (err) {
    console.error("Erro ao carregar listas:", err);
  }
}

// ---------- Função criar lista (aceita id/color vindos do backend) ----------
async function createList(title, id = null, color = null, pos = null) {
  // Se id for null, já foi tratado no botão criar; idealmente não chega aqui sem id.
  if (!id) {
    try {
      const data = await apiPost("/api/listas", { titulo: title });
      id = data.id;
    } catch (err) {
      console.error(err);
      alert("Erro ao criar lista no servidor.");
      return;
    }
  }

  const list = document.createElement("div");
  list.classList.add("list");
  list.draggable = true;
  list.dataset.id = id;

  list.innerHTML = `
    <div class="list-header">
      <span class="list-title" contenteditable="true"></span>
      <div class="list-actions">
        <button class="sort-btn" title="Ordenar por Prioridade (Radix Sort)">🔢</button>
        <button class="list-color-btn" title="Mudar cor">🎨</button>
        <button class="delete-list" title="Excluir lista">🗑️</button>
      </div>
    </div>
    <div class="task-list"></div>
    <button class="add-task-btn">+ Adicionar Tarefa</button>
  `;

  const titleEl = list.querySelector(".list-title");
  titleEl.textContent = title;
  if (color) list.style.background = color;

  // editar título (salva backend no blur)
  titleEl.addEventListener("blur", async () => {
    const novoTitulo = titleEl.textContent.trim();
    try {
      await apiPut(`/api/listas/${id}`, { titulo: novoTitulo });
    } catch (err) {
      console.error("Erro ao atualizar título:", err);
    }
  });

  // Ordenar (Radix)
  list.querySelector(".sort-btn").addEventListener("click", () => {
    const taskList = list.querySelector(".task-list");
    sortTasksByPriority(taskList);
  });

  // Adicionar tarefa (chama backend)
  list.querySelector(".add-task-btn").addEventListener("click", async () => {
    const text = prompt("Nova tarefa:");
    if (!text) return;
    const taskList = list.querySelector(".task-list");
    try {
      const data = await apiPost(`/api/listas/${id}/tarefas`, { descricao: text });
      // data.id é id retornado
      await createTask(taskList, text, id, data.id, 999, false);
      saveTaskPositions(taskList); // atualiza posições (a API já atribuiu, mas garantimos ordem)
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      alert("Erro ao criar tarefa.");
    }
  });

  // Mudar cor
  const colorBtn = list.querySelector(".list-color-btn");
  colorBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "color";
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();
    input.addEventListener("change", async (e) => {
      const newColor = e.target.value;
      list.style.background = newColor;
      try {
        await apiPut(`/api/listas/${id}`, { cor: newColor });
      } catch (err) {
        console.error("Erro ao atualizar cor:", err);
      }
    });
    input.addEventListener("blur", () => { try { input.remove(); } catch(e){} });
  });

  // Excluir lista (abre modal)
  const deleteBtn = list.querySelector(".delete-list");
  deleteBtn.addEventListener("click", () => {
    const curTitle = list.querySelector(".list-title").textContent.trim();
    itemToDelete = list;
    confirmText.textContent = `Deseja realmente excluir a lista "${curTitle}"?`;
    confirmModal.style.display = "flex";
  });

  enableListDrag(list);
  enableTaskDrop(list.querySelector(".task-list"));

  // inserir no DOM no final (ou pode querer na posição pos)
  board.appendChild(list);

  return list;
}

// ---------- Carregar tarefas de uma lista ----------
async function carregarTarefas(lista_id) {
  try {
    const tarefas = await apiGet(`/api/listas/${lista_id}/tarefas`);
    const list = document.querySelector(`.list[data-id="${lista_id}"]`);
    if (!list) return;
    const taskList = list.querySelector(".task-list");
    taskList.innerHTML = "";
    for (const t of tarefas) {
      await createTask(taskList, t.descricao, lista_id, t.id, t.prioridade, t.concluida, t.posicao);
    }
  } catch (err) {
    console.error("Erro ao carregar tarefas:", err);
  }
}

// ---------- Criar tarefa no DOM (aceita parâmetros do backend) ----------
async function createTask(taskList, text, lista_id, id = null, prioridade = 999, concluida = false, pos = null) {
  // Se não houver id, já deve ter sido criado pelo caller
  // Construir elemento
  const task = document.createElement("div");
  task.classList.add("task");
  task.draggable = true;
  if (id) task.dataset.id = id;
  task.dataset.listaId = lista_id;

  task.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <input type="number" class="task-priority" placeholder="Prio" min="0" max="999" style="width:64px;">
      <input type="checkbox" class="done">
      <span class="task-text"></span>
    </div>
    <div class="task-actions">
      <button class="edit-task" title="Editar">✏️</button>
      <button class="delete-task" title="Excluir">🗑️</button>
    </div>
  `;

  const textEl = task.querySelector(".task-text");
  textEl.textContent = text;

  const priorityInput = task.querySelector(".task-priority");
  priorityInput.value = prioridade !== undefined ? prioridade : 999;

  const checkbox = task.querySelector(".done");
  checkbox.checked = !!concluida;
  handleTaskStatusChange(task, checkbox); // aplica estilo inicial

  // Editar tarefa (texto)
  task.querySelector(".edit-task").addEventListener("click", async () => {
    const current = textEl.textContent;
    const newText = prompt("Editar tarefa:", current);
    if (newText === null) return;
    textEl.textContent = newText;
    try {
      if (task.dataset.id) {
        await apiPut(`/api/tarefas/${task.dataset.id}`, { descricao: newText });
      }
    } catch (err) {
      console.error("Erro ao editar tarefa:", err);
    }
  });

  // Excluir tarefa (modal)
  task.querySelector(".delete-task").addEventListener("click", () => {
    const textPreview = textEl.textContent;
    itemToDelete = task;
    confirmText.textContent = `Deseja realmente excluir a tarefa "${textPreview}"?`;
    confirmModal.style.display = "flex";
  });

  // Concluir/desconcluir e atualizar backend
  checkbox.addEventListener("change", async () => {
    handleTaskStatusChange(task, checkbox);
    try {
      if (task.dataset.id) {
        await apiPut(`/api/tarefas/${task.dataset.id}`, { concluida: checkbox.checked });
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  });

  // Prioridade - atualiza backend ao mudar
  priorityInput.addEventListener("change", async (e) => {
    const newVal = parseInt(e.target.value);
    const valor = Number.isInteger(newVal) ? newVal : 999;
    try {
      if (task.dataset.id) {
        await apiPut(`/api/tarefas/${task.dataset.id}`, { prioridade: valor });
      }
    } catch (err) {
      console.error("Erro ao atualizar prioridade:", err);
    }
  });

  enableTaskDrag(task);
  taskList.appendChild(task);

  return task;
}

// Aplica estilos quando concluída
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

// ---------- Modal confirmar (Sim/Não) ----------
confirmYes.onclick = async () => {
  if (!itemToDelete) {
    confirmModal.style.display = "none";
    return;
  }

  try {
    if (itemToDelete.classList.contains("list")) {
      const id = itemToDelete.dataset.id;
      await apiDelete(`/api/listas/${id}`);
      itemToDelete.remove();
      // atualizar posições das listas
      saveListPositions();
    } else if (itemToDelete.classList.contains("task")) {
      const id = itemToDelete.dataset.id;
      if (id) await apiDelete(`/api/tarefas/${id}`);
      const parentTaskList = itemToDelete.closest(".task-list");
      itemToDelete.remove();
      if (parentTaskList) saveTaskPositions(parentTaskList);
    }
  } catch (err) {
    console.error("Erro ao deletar item:", err);
    alert("Erro ao deletar no servidor.");
  } finally {
    confirmModal.style.display = "none";
    itemToDelete = null;
  }
};

confirmNo.onclick = () => {
  confirmModal.style.display = "none";
  itemToDelete = null;
};

// ---------- Drag & Drop (tarefas) ----------
function enableTaskDrag(task) {
  task.addEventListener("dragstart", (e) => {
    task.classList.add("dragging");
    // opcional: set dataTransfer para efeito visual
    try { e.dataTransfer.setData("text/plain", task.dataset.id || ""); } catch(e){}
  });

  task.addEventListener("dragend", async () => {
    task.classList.remove("dragging");
    // quando terminar de arrastar, atualizamos posições na lista atual (e se necessário na lista origem/destino)
    const currentList = task.closest(".task-list");
    if (currentList) await saveTaskPositions(currentList);
    // também salvamos todas as listas só por garantia (em caso de troca de listas)
    await saveAllTaskPositions();
  });
}

function enableTaskDrop(taskList) {
  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".task.dragging");
    if (!dragging) return;

    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) taskList.appendChild(dragging);
    else taskList.insertBefore(dragging, afterElement);
  });

  // quando uma tarefa é solta sobre a lista, atualizamos imediatamente seu lista_id e posições
  taskList.addEventListener("drop", async (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".task.dragging");
    if (!dragging) return;
    const newList = taskList.closest(".list");
    if (!newList) return;
    const newListId = newList.dataset.id;

    // atualizar atributo local
    dragging.dataset.listaId = newListId;

    // salvamos posições (inclui atualização de lista_id no servidor para a tarefa movida)
    await saveAllTaskPositions();
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

// Salva as posições das tarefas dentro de uma task-list (envia PUT por tarefa)
async function saveTaskPositions(taskList) {
  const tasks = [...taskList.querySelectorAll(".task")];
  const listaEl = taskList.closest(".list");
  const listaId = listaEl ? listaEl.dataset.id : null;

  // envia um PUT para cada tarefa com posicao e lista_id
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const id = t.dataset.id;
    if (!id) continue; // tarefa sem id (não persistida) - deveria ser rara
    const body = { posicao: i, prioridade: parseInt(t.querySelector(".task-priority").value) || 999, lista_id: listaId };
    try {
      await apiPut(`/api/tarefas/${id}`, body);
    } catch (err) {
      console.error(`Erro ao salvar posição tarefa ${id}:`, err);
    }
  }
}

// Percorre todas as listas e salva posições de tarefas (útil quando uma tarefa muda de lista)
async function saveAllTaskPositions() {
  const lists = [...document.querySelectorAll(".list")];
  for (const l of lists) {
    const tl = l.querySelector(".task-list");
    await saveTaskPositions(tl);
  }
}

// ---------- Drag & Drop (listas) ----------
function enableListDrag(list) {
  list.addEventListener("dragstart", (e) => {
    list.classList.add("dragging");
    try { e.dataTransfer.setData("text/plain", list.dataset.id || ""); } catch(e){}
  });

  list.addEventListener("dragend", async () => {
    list.classList.remove("dragging");
    await saveListPositions();
  });
}

board.addEventListener("dragover", (e) => {
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

// Salva posições das listas no backend (PUT /api/listas/:id { posicao })
async function saveListPositions() {
  const lists = [...document.querySelectorAll(".list")];
  for (let i = 0; i < lists.length; i++) {
    const l = lists[i];
    const id = l.dataset.id;
    try {
      await apiPut(`/api/listas/${id}`, { posicao: i });
    } catch (err) {
      console.error(`Erro ao salvar posicao lista ${id}:`, err);
    }
  }
}

// ---------- Funções utilitárias adicionais ----------

// Atualiza prioridade para cada tarefa no formulário e salva backend (caso queira forçar salvar)
async function updatePrioritiesAndSave(listEl) {
  const tasks = [...listEl.querySelectorAll(".task")];
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const id = t.dataset.id;
    if (!id) continue;
    const prior = parseInt(t.querySelector(".task-priority").value) || 999;
    try {
      await apiPut(`/api/tarefas/${id}`, { prioridade: prior, posicao: i });
    } catch (err) {
      console.error("Erro ao atualizar prioridade:", err);
    }
  }
}

// ---------- Fim do arquivo ----------
