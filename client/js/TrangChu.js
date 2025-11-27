// gợi ý thanh tìm kiếm
const input = document.getElementById('serviceInput');
const box = document.getElementById('suggestionBox');

if (input && box) {
    input.addEventListener('focus', () => {
        box.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        setTimeout(() => box.style.display = 'none', 150);
    });

    box.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            input.value = item.textContent;
            box.style.display = 'none';
        });
    });
}

// ==================== LOAD DỮ LIỆU TRANG CHỦ ====================

$(document).ready(function() {
    loadTopRatedBusinesses();
    loadNewBusinesses();
    loadStatistics();
});

// Load danh sách doanh nghiệp được đánh giá cao
async function loadTopRatedBusinesses() {
    try {
        const res = await callApi('/nhacungcap?page=0&size=10', 'GET');
        
        if (res && res.success && res.data && res.data.content) {
            const businesses = res.data.content;
            renderBusinessCarousel('#carouselTopRated', businesses);
        }
    } catch (error) {
        console.error('Lỗi khi load doanh nghiệp được đánh giá cao:', error);
    }
}

// Load danh sách doanh nghiệp mới
async function loadNewBusinesses() {
    try {
        const res = await callApi('/nhacungcap?page=0&size=10', 'GET');
        
        if (res && res.success && res.data && res.data.content) {
            const businesses = res.data.content;
            renderBusinessCarousel('#carouselNewBusinesses', businesses);
        }
    } catch (error) {
        console.error('Lỗi khi load doanh nghiệp mới:', error);
    }
}

