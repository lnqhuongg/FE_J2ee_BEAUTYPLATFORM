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

            // Lấy hình ảnh cho từng doanh nghiệp
            for (let business of businesses) {
                const imagesRes = await callApi(`/nhacungcap/${business.maNCC}/hinhanh`, 'GET');
                business.images = imagesRes && imagesRes.success ? imagesRes.data : [];
                const mainImage = business.images.find(img => img.imageMain == 1);
                business.hinhAnh = mainImage ? mainImage.imageUrl : null;
                console.log(business);
            }
            
            // Load đánh giá cho từng doanh nghiệp
            const businessesWithRatings = await Promise.all(
                businesses.map(async (business) => {
                    const rating = await loadRatingForBusiness(business.maNCC);
                    return { ...business, rating };
                })
            );
            
            renderBusinessCarousel('#carouselTopRated', businessesWithRatings);
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

            // Lấy hình ảnh cho từng doanh nghiệp
            for (let business of businesses) {
                const imagesRes = await callApi(`/nhacungcap/${business.maNCC}/hinhanh`, 'GET');
                business.images = imagesRes && imagesRes.success ? imagesRes.data : [];
                const mainImage = business.images.find(img => img.imageMain == 1);
                business.hinhAnh = mainImage ? mainImage.imageUrl : null;
                console.log(business);
            }
            
            // Load đánh giá cho từng doanh nghiệp
            const businessesWithRatings = await Promise.all(
                businesses.map(async (business) => {
                    const rating = await loadRatingForBusiness(business.maNCC);
                    return { ...business, rating };
                })
            );
            
            renderBusinessCarousel('#carouselNewBusinesses', businessesWithRatings);
        }
    } catch (error) {
        console.error('Lỗi khi load doanh nghiệp mới:', error);
    }
}

// Load đánh giá cho một doanh nghiệp
async function loadRatingForBusiness(maNCC) {
    try {
        const res = await callApi(`/danhgia/ncc/${maNCC}?diemDanhGia=0`, 'GET');
        
        if (res && res.success && res.data && Array.isArray(res.data)) {
            const reviews = res.data;
            const totalReviews = reviews.length;
            
            if (totalReviews === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    stars: '☆☆☆☆☆'
                };
            }
            
            // Tính điểm trung bình
            const totalPoints = reviews.reduce((sum, review) => {
                return sum + (review.diemDanhGia || 0);
            }, 0);
            
            const averageRating = (totalPoints / totalReviews).toFixed(1);
            
            // Tạo chuỗi sao
            const stars = generateStars(parseFloat(averageRating));
            
            return {
                averageRating: parseFloat(averageRating),
                totalReviews: totalReviews,
                stars: stars
            };
        }
        
        return {
            averageRating: 0,
            totalReviews: 0,
            stars: '☆☆☆☆☆'
        };
        
    } catch (error) {
        console.error(`Lỗi khi load đánh giá cho NCC ${maNCC}:`, error);
        return {
            averageRating: 0,
            totalReviews: 0,
            stars: '☆☆☆☆☆'
        };
    }
}

// Tạo chuỗi sao dựa trên điểm đánh giá
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Sao đầy
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa-solid fa-star text-warning"></i>';
    }
    
    // Sao nửa (nếu có)
    if (hasHalfStar) {
        stars += '<i class="fa-solid fa-star-half-stroke text-warning"></i>';
    }
    
    // Sao rỗng
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa-regular fa-star text-warning"></i>';
    }
    
    return stars;
}

// Render carousel doanh nghiệp
function renderBusinessCarousel(carouselId, businesses) {
    const carouselInner = $(carouselId).find('.carousel-inner');
    carouselInner.empty();
    
    if (!businesses || businesses.length === 0) {
        carouselInner.html('<div class="carousel-item active"><p class="text-center">Không có dữ liệu</p></div>');
        return;
    }
    
    businesses.forEach((business, index) => {
        const isActive = index === 0 ? 'active' : '';
        const rating = business.rating || { averageRating: 0, totalReviews: 0, stars: '☆☆☆☆☆' };
        
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
                            <span><strong>${rating.averageRating.toFixed(1)}</strong> ${rating.stars}</span>
                            (<span>${rating.totalReviews}</span>)
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
        
        // Load số lượng nhân viên
        const resNV = await callApi('/nhanvien?page=0&size=1', 'GET');
        if (resNV && resNV.success && resNV.data) {
            $('.stat-staff-count').text(resNV.data.totalElements + ' +');
        }
        
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

// Danh sách tỉnh/thành phố Việt Nam
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
        } else {
            $('.city-content-scrollbar').html('<p class="text-muted">Không có doanh nghiệp nào tại khu vực này</p>');
        }
    } catch (error) {
        console.error('Lỗi khi load doanh nghiệp theo thành phố:', error);
        $('.city-content-scrollbar').html('<p class="text-danger">Có lỗi xảy ra khi tải dữ liệu</p>');
    }
}

// Render nội dung theo thành phố
function renderCityContent(businesses) {
    const cityContentScrollbar = $('.city-content-scrollbar');
    cityContentScrollbar.empty();
    
    if (!businesses || businesses.length === 0) {
        cityContentScrollbar.html('<p class="text-muted">Không có doanh nghiệp nào</p>');
        return;
    }
    
    // Nhóm doanh nghiệp theo quận/huyện
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