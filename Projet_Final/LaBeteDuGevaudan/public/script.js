document.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
        const card = button.closest('[data-mission]');
        const isOpen = card.getAttribute('data-open') === 'true';

        document.querySelectorAll('[data-mission]').forEach((item) => {
            item.setAttribute('data-open', 'false');
        });

        card.setAttribute('data-open', String(!isOpen));
        button.textContent = !isOpen ? 'Masquer les indices' : 'Voir les indices';
    });
});
