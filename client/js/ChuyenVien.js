// Lấy lại dữ liệu
let selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
let selectedSpecialist = JSON.parse(localStorage.getItem("selectedStaff") || null); 
localStorage.removeItem("selectedDV");        // key cũ nếu có
localStorage.removeItem("selectedSpecialist"); 

const urlParams = new URLSearchParams(window.location.search);
const maNCC = urlParams.get('maNCC');
console.log("Mã NCC:", maNCC);

// Load chuyên viên
async function loadChuyenVienPage(maNCC) {
    try {
        const res = await callApi(`/nhanvien/ncc/${maNCC}`, 'GET');
        const container = $("#specialistsList");
        container.empty();

        if (res && res.data && res.data.length > 0) {
            res.data.forEach(sv => {
                const isSelected = selectedSpecialist && selectedSpecialist.maNV === sv.maNV ? 'selected specialist-card-selected' : '';
                container.append(`
                    <div class="specialist-card ${isSelected}" data-id="${sv.maNV}">
                        <img src="${sv.hinhAnh}" alt="${sv.hoTen}" class="specialist-avatar">
                        <div class="specialist-info">
                            <div class="specialist-name">${sv.hoTen}</div>
                        </div>
                        <button class="specialist-select-btn" data-id="${sv.maNV}">${selectedSpecialist && selectedSpecialist.maNV === sv.maNV ? 'Đã chọn' : 'Chọn'}</button>
                    </div>
                `);
            });
        } else {
            container.append(`<p>Không có chuyên viên nào.</p>`);
        }
    } catch (error) {
        console.error('Lỗi load chuyên viên:', error);
    }
}

// Render summary
function renderSummary() {
    const container = $("#summaryServices");
    const emptyText = $("#summaryEmpty");
    const totalSpan = $("#summaryTotal");
    const continueBtn = $("#continueBtn");

    container.empty();

    if (selectedServices.length === 0) {
        emptyText.show();
        totalSpan.text("0 VND");
        continueBtn.prop("disabled", true);
        return;
    }

    emptyText.hide();
    continueBtn.prop("disabled", false);

    let total = 0;

    selectedServices.forEach(sv => {
        total += Number(sv.gia);
        const staffText = selectedSpecialist ? ` với ${selectedSpecialist.ten}` : '';

        container.append(`
            <div class="summary-item d-flex justify-content-between mb-2 align-items-center">
                <div style="font-size:14px;">
                    <div class="summary-item-name">${sv.ten}</div>
                    <div style="color: #8e8e8eff" class="summary-item-time">
                        ${sv.thoigian} phút${staffText}
                    </div>
                </div>
                <span style="font-size:14px;" class="summary-item-price">${Number(sv.gia).toLocaleString()} ₫</span>
            </div>
        `);
    });

    totalSpan.text(total.toLocaleString() + " VND");
}

renderSummary();
loadChuyenVienPage(maNCC);

// Chọn chuyên viên (toggle 1 người cho tất cả dịch vụ)
$(document).on("click", ".specialist-select-btn", function () {
    const btn = $(this);
    const card = btn.closest(".specialist-card");
    const id = btn.data("id");
    const name = card.find(".specialist-name").text();

    if (selectedSpecialist && selectedSpecialist.maNV === id) {
        // Bỏ chọn
        selectedSpecialist = null;
        btn.removeClass("selected").text("Chọn");
        card.removeClass("specialist-card-selected");
    } else {
        // Chọn mới
        $(".specialist-select-btn").removeClass("selected").text("Chọn");
        $(".specialist-card").removeClass("specialist-card-selected");

        selectedSpecialist = { maNV: id, ten: name, hinhAnh: card.find("img.specialist-avatar").attr("src") };
        btn.addClass("selected").text("Đã chọn");
        card.addClass("specialist-card-selected");
    }

    renderSummary();
});

// Khi bấm tiếp tục, lưu nhân viên vào localStorage
$("#continueBtn").on("click", function () {
    if (selectedSpecialist) {
        localStorage.setItem("selectedStaff", JSON.stringify(selectedSpecialist));
    }
    localStorage.setItem("selectedServices", JSON.stringify(selectedServices));

    // Chuyển trang
    window.location.href = "ThoiGian.html?maNCC=" + maNCC;
});

$(".continue-btn-top").on("click", function () {
    localStorage.removeItem("selectedStaff");
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedDateTime");
});