// --- Chaves do Local Storage ---
const LS_STREAK_KEY = 'userDayStreak';
const LS_TASKS_KEY = 'userTasksCompleted';
const LS_LAST_UPDATE_KEY = 'userLastStreakUpdate';

// --- Elementos HTML ---
const dayStreakEl = document.getElementById('day-streak');
const tasksCompletedEl = document.getElementById('tarefas-concluidas');

// --- Variáveis ---
let dayStreak = 0;
let tasksCompleted = 0;

/* ============================================================
   LOCALSTORAGE (STREAK + TAREFAS)
============================================================ */

function saveStats() {
    localStorage.setItem(LS_STREAK_KEY, dayStreak);
    localStorage.setItem(LS_TASKS_KEY, tasksCompleted);
}

function updateDOM() {
    if (dayStreakEl) dayStreakEl.textContent = `${dayStreak} dias`;
    if (tasksCompletedEl) tasksCompletedEl.textContent = tasksCompleted;
}

function loadStats() {
    dayStreak = parseInt(localStorage.getItem(LS_STREAK_KEY) || '0', 10);
    tasksCompleted = parseInt(localStorage.getItem(LS_TASKS_KEY) || '0', 10);
    updateDOM();
}

function checkAndIncreaseStreak() {
    const lastUpdate = localStorage.getItem(LS_LAST_UPDATE_KEY);
    const today = new Date().toDateString();

    if (!lastUpdate) {
        dayStreak = 1;
        localStorage.setItem(LS_LAST_UPDATE_KEY, today);
        saveStats();
        return updateDOM();
    }

    if (lastUpdate !== today) {
        const lastDate = new Date(lastUpdate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate.toDateString() === yesterday.toDateString()) {
            dayStreak++;
        } else {
            dayStreak = 1;
        }

        localStorage.setItem(LS_LAST_UPDATE_KEY, today);
        saveStats();
        updateDOM();
    }
}

function completeTask() {
    tasksCompleted++;
    saveStats();
    updateDOM();
}

/* ============================================================
   PERFIL DO USUÁRIO
============================================================ */

function fetchUserProfile(token) {
    const tk = token || localStorage.getItem("access_token");

    if (!tk) {
        console.warn("Nenhum token encontrado.");
        return Promise.resolve(null);
    }

    return fetch("/api/perfil", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tk}`,
            "Accept": "application/json"
        }
    })
    .then(async (response) => {
        const data = await response.json().catch(() => null);

        // Se o token for inválido ou backend não enviar perfil
        if (!data || !data.perfil) {
            console.warn("Token inválido ou resposta inesperada:", data);
            return null;
        }

        return data.perfil;
    })
    .catch((err) => {
        console.error("Erro ao buscar perfil:", err);
        return null;
    });
}

/* ============================================================
   CALCULAR TEMPO COMO MEMBRO
============================================================ */

function calcularTempoMembro(dataCriacao) {
    const criado = new Date(dataCriacao);
    const hoje = new Date();

    const diffMs = hoje - criado;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 30) return `${diffDias} dias`;

    const diffMeses = Math.floor(diffDias / 30);
    if (diffMeses < 12) return `${diffMeses} meses`;

    const diffAnos = Math.floor(diffMeses / 12);
    return `${diffAnos} anos`;
}

/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');

    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const avatar = document.getElementById('user-avatar');
    const createdAt = document.getElementById('created-at');

    // Carrega streaks
    loadStats();
    checkAndIncreaseStreak();

    if (!token) return;

    fetchUserProfile(token).then(user => {
        if (!user) return;

        // Nome
        if (username) username.textContent = user.username ?? "Usuário";

        // Email
        if (email) email.textContent = user.email ?? "—";

        // Membro desde...
        if (createdAt && user.created_at) {
            createdAt.textContent = calcularTempoMembro(user.created_at);
        }

        // Avatar
        if (avatar && user.avatar) {
            avatar.src = `data:image/jpeg;base64,${user.avatar}`;
        }
    });
});
