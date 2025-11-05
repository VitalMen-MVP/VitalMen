const input = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const doneList = document.getElementById("doneList");

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

const editModal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");

let itemToDelete = null;
let itemToEdit = null;

/*** ADD TODO ***/
function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  const li = createTodoElement(text);
  todoList.appendChild(li);

  input.value = "";
}

/*** CREATE TODO ITEM ***/
function createTodoElement(text) {
  const li = document.createElement("li");
  li.innerHTML = `
  
    <div style="display:flex; gap:10px; align-items:center; background: ;">
      <input type="checkbox" onchange="toggleDone(this)">
      <span class="todo-text">${text}</span>
    </div>
    <div style="display:flex; gap:8px;">
      <button onclick="editTodo(this)">✏️</button>
      <button onclick="removeTodo(this)">🗑️</button>
    </div>
  `;
  return li;
}

/*** MOVE TO DONE OR BACK ***/
function toggleDone(checkbox) {
  const li = checkbox.closest("li");

  if (checkbox.checked) {
    doneList.appendChild(li);
    li.classList.add("done");
  } else {
    todoList.appendChild(li);
    li.classList.remove("done");
  }
}

/*** OPEN DELETE MODAL ***/
function removeTodo(btn) {
  const li = btn.closest("li");
  const span = li.querySelector(".todo-text");

  itemToDelete = li;
  confirmText.textContent = `Excluir meta: "${span.textContent}"?`;
  confirmModal.style.display = "flex";
}

confirmYes.onclick = () => {
  if (itemToDelete) itemToDelete.remove();
  confirmModal.style.display = "none";
};

confirmNo.onclick = () => {
  confirmModal.style.display = "none";
};

/*** OPEN EDIT MODAL ***/
function editTodo(btn) {
  const li = btn.closest("li");
  const span = li.querySelector(".todo-text");

  itemToEdit = span;
  editInput.value = span.textContent;

  editModal.style.display = "flex";
}

saveEdit.onclick = () => {
  if (itemToEdit && editInput.value.trim() !== "") {
    itemToEdit.textContent = editInput.value.trim();
  }
  editModal.style.display = "none";
};

cancelEdit.onclick = () => {
  editModal.style.display = "none";
};
