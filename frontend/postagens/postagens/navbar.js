// Função para buscar e exibir perfil do usuário (mantida)
async function fetchUserProfile(authToken, loginBtn, navbar) {
  try {
    const response = await fetch("/api/perfil", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const resultado = await response.json();

    if (response.ok) {
      const user = resultado.perfil;

      if (loginBtn) {
        loginBtn.style.display = "none";
      }

      const msg = document.createElement("a");
      msg.textContent = `Bem-vindo, ${user.username}! 😎`;
      msg.href = "/usuario";

      msg.style.color = "#fff";
      msg.style.marginLeft = "auto";
      msg.style.fontWeight = "bold";

      if (navbar) {
        navbar.appendChild(msg);

        const logoutBtn = document.createElement("a");
        logoutBtn.className = "login-button";
        logoutBtn.textContent = "Sair";
        logoutBtn.href = "#";
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("access_token");
          window.location.reload();
        });
        navbar.appendChild(logoutBtn);
      }
    } else {
      console.error(
        "Autenticação falhou:",
        resultado.erro || "Erro desconhecido."
      );
      localStorage.removeItem("access_token");
    }
  } catch (error) {
    console.error("Erro na comunicação com a API:", error);
  }
}

// -----------------------------------------------------
// === LÓGICA DO TEMA ===
// -----------------------------------------------------

/**
 * Aplica a classe 'dark-mode' ao body e atualiza o ícone do botão.
 * @param {string} theme - 'dark' ou 'light'.
 */
function setTheme(theme) {
  const body = document.body;
  const toggleButton = document.getElementById("theme-toggle");

  if (theme === "dark") {
    body.classList.add("dark-mode");
    if (toggleButton) {
      toggleButton.textContent = "☀️"; // Sol para indicar que o clique mudará para CLARO
      toggleButton.setAttribute("aria-label", "Alternar para tema claro");
    }
  } else {
    body.classList.remove("dark-mode");
    if (toggleButton) {
      toggleButton.textContent = "🌙"; // Lua para indicar que o clique mudará para ESCURO
      toggleButton.setAttribute("aria-label", "Alternar para tema escuro");
    }
  }
  // Salva a preferência no armazenamento local
  localStorage.setItem("theme", theme);
}

/**
 * Alterna entre tema claro e escuro.
 */
function toggleTheme() {
  const currentTheme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

/**
 * Configura o estado inicial do tema e o listener de clique.
 */
function setupThemeToggle() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const themeToggle = document.getElementById("theme-toggle");

  // 1. Define o tema inicial (salvo > preferência do sistema > padrão claro)
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDark) {
    setTheme("dark");
  } else {
    setTheme("light");
  }

  // 2. Adiciona o listener de clique
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".menu-toggle");
  const navbar = document.querySelector(".navbar");
  const loginBtn = document.getElementById("loginBtn");
  const token = localStorage.getItem("access_token");

  // Inicializa a lógica do tema
  setupThemeToggle();




  // Lógica de autenticação
  if (token) {
    fetchUserProfile(token, loginBtn, navbar);

    if (loginBtn) {
      loginBtn.style.display = "none";
    }
  } else {
    if (loginBtn) {
      loginBtn.style.display = "block";
    }
  }



  // Lógica do Menu Mobile (mantida)
  if (!toggle || !navbar) return;

  toggle.addEventListener("click", () => {
    const open = navbar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "✕" : "☰";
  });

  // Fecha o menu ao clicar em link interno
  navbar.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && navbar.classList.contains("open")) {
      navbar.classList.remove("open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    }
  });

  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navbar.classList.contains("open")) {
      navbar.classList.remove("open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    }
  });
});