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