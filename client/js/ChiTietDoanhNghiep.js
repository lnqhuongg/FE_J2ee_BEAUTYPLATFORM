// carousel multiple items 
var multipleCardCarousel = document.querySelector("#otherBusinesses");
if (window.matchMedia("(min-width: 800px)").matches) {
    var carousel = new bootstrap.Carousel(multipleCardCarousel, {
        interval: false,
    });
    var carouselWidth = $(".carousel-inner")[0].scrollWidth;
    var cardWidth = $(".carousel-item").width();
    var scrollPosition = 0;
    $("#otherBusinesses .carousel-control-next").on("click", function () {
        if (scrollPosition < carouselWidth - cardWidth * 4) {
            scrollPosition += cardWidth;
            $("#otherBusinesses .carousel-inner").animate(
                { scrollLeft: scrollPosition },
                600
            );
        }
    });
    $("#otherBusinesses .carousel-control-prev").on("click", function () {
        if (scrollPosition > 0) {
            scrollPosition -= cardWidth;
            $("#otherBusinesses .carousel-inner").animate(
                { scrollLeft: scrollPosition },
                600
            );
        }
    });
} else {
    $(multipleCardCarousel).addClass("slide");
}

// ==================== LOAD DỮ LIỆU CHI TIẾT DOANH NGHIỆP ====================

$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const maNCC = urlParams.get('maNCC');
    
    if (!maNCC) {
        alert('Không tìm thấy thông tin doanh nghiệp');
        window.location.href = 'TrangChu.html';
        return;
    }
    
    loadBusinessDetail(maNCC);
});

// Load tất cả thông tin của doanh nghiệp
async function loadBusinessDetail(maNCC) {
    try {
        // Load thông tin cơ bản
        await showInfoBusiness(maNCC);
        
        // Load đánh giá
        await showListRatings(maNCC);
        
        // Load loại dịch vụ
        await showListTypeService(maNCC);
        
        // Load nhân viên
        await showListStaff(maNCC);
        
        // Load giờ làm việc
        await showWorkingSchedule(maNCC);
        
        // Load hình ảnh
        await showImages(maNCC);
        
        // Load doanh nghiệp khác
        await loadOtherBusinesses();
        
    } catch (error) {
        console.error('Lỗi khi load thông tin doanh nghiệp:', error);
    }
}

// Load thông tin cơ bản của doanh nghiệp
async function showInfoBusiness(maNCC) {
    try {
        const res = await callApi('/nhacungcap/' + maNCC, 'GET');

        if (res && res.success && res.data) {
            // Cập nhật tên doanh nghiệp
            $('.tenNCC').text(res.data.tenNCC);
            
            // Cập nhật giới thiệu
            $('.NCC_gioithieu').text(res.data.gioiThieu || 'Chưa có giới thiệu');
            
            // Cập nhật địa chỉ
            $('.NCC_diachi').text(res.data.diaChi);
            
            // Cập nhật loại hình
            $('.loaihinh').text(res.data.tenLH || 'Dịch vụ làm đẹp');
        }

    } catch (error) {
        console.error('Lỗi khi load thông tin doanh nghiệp:', error);
    }
}

// Load danh sách đánh giá
async function showListRatings(maNCC) {
    try {
        const res = await callApi('/danhgia/ncc/' + maNCC + '?diemDanhGia=0', 'GET');

        if (res && res.success && res.data) {
            const reviews = res.data;
            const totalReviews = reviews.length;
            
            // Cập nhật số lượng đánh giá
            $('.danhgia_soDanhGia').text(totalReviews);
            
            if (totalReviews > 0) {
                // Tính điểm trung bình
                const totalPoints = reviews.reduce((sum, review) => {
                    return sum + (review.diemDanhGia || 0);
                }, 0);
                
                const averageRating = (totalPoints / totalReviews).toFixed(1);
                
                // Cập nhật điểm trung bình
                $('.rating-average').text(averageRating);
                
                // Render danh sách đánh giá (hiển thị 4 đánh giá đầu)
                renderReviews(reviews.slice(0, 4));
            } else {
                $('.rating-average').text('0.0');
                $('.business-rating-section .row').html('<p class="text-muted">Chưa có đánh giá nào</p>');
            }
        }

    } catch (error) {
        console.error('Lỗi khi load đánh giá:', error);
    }
}

