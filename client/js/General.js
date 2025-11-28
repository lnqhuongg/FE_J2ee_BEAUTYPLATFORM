// navbar sticky
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================== KIỂM TRA ĐĂNG NHẬP ====================

$(document).ready(function () {
    checkLoginStatus();
});

// Kiểm tra trạng thái đăng nhập
async function checkLoginStatus() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        // Chưa đăng nhập - Hiển thị nút đăng nhập
        showLoginButton();
        return;
    }

    try {
        // Gọi API validate token
        const res = await $.ajax({
            url: "http://localhost:8080/auth/validate",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ token: token })
        });

        if (res && res.success && res.data && res.data.valid) {
            // Token hợp lệ - Load thông tin user
            await loadUserProfile();
        } else {
            // Token không hợp lệ - Xóa và hiển thị nút đăng nhập
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('hoSo_MaKH');
            showLoginButton();
        }
    } catch (error) {
        console.error("Lỗi khi validate token:", error);
        // Lỗi - Xóa token và hiển thị nút đăng nhập
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('hoSo_MaKH');
        showLoginButton();
    }
}

// Hiển thị nút đăng nhập (khi chưa đăng nhập)
function showLoginButton() {
    // Ẩn dropdown profile
    $('.dropdown-container').hide();
    
    // Hiển thị nút đăng nhập cho khách hàng
    $('.btn-nav-client').show().on('click', function() {
        window.location.href = '/client/pages/Auth.html';
    });
    
    // Hiển thị nút đăng nhập cho doanh nghiệp
    $('.btn-nav-business').show().on('click', function() {
        window.location.href = '/client/pages/Auth.html';
    });
}

// Hiển thị profile (khi đã đăng nhập)
function showProfileDropdown() {
    // Ẩn các nút đăng nhập
    $('.btn-nav-client').hide();
    $('.btn-nav-business').hide();
    
    // Hiển thị dropdown profile
    $('.dropdown-container').show();
}

// Load thông tin user
async function loadUserProfile() {
    const token = localStorage.getItem("token");
    
    try {
        const hoso = await $.ajax({
            url: "http://localhost:8080/auth/hoso",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (hoso && hoso.success && hoso.data) {
            // Lưu thông tin user
            localStorage.setItem("hoSo_MaKH", hoso.data.maKH || '');
            
            // Hiển thị dropdown profile
            showProfileDropdown();
            
            // Cập nhật avatar
            if (hoso.data.hinhAnh) {
                $("#avatarPreview_navbar").attr("src", hoso.data.hinhAnh);
            } else {
                $("#avatarPreview_navbar").attr("src", "../img/image.png");
            }
            
            // Cập nhật tên user
            $(".user-name").text(hoso.data.hoTen || hoso.data.tenNCC || "Người dùng");
            
            // Ẩn nút đăng nhập doanh nghiệp nếu là khách hàng
            if (hoso.data.loaiTK === 3) {
                $(".btn-nav-business").hide();
            }
        } else {
            showLoginButton();
        }
    } catch (error) {
        console.error("Lỗi khi load hồ sơ:", error);
        showLoginButton();
    }
}

// ==================== XỬ LÝ DROPDOWN PROFILE ====================

// Dropdown profile
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', function (event) {
        if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
}

// ==================== XỬ LÝ CÁC MENU ITEM ====================

// Xử lý click menu items
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', function () {
        const text = this.querySelector('.menu-item-text').textContent;
        
        switch(text) {
            case 'Đăng xuất':
                handleLogout();
                break;
            case 'Hồ sơ':
                window.location.href = '/client/pages/QLHoSo.html';
                break;
            case 'Các cuộc hẹn':
                window.location.href = '/client/pages/CuocHen.html';
                break;
            case 'Mục yêu thích':
                window.location.href = '/client/pages/YeuThich.html';
                break;
            case 'Cài đặt':
                window.location.href = '/client/pages/CaiDat.html';
                break;
        }
    });
});

// Xử lý đăng xuất
function handleLogout() {
    // Xóa token và thông tin user khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('hoSo_MaKH');
    
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/client/pages/Auth.html';
}