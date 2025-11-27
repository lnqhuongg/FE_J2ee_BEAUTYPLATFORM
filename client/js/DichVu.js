const urlParams = new URLSearchParams(window.location.search);
const maNCC = urlParams.get('maNCC');
console.log("Mã NCC:", maNCC);

// bắt đầu load dữ liệu
async function loadDichVuPage() {
    console.log("Vua vao trang chon dich vu");
    try {
        loadLDV(maNCC);
        loadNCC(maNCC);
        loadRatings(maNCC);
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

function renderSummary() {
    const container = $("#summary-services");
    const emptyText = $("#summary-empty");
    const totalSpan = $("#summary-total");
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
        total += sv.gia;

        container.append(`
            <div class="summary-item d-flex justify-content-between mb-2 align-items-center">
                <div style="font-size:14px;">
                    <div class="summary-item-name">${sv.ten}</div>
                    <div style="color: #8e8e8eff" class="summary-item-time">${sv.thoigian} phút</div>
                </div>
                <span style="font-size:14px;" class="summary-item-price">${sv.gia.toLocaleString()} ₫</span>
            </div>
        `);
    });

    totalSpan.text(total.toLocaleString() + " VND");

    continueBtn.prop("disabled", selectedServices.length === 0);
}

let selectedServices = [];

$(document).on("click", ".service-add-btn", function () {
    const btn = $(this);
    const card = btn.closest(".service-card");
    const id = btn.data("id");

    const index = selectedServices.findIndex(s => s.maDV === id);

    if (index === -1) {
        // chọn
        selectedServices.push({
            maDV: id, 
            ten: btn.data("ten"),
            gia: Number(btn.data("gia")),
            thoigian: btn.data("thoigian")
        });

        btn.addClass("selected");
        card.addClass("service-card-selected");

    } else {
        // bỏ chọn
        selectedServices.splice(index, 1);

        btn.removeClass("selected");
        card.removeClass("service-card-selected");
    }

    renderSummary();
});

async function loadDichVu(maLDV, maNCC) {
    try {
        const res = await callApi(`/dichvu/ldv/${maLDV}/ncc/${maNCC}`, 'GET');

        const tabPane = $(`#tab-${maLDV}`);
        tabPane.empty();

        if (res && res.data && res.data.length > 0) {

            res.data.forEach(dv => {
                tabPane.append(`
                    <div class="service-card">
                        <div>
                            <div class="service-info-title">${dv.tenDV}</div>
                            <div class="service-info-meta">${dv.thoiLuong} phút</div>
                            <div class="service-info-meta">${dv.moTa}</div>
                            <div class="service-info-price">${dv.gia.toLocaleString()} ₫</div>
                        </div>
                        <button class="service-add-btn"
                                data-id="${dv.maDV}"
                                data-ten="${dv.tenDV}"
                                data-gia="${dv.gia}"
                                data-thoigian="${dv.thoiLuong}">
                            <span>+</span>
                        </button>
                    </div>
                `);
            });

        } else {
            tabPane.append(`<p class="text-muted">Không có dịch vụ nào.</p>`);
        }

    } catch (error) {
        console.error('Lỗi load dịch vụ:', error);
    }
}

async function loadLDV(maNCC) {
    try {
        const res = await callApi('/loaidichvu/ncc/' + maNCC, 'GET');

        if (res && res.data) {
            const list = res.data;
            const tabContainer = $('#tabLDV');
            const tabContent = $('#tabContentLDV');

            tabContainer.empty();
            tabContent.empty();

            list.forEach((item, index) => {
                const active = index === 0 ? 'active' : '';
                const activePane = index === 0 ? 'show active' : '';

                // Tạo TAB
                tabContainer.append(`
                    <li class="nav-item">
                        <button class="nav-link ${active}" 
                                data-ma="${item.maLDV}"
                                data-bs-toggle="tab"
                                data-bs-target="#tab-${item.maLDV}">
                            ${item.tenLDV}
                        </button>
                    </li>
                `);

                // Tạo TAB CONTENT (rỗng - sẽ load sau)
                tabContent.append(`
                    <div class="tab-pane fade ${activePane}" id="tab-${item.maLDV}">
                        <div class="service-loading text-muted">Đang tải...</div>
                    </div>
                `);
            });

            // Load tab đầu tiên
            if (list.length > 0) {
                loadDichVu(list[0].maLDV, maNCC);
            }

            // Bắt sự kiện mỗi khi chuyển tab
            $('#tabLDV .nav-link').on('shown.bs.tab', function () {
                const maLDV = $(this).data('ma');
                loadDichVu(maLDV, maNCC);
            });
        }
    } catch (error) {
        console.error('Lỗi load LDV:', error);
    }
}

async function loadNCC(maNCC) {
    try {
        const res = await callApi('/nhacungcap/' + maNCC, 'GET');

        if (res && res.data) {
            // Update tên doanh nghiệp bằng jQuery
            $('#tenNCC').text(res.data.tenNCC);
            $('#NCC_diachi').text(res.data.diaChi);
        }

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

async function loadRatings(maNCC) {
    try {
        const res = await callApi('/danhgia/ncc/' + maNCC, 'GET');

        if (res && res.data) {
            let count = res.data.length;
            console.log("Số lượng đánh giá:", count);
            $('#danhgia_soDanhGia').text(count);
        }

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

loadDichVuPage();

$("#continueBtn").on("click", function () {
    localStorage.setItem("selectedServices", JSON.stringify(selectedServices)); 

    window.location.href = "ChuyenVien.html?maNCC=" + maNCC; // chỉnh lại theo trang bạn muốn
});

$(".continue-btn-top").on("click", function () {
    localStorage.removeItem("selectedStaff");
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedDateTime");
});