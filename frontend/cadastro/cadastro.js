document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const mensagem = document.getElementById("mensagem");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmpassword = document
      .getElementById("confirmpassword")
      .value.trim();

    const dados = { username, email, password, confirmpassword };
    if (password !== confirmpassword) {
      mensagem.textContent = "As senhas não coincidem.";
      mensagem.style.color = "red";
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      });
      const resultado = await response.json();

      if (response.ok) {
        mensagem.textContent = "Cadastro realizado com sucesso!";
        mensagem.style.color = "green";

        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        mensagem.textContent =
          resultado.message || "Erro no Cadastro. Tente novamente.";
        mensagem.style.color = "red";
      }
    } catch (error) {
      mensagem.textContent = "Erro na comunicação com o servidor.";
      mensagem.style.color = "red";
    }
  });
  const senhaInput = document.getElementById("password");
  const toggleSenha = document.getElementById("toggleSenha");
  const confSenhaInput = document.getElementById("confirmpassword");
  const toggleConfSenha = document.getElementById("toggleConfSenha");

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

  // Mostrar/ocultar botão de ver senha conforme digitação
  confSenhaInput.addEventListener("input", function () {
    if (confSenhaInput.value.length > 0) {
      toggleConfSenha.style.display = "block";
    } else {
      toggleConfSenha.style.display = "none";
      confSenhaInput.type = "password";
      toggleConfSenha.textContent = "👁️";
    }
  });

  // Toggle password visibility
  toggleConfSenha.style.display = "none"; // Inicialmente oculto
  
  toggleConfSenha.addEventListener("click", function () {
    if (confSenhaInput.type === "password") {
      confSenhaInput.type = "text";
      toggleConfSenha.textContent = "🙈"; // Ícone diferente para "mostrar"
    } else {
      confSenhaInput.type = "password";
      toggleConfSenha.textContent = "👁️"; // Ícone para "ocultar"
    }
  });
});
