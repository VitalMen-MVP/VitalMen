// historico.js
const token = localStorage.getItem("access_token");
// Em historico.js
// ...
const commentListElement = document.getElementById("commentList");
const postId = commentListElement.getAttribute("data-post-id"); // OU o valor POSTAGEM_ID

if (!postId || isNaN(parseInt(postId))) {
    console.error("Erro: O ID da Postagem é inválido ou não foi definido corretamente no HTML.");
    // 💡 Você pode adicionar um return aqui para impedir que as funções sejam executadas
}

// ... restante do código ...
function loadComments() {
    fetch(`/comments/${postId}`)
        .then(res => res.json())
        .then(comments => {
            const list = document.getElementById("commentList");
            list.innerHTML = "";

            comments.forEach(c => {
                const div = document.createElement("div");
                div.classList.add("comment-card");

                const avatarSrc = c.user.avatar
                    ? `data:image/jpeg;base64,${c.user.avatar}`
                    : '../../assets/img/profile-placeholder.png';

                div.innerHTML = `
    <div class="comment-user">
        <img src="${avatarSrc}" class="avatar">
        <strong>${c.user.username}</strong>
        <span class="date">${c.created_at}</span>
    </div>

    <p>${c.content}</p>
`;


                list.appendChild(div);
            });
        });
}

loadComments();

document.getElementById("commentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = document.getElementById("commentText").value;

    const res = await fetch(`/comments/${postId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });

    if (res.ok) {
        document.getElementById("commentText").value = "";
        loadComments();
    }
});