// Render danh sách đánh giá
function renderReviews(reviews) {
    const reviewContainer = $('.business-rating-section .row');
    reviewContainer.empty();
    
    reviews.forEach(review => {
        const stars = generateStars(review.diemDanhGia);
        const date = new Date(review.ngayDanhGia);
        const formattedDate = `vào ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ngày ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
        
        // Lấy tên khách hàng từ datLich
        const customerName = review.datLich?.khachHang?.hoTen || 'Khách hàng';
        const customerAvatar = review.datLich?.khachHang?.hinhAnh || '../img/image.png';
        
        const reviewHtml = `
            <div class="col rating mb-3">
                <div class="customer-rating d-flex align-items-center">
                    <div class="img-wrapper-rating">
                        <img src="${customerAvatar}" 
                             style="width: 60px; border-radius: 50%;" 
                             alt="${customerName}"
                             onerror="this.src='../img/image.png'">
                    </div>
                    <div class="rating-info ms-2">
                        <strong>${customerName}</strong>
                        <p class="mb-0" style="font-size: 13.5px; color: #a0a0a0;">${formattedDate}</p>
                    </div>
                </div>
                <div class="rating-star mt-2">
                    ${stars}
                </div>
                <div class="rating-feedback">
                    <p class="mb-2">${review.noiDung || 'Không có nhận xét'}</p>
                </div>
            </div>
        `;
        
        reviewContainer.append(reviewHtml);
    });
}

// Tạo chuỗi sao HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fa-solid fa-star text-warning"></i>';
        } else {
            stars += '<i class="fa-regular fa-star text-warning"></i>';
        }
    }
    return stars;
}

// Load danh sách loại dịch vụ
async function showListTypeService(maNCC) {
    try {
        const res = await callApi('/loaidichvu/ncc/' + maNCC, 'GET');
        
        if (res && res.success && res.data && res.data.length > 0) {
            renderServiceTypeTabs(res.data, maNCC);
        } else {
            $('.type-service-list').html('<p class="text-muted">Chưa có loại dịch vụ nào</p>');
        }
    } catch (error) {
        console.error('Lỗi khi load loại dịch vụ:', error);
    }
}

// Render tabs loại dịch vụ
function renderServiceTypeTabs(serviceTypes, maNCC) {
    const tabContainer = $('.type-service-list ul');
    tabContainer.empty();
    
    serviceTypes.forEach((type, index) => {
        const isActive = index === 0 ? 'active' : '';
        const tabHtml = `<li class="${isActive}" data-ma-ldv="${type.maLDV}">${type.tenLDV}</li>`;
        tabContainer.append(tabHtml);
    });
    
    // Load dịch vụ của tab đầu tiên
    if (serviceTypes.length > 0) {
        loadServicesByType(maNCC, serviceTypes[0].maLDV);
    }
    
    // Xử lý click chọn tab
    tabContainer.find('li').on('click', function() {
        tabContainer.find('li').removeClass('active');
        $(this).addClass('active');
        
        const maLDV = $(this).data('ma-ldv');
        loadServicesByType(maNCC, maLDV);
    });
}

// Load dịch vụ theo loại
async function loadServicesByType(maNCC, maLDV) {
    try {
        const res = await callApi(`/dichvu/ldv/${maLDV}/ncc/${maNCC}`, 'GET');
        
        if (res && res.success && res.data && res.data.length > 0) {
            renderServices(res.data);
        } else {
            $('.service-list').html('<p class="text-muted">Chưa có dịch vụ nào</p>');
        }
    } catch (error) {
        console.error('Lỗi khi load dịch vụ:', error);
        $('.service-list').html('<p class="text-danger">Có lỗi xảy ra khi tải dịch vụ</p>');
    }
}

// Render danh sách dịch vụ
function renderServices(services) {
    const serviceContainer = $('.service-list');
    serviceContainer.empty();
    
    services.forEach(service => {
        const price = new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(service.gia);
        
        const serviceHtml = `
            <div class="service-preview mb-3" 
                 data-bs-toggle="modal" 
                 data-bs-target="#serviceModal"
                 data-service-name="${service.tenDV}"
                 data-service-price="${price}"
                 data-service-time="${service.thoiLuong}"
                 data-service-desc="${service.moTa || 'Không có mô tả'}">
                <div>
                    <strong>${service.tenDV}</strong>
                    <p style="font-size: 14px; color: #818181;">${service.thoiLuong} phút</p>
                </div>
                <div>
                    <strong>${price}</strong>
                </div>
            </div>
        `;
        
        serviceContainer.append(serviceHtml);
    });
    
    // Xử lý click hiển thị modal
    $('.service-preview').on('click', function() {
        const name = $(this).data('service-name');
        const price = $(this).data('service-price');
        const time = $(this).data('service-time');
        const desc = $(this).data('service-desc');
        
        $('#serviceModal .service-name').text(name);
        $('#serviceModal .modal-body p').text(desc);
        $('#serviceModal .modal-body strong').first().text(price);
        $('#serviceModal .modal-body p').last().text(time + ' phút');
    });
}

// Load danh sách nhân viên
async function showListStaff(maNCC) {
    try {
        const res = await callApi('/nhanvien/ncc/' + maNCC, 'GET');
        
        if (res && res.success && res.data && res.data.length > 0) {
            renderStaff(res.data);
        } else {
            $('.staff-at-business .row').html('<p class="text-muted">Chưa có nhân viên nào</p>');
        }
    } catch (error) {
        console.error('Lỗi khi load nhân viên:', error);
    }
}

// Render danh sách nhân viên
function renderStaff(staffList) {
    const staffContainer = $('.staff-at-business .row');
    staffContainer.empty();
    
    staffList.forEach(staff => {
        const avatar = staff.hinhAnh || '../img/image.png';
        const phone = staff.sdt || 'Chưa cập nhật';
        
        const staffHtml = `
            <div class="col staff mb-1">
                <div class="d-flex justify-content-center mb-2 img-wapper">
                    <img src="${avatar}" 
                         style="width: 90px; border-radius: 50%;" 
                         alt="${staff.hoTen}"
                         onerror="this.src='../img/image.png'">
                </div>
                <p class="staff-name text-center mb-0" style="font-size: 15px;">
                    ${staff.hoTen}
                </p>
                <p class="staff-name text-center" style="font-size: 15px;">
                    ${phone}
                </p>
            </div>
        `;
        
        staffContainer.append(staffHtml);
    });
}

// Load giờ làm việc
async function showWorkingSchedule(maNCC) {
    try {
        const res = await callApi(`/nhacungcap/${maNCC}/giolamviec`, 'GET');
        
        if (res && res.success && res.data && res.data.length > 0) {
            renderWorkingSchedule(res.data);
        }
    } catch (error) {
        console.error('Lỗi khi load giờ làm việc:', error);
    }
}

// Render giờ làm việc
function renderWorkingSchedule(schedule) {
    const days = ['', '', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
    
    schedule.forEach(item => {
        const dayName = days[item.ngayTrongTuan] || 'Không xác định';
        const openTime = item.gioMoCua || '00:00';
        const closeTime = item.gioDongCua || '00:00';
        
        $(`.opening-time div:contains("${dayName}") span`).text(`${openTime} - ${closeTime}`);
    });
}

// Load hình ảnh
async function showImages(maNCC) {
    try {
        const res = await callApi(`/nhacungcap/${maNCC}/hinhanh`, 'GET');
        
        if (res && res.success && res.data && res.data.length > 0) {
            renderImages(res.data);
        }
    } catch (error) {
        console.error('Lỗi khi load hình ảnh:', error);
    }
}

// Render hình ảnh
function renderImages(images) {
    // Tìm ảnh chính
    const mainImage = images.find(img => img.imageMain === '1') || images[0];
    
    if (mainImage) {
        $('.main-image img').attr('src', mainImage.imageUrl);
    }
    
    // Render ảnh phụ (tối đa 2 ảnh)
    const thumbImages = images.filter(img => img.imageMain !== '1').slice(0, 2);
    
    $('.thumbs').empty();
    thumbImages.forEach(img => {
        $('.thumbs').append(`
            <div class="thumb">
                <img src="${img.imageUrl}" alt="thumb" />
            </div>
        `);
    });
}

// Load doanh nghiệp khác
async function loadOtherBusinesses() {
    try {
        const res = await callApi('/nhacungcap?page=0&size=10', 'GET');
        
        if (res && res.success && res.data && res.data.content) {
            renderOtherBusinesses(res.data.content);
        }
    } catch (error) {
        console.error('Lỗi khi load doanh nghiệp khác:', error);
    }
}

// Render doanh nghiệp khác
function renderOtherBusinesses(businesses) {
    const carousel = $('#otherBusinesses .carousel-inner');
    carousel.empty();
    
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
                        <div class="address">${business.diaChi}</div>
                        <div class="d-flex">
                            <span class="type-of-business">${business.tenLH || 'Dịch vụ làm đẹp'}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
        
        carousel.append(cardHtml);
    });
}