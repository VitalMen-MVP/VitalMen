// ...existing code...
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (!toggle || !navbar) return;

    toggle.addEventListener('click', () => {
        const open = navbar.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '✕' : '☰';
    });

    // fecha ao clicar em link interno
    navbar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        }
    });

    // fecha com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        }
    });
});
// ...existing code...