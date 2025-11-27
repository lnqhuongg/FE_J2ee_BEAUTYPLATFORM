// ----------------------
let selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
let selectedSpecialist = JSON.parse(localStorage.getItem("selectedStaff") || null);

const urlParams = new URLSearchParams(window.location.search);
const maNCC = urlParams.get('maNCC');
console.log("Mã NCC:", maNCC);

async function loadThoiGianPage(maNCC) {
    try {
        loadNgay(maNCC);
        if (selectedSpecialist) {
            $("#imgChuyenVien").attr("src", selectedSpecialist.hinhAnh);
            $("#tenChuyenVien").text(selectedSpecialist.ten);
        }
    } catch (error) {
        console.error('Lỗi load chuyên viên:', error);
    }
}

async function loadNgay(maNCC) {
    try {
        const res = await callApi(`/datlich/valid-dates/${maNCC}`, 'GET');

        if (!res || !res.data) return;

        const dates = res.data;
        const tabContainer = $('#tabDates');
        tabContainer.empty();

        dates.forEach((dateStr, index) => {

            const date = new Date(dateStr);
            const day = date.getDate();
            const thu = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"][date.getDay()];

            const active = index === 0 ? "active" : "";

            tabContainer.append(`
                <div class="date-item ${active}" 
                    data-date="${dateStr}">
                    ${day}<br><span>${thu}</span>
                </div>
            `);
        });

        // Gắn sự kiện chọn ngày
        $("#tabDates .date-item").on("click", function () {
            if ($(this).hasClass("disabled")) return;

            $("#tabDates .date-item").removeClass("active");
            $(this).addClass("active");

            const ngay = $(this).data("date");
            loadThoiGian(maNCC, ngay);
        });

        // Auto load ngày đầu tiên
        if (dates.length > 0) {
            loadThoiGian(maNCC, dates[0]);
        }

    } catch (err) {
        console.error("Lỗi load ngày:", err);
    }
}


async function loadThoiGian(maNCC, ngay) {
    try {
        let totalTime = 0;

        selectedServices.forEach(sv => {
            totalTime += Number(sv.thoigian);
        });

        const maNV = selectedSpecialist.maNV;

        const url = `/datlich/available-times?maNCC=${maNCC}&maNV=${maNV}&ngay=${ngay}&giodichvu=${totalTime}`;

        const res = await callApi(url, "GET");

        const timeList = $("#timeList");
        timeList.empty();

        if (!res || !res.data || res.data.length === 0) {
            timeList.append(`<div class="text-muted">Không có giờ trống</div>`);
            return;
        }

        res.data.forEach(time => {
            const label = time.substring(0, 5);
            timeList.append(`
                <div class="time-item" data-time="${time}">${label}</div>
            `);
        });

        // Toggle — chỉ được chọn 1 giờ
        $("#timeList .time-item").on("click", function () {
            $("#timeList .time-item").removeClass("active");
            $(this).addClass("active");
        });

    } catch (err) {
        console.error("Lỗi load thời gian:", err);
    }
}

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

loadThoiGianPage(maNCC);
renderSummary();

$("#continueBtn").on("click", function () {

    const ngay = $("#tabDates .date-item.active").data("date");
    const gio = $("#timeList .time-item.active").data("time");

    if (!ngay || !gio) {
        alert("Vui lòng chọn ngày và giờ!");
        return;
    }

    const selectedBooking = {
        date: ngay,
        time: gio
    };

    // Lưu xuống localStorage
    localStorage.setItem("selectedDateTime", JSON.stringify(selectedBooking));

    // Chuyển trang
    window.location.href = "XacNhan.html?maNCC=" + maNCC;
});

$(".continue-btn-top").on("click", function () {
    localStorage.removeItem("selectedStaff");
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedDateTime");
});