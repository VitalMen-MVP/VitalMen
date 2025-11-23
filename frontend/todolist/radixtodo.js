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

  // === LOOP DO RADIX SORT REVISADO PARA GARANTIR O(n) NA COLETA ===
for (let k = 0; k < maxDigitCount; k++) {
    // 1. DISTRIBUIÇÃO (Criação dos Baldes)
    let digitBuckets = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < taskObjects.length; i++) {
        let digit = getDigit(taskObjects[i].priority, k);
        digitBuckets[digit].push(taskObjects[i]);
    }

    // 2. COLETA (Reconstrução Linear O(n))
    let idx = 0; // Índice para preencher o array taskObjects
    for (let i = 0; i < digitBuckets.length; i++) { // Itera sobre os 10 baldes (0 a 9)
        const bucket = digitBuckets[i];
        for (let j = 0; j < bucket.length; j++) { // Itera sobre os itens em cada balde
            // Move o item do balde para a próxima posição livre no array principal
            taskObjects[idx] = bucket[j]; 
            idx++;
        }
    }
}
// === FIM DO LOOP REVISADO ===

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
