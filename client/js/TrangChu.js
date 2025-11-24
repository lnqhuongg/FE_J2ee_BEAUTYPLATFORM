// navbar sticky
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// gợi ý thanh tìm kiếm
const input = document.getElementById('serviceInput');
const box = document.getElementById('suggestionBox');

if (input && box) {
    input.addEventListener('focus', () => {
        box.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        // chờ 1 chút để click vào item không bị ẩn ngay
        setTimeout(() => box.style.display = 'none', 150);
    });

    // click vào item gợi ý
    box.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            input.value = item.textContent;
            box.style.display = 'none';
        });
    });
}

// carousel multiple items 
var multipleCardCarousel = document.querySelector(
    "#carouselExampleControls"
);
if (window.matchMedia("(min-width: 800px)").matches) {
    var carousel = new bootstrap.Carousel(multipleCardCarousel, {
        interval: false,
    });
    var carouselWidth = $(".carousel-inner")[0].scrollWidth;
    var cardWidth = $(".carousel-item").width();
    var scrollPosition = 0;
    $("#carouselExampleControls .carousel-control-next").on("click", function () {
        if (scrollPosition < carouselWidth - cardWidth * 4) {
            scrollPosition += cardWidth;
            $("#carouselExampleControls .carousel-inner").animate(
                { scrollLeft: scrollPosition },
                600
            );
        }
    });
    $("#carouselExampleControls .carousel-control-prev").on("click", function () {
        if (scrollPosition > 0) {
            scrollPosition -= cardWidth;
            $("#carouselExampleControls .carousel-inner").animate(
                { scrollLeft: scrollPosition },
                600
            );
        }
    });
} else {
    $(multipleCardCarousel).addClass("slide");
}