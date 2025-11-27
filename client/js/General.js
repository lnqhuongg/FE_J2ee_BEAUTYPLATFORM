// navbar sticky
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

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
        if(text === 'Đăng xuất') {
            // Xóa token và thông tin user khỏi localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('hoSo_MaKH');
            // Chuyển hướng về trang đăng nhập
            window.location.href = '/client/pages/Auth.html';
        }
        if(text === 'Hồ sơ') {
            window.location.href = '/client/pages/QLHoSo.html';
        }
    });
});

$(document).ready(function () {
    const token = localStorage.getItem("token"); 
    if (!token) {
        // window.location.href = '/client/pages/Auth.html';
        return;
    }

    // Gọi API để lấy hồ sơ tài khoản
    $.ajax({
        url: "http://localhost:8080/auth/hoso",
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (hoso) {
            localStorage.setItem("hoSo_MaKH", hoso.data.maKH);
            // Avatar
            if (hoso.data.hinhAnh) {
                $("#avatarPreview_navbar").attr("src", hoso.data.hinhAnh);
            }
            $(".user-name").text(hoso.data.hoTen || "Người dùng"); 
        },
        error: function (err) {
            console.error("Lỗi khi load hồ sơ:", err);
        }
    });
});