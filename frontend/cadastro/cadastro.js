document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const mensagem = document.getElementById('mensagem');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmpassword = document.getElementById('confirmpassword').value.trim();

        const dados = {username, email, password, confirmpassword};
        if (password !== confirmpassword) {
            mensagem.textContent = 'As senhas não coincidem.';
            mensagem.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(dados)
            });
            const resultado = await response.json();

            if (response.ok) {
                mensagem.textContent = 'Cadastro realizado com sucesso!';
                mensagem.style.color = 'green';

                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                mensagem.textContent = resultado.message || 'Erro no Cadastro. Tente novamente.';
                mensagem.style.color = 'red';
            }
        } catch (error) {
            mensagem.textContent = 'Erro na comunicação com o servidor.';
            mensagem.style.color = 'red';
        }
    });
});
