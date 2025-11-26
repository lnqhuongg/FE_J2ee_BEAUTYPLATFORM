// carousel multiple items 
var multipleCardCarousel = document.querySelector(
    "#otherBusinesses"
);
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

// bắt đầu load dữ liệu
async function showBusinessInformation() {
    console.log("Vua vao trang chi tiet doanh nghiep");
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const maNCC = urlParams.get('maNCC');
        console.log("Mã NCC:", maNCC);

        showInfoBusiness(maNCC);
        showListRatings(maNCC);
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

async function showInfoBusiness(maNCC) {
    try {
        const res = await callApi('/nhacungcap/' + maNCC, 'GET');

        console.log(res);

        if (res && res.data) {
            // Update tên doanh nghiệp bằng jQuery
            $('.tenNCC').text(res.data.tenNCC);
            $('.NCC_gioithieu').text(res.data.gioiThieu);
            $('.NCC_diachi').text(res.data.diaChi);
        }

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

async function showListRatings(maNCC) {
    try {
        const res = await callApi('/danhgia/ncc/' + maNCC, 'GET');

        console.log(res);

        if (res && res.data) {
            // Update tên doanh nghiệp bằng jQuery
            let count = res.data.length;
            console.log("Số lượng đánh giá:", count);

            // Ví dụ cập nhật vào HTML
            $('.danhgia_soDanhGia').text(count);
        }

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

function showListService() {

}

function showListTypeService() {

}

function showListStaff() {

}

function showWorkingSchedule() {

}

showBusinessInformation();