// JS CHUYỂN TAB QUẢN LÝ TÀI KHOẢN QUẢN TRỊ & KHÁCH HÀNG
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.nav-tabs .nav-link');
    const adminSection = document.querySelector('.admin-section');
    const customerSection = document.querySelector('.customer-section');

    tabs[0].addEventListener('click', function (e) {
        e.preventDefault();
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
        adminSection.style.display = 'block';
        customerSection.style.display = 'none';
    });

    tabs[1].addEventListener('click', function (e) {
        e.preventDefault();
        tabs[1].classList.add('active');
        tabs[0].classList.remove('active');
        adminSection.style.display = 'none';
        customerSection.style.display = 'block';
    });
});