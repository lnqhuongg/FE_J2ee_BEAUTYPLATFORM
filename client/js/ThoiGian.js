document.querySelectorAll(".date-item:not(.disabled)").forEach(item => {
    item.addEventListener("click", function () {
        document.querySelectorAll(".date-item").forEach(d => d.classList.remove("active"));
        this.classList.add("active");
    });
});

// -------------------
// SELECT TIME
// -------------------
const timeItems = document.querySelectorAll(".time-item");
const continueBtn = document.getElementById("continueBtn");

timeItems.forEach(item => {
    item.addEventListener("click", function () {

        timeItems.forEach(t => t.classList.remove("active"));
        this.classList.add("active");

        continueBtn.classList.add("enabled");
        continueBtn.disabled = false;
    });
});

// Continue
continueBtn.addEventListener("click", () => {
    alert("Bạn đã chọn giờ!");
});
const dateList = document.getElementById('dateList');
const btnLeft = document.querySelector('.scroll-btn.left');
const btnRight = document.querySelector('.scroll-btn.right');

const dateItems = dateList.querySelectorAll('.date-item');

// Hàm scroll ngày vào giữa
function scrollToCenter(element) {
    const containerWidth = dateList.offsetWidth;
    const elementWidth = element.offsetWidth;
    const elementLeft = element.offsetLeft;
    const scrollPos = elementLeft - (containerWidth / 2) + (elementWidth / 2);
    dateList.scrollTo({ left: scrollPos, behavior: 'smooth' });
}

// Bấm nút trái/phải scroll
btnLeft.addEventListener('click', () => {
    dateList.scrollBy({ left: -260, behavior: 'smooth' }); // 4 ô mỗi lần
});

btnRight.addEventListener('click', () => {
    dateList.scrollBy({ left: 260, behavior: 'smooth' });
});

// Bấm chọn ngày
dateItems.forEach(item => {
    item.addEventListener('click', () => {
        if(item.classList.contains('disabled')) return;
        dateList.querySelector('.date-item.active').classList.remove('active');
        item.classList.add('active');
        scrollToCenter(item);
    });
});
