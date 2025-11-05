document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("config-form");
    const avatarInput = document.getElementById("avatar");
    const preview = document.getElementById("preview");
    const filenameP = document.getElementById("filename");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const token = localStorage.getItem("access_token");

    let currentPreviewUrl = null;

    // 1) Buscar dados do usuário e preencher o formulário
    // Ajuste a rota abaixo para a sua API (ex.: /api/user/me)
    fetch("/api/user", {
        headers: {
            "Authorization": `Bearer ${token}`,
        }, credentials: "include"
    })
        .then((r) => {
            if (!r.ok) throw new Error("Falha ao carregar dados do usuário");
            return r.json();
        })
        .then((user) => {
            usernameInput.value = user.username || "";
            emailInput.value = user.email || "";
            if (user.avatarUrl) {
                preview.src = user.avatarUrl;
                form.dataset.currentAvatar = user.avatarUrl;
            }
        })
        .catch((err) => {
            console.warn("Não foi possível carregar usuário:", err);
            // manter o placeholder
        });

    // 2) Mostrar preview e nome do arquivo ao escolher avatar
    avatarInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            filenameP.textContent = "";
            // restaurar preview para avatar atual se houver
            if (form.dataset.currentAvatar) preview.src = form.dataset.currentAvatar;
            return;
        }

        filenameP.textContent = file.name;

        // liberar URL anterior
        if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);

        currentPreviewUrl = URL.createObjectURL(file);
        preview.src = currentPreviewUrl;
    });

    // 3) Enviar alterações (usar FormData para incluir arquivo)
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;


        formData.append("username", username);
        formData.append("email", email);
        // só enviar senha se foi preenchida (para não sobrescrever com vazio)
        if (password) formData.append("password", password);

        const avatarFile = avatarInput.files && avatarInput.files[0];
        if (avatarFile) formData.append("avatar", avatarFile);

        fetch("/api/user", {
            method: "PUT", headers: {
                "Authorization": `Bearer ${token}`,
            }, credentials: "include", body: formData,
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Erro ao atualizar conta");
                }
                return res.json();
            })
            .then((updated) => {
                if (updated.user && updated.user.avatar) {
                    preview.src = `data:image/jpeg;base64,${updated.user.avatar}`;
                    form.dataset.currentAvatar = preview.src;
                }
                passwordInput.value = "";
                avatarInput.value = "";
                filenameP.textContent = "";
                alert("Configurações atualizadas com sucesso.");
            })

            .catch((err) => {
                console.error(err);
                alert("Erro ao atualizar: " + (err.message || err));
            });
    });
});