// này là nút dropdown profile khách hàng 
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

profileBtn.addEventListener('click', function () {
    dropdownMenu.classList.toggle('show');
});

// Đóng dropdown khi click bên ngoài
document.addEventListener('click', function (event) {
    if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});

// Thêm sự kiện click cho các menu item
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', function () {
        const text = this.querySelector('.menu-item-text').textContent;
        console.log('Clicked:', text);
        // Bạn có thể thêm logic xử lý tại đây
    });
});