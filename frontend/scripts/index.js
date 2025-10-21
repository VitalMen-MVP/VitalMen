document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (!toggle || !navbar) return;

    toggle.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        // opcional: trocar ícone (☰ -> ✕)
        toggle.textContent = isOpen ? '✕' : '☰';
    });

    // fecha menu ao clicar em link (melhora UX)
    navbar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            const toggleBtn = document.querySelector('.menu-toggle');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.textContent = '☰';
            }
        }
    });

    // fecha com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            const toggleBtn = document.querySelector('.menu-toggle');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.textContent = '☰';
            }
        }
    });
});