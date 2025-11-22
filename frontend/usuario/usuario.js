// --- Chaves para o Local Storage ---
const LS_STREAK_KEY = 'userDayStreak';
const LS_TASKS_KEY = 'userTasksCompleted';
const LS_LAST_UPDATE_KEY = 'userLastStreakUpdate'; // Para rastrear a data do último acesso

// --- Elementos HTML (selecionados pelos IDs) ---
const dayStreakEl = document.getElementById('day-streak');
const tasksCompletedEl = document.getElementById('tarefas-concluidas');

// --- Variáveis de Estado (valores padrão) ---
let dayStreak = 0;
let tasksCompleted = 0;

// -----------------------------------------------------
// FUNÇÕES DE PERSISTÊNCIA E ATUALIZAÇÃO DO DOM
// -----------------------------------------------------

// Salva os dados atuais no Local Storage
function saveStats() {
    localStorage.setItem(LS_STREAK_KEY, dayStreak);
    localStorage.setItem(LS_TASKS_KEY, tasksCompleted);
}

// Atualiza o HTML com os valores das variáveis
function updateDOM() {
    if (dayStreakEl) {
        dayStreakEl.textContent = `${dayStreak} dias`;
    }
    if (tasksCompletedEl) {
        tasksCompletedEl.textContent = tasksCompleted;
    }
}

// Carrega os dados salvos ao iniciar a página
function loadStats() {
    // 1. Carrega os valores (ou usa 0 se for o primeiro acesso)
    dayStreak = parseInt(localStorage.getItem(LS_STREAK_KEY) || '0', 10);
    tasksCompleted = parseInt(localStorage.getItem(LS_TASKS_KEY) || '0', 10);
    
    updateDOM(); // Atualiza o DOM imediatamente com os valores carregados
}

// -----------------------------------------------------
// LÓGICA DE STREAK E TAREFAS
// -----------------------------------------------------

// Função principal para verificar e aumentar a Streak Diária
function checkAndIncreaseStreak() {
    const lastUpdate = localStorage.getItem(LS_LAST_UPDATE_KEY);
    const today = new Date().toDateString();
    
    // Se for o primeiro acesso
    if (!lastUpdate) {
         dayStreak = 1;
         localStorage.setItem(LS_LAST_UPDATE_KEY, today);
         saveStats();
         updateDOM();
    }
    // Se não for o primeiro acesso e a última atualização NÃO foi hoje
    else if (lastUpdate !== today) {
        const lastDate = new Date(lastUpdate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Verifica se o último acesso foi exatamente ontem
        if (lastDate.toDateString() === yesterday.toDateString()) {
            dayStreak++;
            localStorage.setItem(LS_LAST_UPDATE_KEY, today);
            saveStats();
            updateDOM();
        }
        // Se o último acesso foi antes de ontem, a streak é quebrada
        else {
            dayStreak = 1; // Reinicia a streak
            localStorage.setItem(LS_LAST_UPDATE_KEY, today);
            saveStats();
            updateDOM();
        }
    }
    // Se a última atualização foi hoje, não faz nada (mantém a streak)
}

// Função para simular a conclusão de uma tarefa
function completeTask() {
    tasksCompleted++;
    saveStats();
    updateDOM();
    
    // Opcionalmente, você pode querer chamar a função da streak aqui
    // para garantir que a streak seja marcada se uma tarefa for concluída
    // pela primeira vez no dia.
    // checkAndIncreaseStreak(); 
    
}


async function fetchUserProfile(authToken) {
    try {

        const response = await fetch('/api/perfil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const resultado = await response.json();
        return resultado.perfil;

    } catch (error) {
        console.error('Erro na comunicação com a API:', error);
    }
}

// -----------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------

// Espera o documento carregar antes de manipular o DOM
document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('access_token');
    const email = document.getElementById('email');
    const username = document.getElementById('username');
    const avatar = document.getElementById('user-avatar');
    const createdAt = document.getElementById('created-at');

    loadStats();
    checkAndIncreaseStreak();

    if (token) {
        try {
            const user = await fetchUserProfile(token);

            username.textContent = user.username;
            email.textContent = user.email;

            if (createdAt && user.created_at) {
                const date = new Date(user.created_at);
                createdAt.textContent = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            if (user.avatar) {
                avatar.src = `data:image/jpeg;base64,${user.avatar}`;
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }
    const logoutBtn = document.createElement('a');
    logoutBtn.className = 'login-button';
    logoutBtn.textContent = 'Sair';
    logoutBtn.href = "#";
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('access_token');
        window.location.reload();
    });
});