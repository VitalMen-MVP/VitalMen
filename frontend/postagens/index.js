document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-input');

  // Mapeamento das palavras-chave para as rotas
  const rotas = {
    'saúde': '/saude',
    'saude': '/saude',
    'exercícios': '/exercicios',
    'exercicios': '/exercicios',
    'nutrição': '/nutricao',
    'nutricao': '/nutricao',
    'mentalidade': '/mentalidade',
    'sobre nós': '/sobrenos',
    'sobrenos': '/sobrenos',
    'contato': '/contato'
  };

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const valor = searchInput.value.trim().toLowerCase();
      if (rotas[valor]) {
        window.location.href = rotas[valor];
      } else {
        alert('Categoria não encontrada. Tente: Saúde, Exercícios, Nutrição, Mentalidade, Sobre Nós ou Contato.');
      }
    }
  });
});













 // ===== GET COMMENTS =====
        async function loadComments() {
            const response = await fetch("/comments/");
            const data = await response.json();

            const list = document.getElementById("comments-list");
            list.innerHTML = "";

            data.forEach(comment => {
                const li = document.createElement("li");
                li.className = "comment-item";
                li.innerHTML = `
                    <span class="comment-author">${comment.author}</span><br>
                    ${comment.content}<br>
                    <small>${new Date(comment.created_at).toLocaleString()}</small>
                `;
                list.appendChild(li);
            });
        }

        // ===== CREATE COMMENT =====
        const form = document.getElementById("comment-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const author = document.getElementById("author").value;
            const content = document.getElementById("content").value;

            await fetch("/comments/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ author, content })
            });

            form.reset();
            loadComments();
        });

        // Carrega ao abrir a página
        loadComments();



      
      
      
      
      