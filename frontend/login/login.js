const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  const dados = { email, senha };
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(dados),
    });
    const resultado = await response.json();

    if (response.ok) {
      mensagem.textContent = "Login realizado com sucesso!";
      mensagem.style.color = "green";

      const token = resultado.token;

      localStorage.setItem("access_token", token);
      window.location.href = "/";
    } else {
      mensagem.textContent =
        resultado.message || "Erro no login. Tente novamente.";
      mensagem.style.color = "red";
    }
  } catch (error) {
    mensagem.textContent = "Erro na comunicação com o servidor.";
    mensagem.style.color = "red";
  }
});

const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

// Mostrar/ocultar botão de ver senha conforme digitação
senhaInput.addEventListener("input", function () {
  if (senhaInput.value.length > 0) {
    toggleSenha.style.display = "block";
  } else {
    toggleSenha.style.display = "none";
    senhaInput.type = "password";
    toggleSenha.textContent = "👁️";
  }
});

// Toggle password visibility
toggleSenha.style.display = "none"; // Inicialmente oculto

toggleSenha.addEventListener("click", function () {
  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    toggleSenha.textContent = "🙈"; // Ícone diferente para "mostrar"
  } else {
    senhaInput.type = "password";
    toggleSenha.textContent = "👁️"; // Ícone para "ocultar"
  }
});
