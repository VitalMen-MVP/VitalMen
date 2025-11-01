async function fetchUserProfile(authToken, loginBtn, navbar) {
    try {
        const response = await fetch('/api/perfil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const resultado = await response.json();

        if (response.ok) {
            const user = resultado.perfil;

            if (loginBtn) {
                loginBtn.style.display = 'none';
            }

            const msg = document.createElement('a');
            msg.textContent = `Bem-vindo, ${user.username}! 😎`;
            msg.href = '/perfil';

            msg.style.color = '#fff';
            msg.style.marginLeft = 'auto';
            msg.style.fontWeight = 'bold';

            if (navbar) {
                navbar.appendChild(msg);

                const logoutBtn = document.createElement('a');
                logoutBtn.className = 'login-button';
                logoutBtn.textContent = 'Sair';
                logoutBtn.href = "#";
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('access_token');
                    window.location.reload();
                });
                navbar.appendChild(logoutBtn);
            }

        } else {
            console.error("Autenticação falhou:", resultado.erro || "Erro desconhecido.");
            localStorage.removeItem('access_token');
        }

    } catch (error) {
        console.error('Erro na comunicação com a API:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.getElementById('loginBtn');
    const navbar = document.getElementById('navbar');

    const token = localStorage.getItem('access_token');

    if (token) {
        fetchUserProfile(token, loginBtn, navbar);

        if (loginBtn) {
            loginBtn.style.display = 'none';
        }

    } else {
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
    }
});