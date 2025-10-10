const form = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    const dados = {email, senha};
    try {
        const response = await fetch('/api/login',{
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify(dados)
    });
    const resultado = await response.json();

    if (response.ok) {
        mensagem.textContent = 'Login realizado com sucesso!';
        mensagem.style.color = 'green';


    }
    else {
        mensagem.textContent = resultado.message || 'Erro no login. Tente novamente.';
        mensagem.style.color = 'red';
    }
    } catch (error) {
        mensagem.textContent = 'Erro na comunicação com o servidor.';
        mensagem.style.color = 'red';
    }
});