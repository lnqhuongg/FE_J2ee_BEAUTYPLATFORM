
document.querySelectorAll('.toggle-password').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const input = document.querySelector(this.dataset.target);
        if (!input) return;

        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';

        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
});