// Render carousel doanh nghiệp
function renderBusinessCarousel(carouselId, businesses) {
    const carouselInner = $(carouselId).find('.carousel-inner');
    carouselInner.empty();
    
    businesses.forEach((business, index) => {
        const isActive = index === 0 ? 'active' : '';
        
        const cardHtml = `
            <div class="carousel-item ${isActive}">
                <a href="ChiTietDoanhNghiep.html?maNCC=${business.maNCC}" class="nav-link card link-card">
                    <div class="img-wrapper">
                        <img src="${business.hinhAnh || '../../uploads/providers/test-1.avif'}" 
                             class="d-block w-100" 
                             alt="${business.tenNCC}"
                             onerror="this.src='../../uploads/providers/test-1.avif'">
                    </div>
                    <div class="card-body">
                        <strong class="card-title">${business.tenNCC}</strong>
                        <div class="rating">
                            <span><strong>5.0</strong> <i class="fa-solid fa-star text-warning"></i></span>
                            (<span>0</span>)
                        </div>
                        <div class="address">${business.diaChi || 'Chưa cập nhật địa chỉ'}</div>
                        <div class="d-flex">
                            <span class="type-of-business">${business.tenLH || 'Dịch vụ làm đẹp'}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
        
        carouselInner.append(cardHtml);
    });
    
    // Khởi tạo carousel sau khi render xong
    initCarousel(carouselId);
}

// Khởi tạo carousel multiple items
function initCarousel(carouselId) {
    const multipleCardCarousel = document.querySelector(carouselId);
    
    if (!multipleCardCarousel) return;
    
    if (window.matchMedia("(min-width: 800px)").matches) {
        var carousel = new bootstrap.Carousel(multipleCardCarousel, {
            interval: false,
        });
        
        var carouselWidth = $(carouselId + " .carousel-inner")[0].scrollWidth;
        var cardWidth = $(carouselId + " .carousel-item").width();
        var scrollPosition = 0;
        
        $(carouselId + " .carousel-control-next").off('click').on("click", function () {
            if (scrollPosition < carouselWidth - cardWidth * 4) {
                scrollPosition += cardWidth;
                $(carouselId + " .carousel-inner").animate(
                    { scrollLeft: scrollPosition },
                    600
                );
            }
        });
        
        $(carouselId + " .carousel-control-prev").off('click').on("click", function () {
            if (scrollPosition > 0) {
                scrollPosition -= cardWidth;
                $(carouselId + " .carousel-inner").animate(
                    { scrollLeft: scrollPosition },
                    600
                );
            }
        });
    } else {
        $(multipleCardCarousel).addClass("slide");
    }
}

// Load thống kê
async function loadStatistics() {
    try {
        // Load số lượng doanh nghiệp
        const resNCC = await callApi('/nhacungcap?page=0&size=1', 'GET');
        if (resNCC && resNCC.success && resNCC.data) {
            $('.stat-business-count').text(resNCC.data.totalElements + ' +');
        }
        
        // Load số lượng nhân viên (tạm thời dùng số cố định hoặc tính tổng)
        $('.stat-staff-count').text('2.000 +');
        
        // Load số lượng khách hàng
        const resKH = await callApi('/khachhang?page=0&size=1', 'GET');
        if (resKH && resKH.success && resKH.data) {
            $('.stat-customer-count').text(resKH.data.totalElements + ' +');
        }
        
    } catch (error) {
        console.error('Lỗi khi load thống kê:', error);
    }
}

// ==================== XỬ LÝ TÌM KIẾM ====================

// Xử lý form tìm kiếm
$('.search_form').on('submit', function(e) {
    e.preventDefault();
    
    const keyword = $('#serviceInput').val().trim();
    
    if (keyword) {
        window.location.href = `TimKiem.html?keyword=${encodeURIComponent(keyword)}`;
    }
});

// ==================== LOAD DANH SÁCH TỈNH/THÀNH PHỐ ====================

// Danh sách tỉnh/thành phố Việt Nam (có thể lấy từ API nếu có)
const cities = [
    'Hồ Chí Minh',
    'Hà Nội', 
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bình Dương',
    'Đồng Nai',
    'Kiên Giang',
    'Long An',
    'Tiền Giang',
    'Bình Thuận',
    'Khánh Hòa',
    'Lâm Đồng'
];

// Render danh sách tỉnh/thành phố
function renderCities() {
    const cityScrollbar = $('.city-scrollbar');
    cityScrollbar.empty();
    
    cities.forEach((city, index) => {
        const isActive = index === 0 ? 'active' : '';
        const cityItem = `<li class="${isActive}" data-city="${city}">${city}</li>`;
        cityScrollbar.append(cityItem);
    });
    
    // Xử lý click chọn thành phố
    $('.city-scrollbar li').on('click', function() {
        $('.city-scrollbar li').removeClass('active');
        $(this).addClass('active');
        
        const selectedCity = $(this).data('city');
        loadBusinessByCity(selectedCity);
    });
}

// Load doanh nghiệp theo thành phố
async function loadBusinessByCity(city) {
    try {
        const res = await callApi(`/nhacungcap?page=0&size=50&diaChi=${encodeURIComponent(city)}`, 'GET');
        
        if (res && res.success && res.data && res.data.content) {
            renderCityContent(res.data.content);
        }
    } catch (error) {
        console.error('Lỗi khi load doanh nghiệp theo thành phố:', error);
    }
}

// Render nội dung theo thành phố
function renderCityContent(businesses) {
    const cityContentScrollbar = $('.city-content-scrollbar');
    cityContentScrollbar.empty();
    
    // Nhóm doanh nghiệp theo quận/huyện (giả sử địa chỉ có định dạng: "Quận X, Thành phố Y")
    const groupedByDistrict = {};
    
    businesses.forEach(business => {
        // Tách lấy quận/huyện từ địa chỉ
        const addressParts = business.diaChi.split(',');
        const district = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : 'Khác';
        
        if (!groupedByDistrict[district]) {
            groupedByDistrict[district] = [];
        }
        
        groupedByDistrict[district].push(business);
    });
    
    // Render từng quận/huyện
    Object.keys(groupedByDistrict).forEach(district => {
        const businessList = groupedByDistrict[district];
        const businessLinks = businessList.slice(0, 6).map(b => 
            `<li><a href="ChiTietDoanhNghiep.html?maNCC=${b.maNCC}">${b.tenNCC}</a></li>`
        ).join('');
        
        const districtHtml = `
            <div class="district-salon">
                <p class="fw-bold mb-2">${district}</p>
                <ul>
                    ${businessLinks}
                </ul>
            </div>
        `;
        
        cityContentScrollbar.append(districtHtml);
    });
}

// Khởi tạo danh sách thành phố khi load trang
$(document).ready(function() {
    renderCities();
    loadBusinessByCity('Hồ Chí Minh'); // Load mặc định TP.HCM
});