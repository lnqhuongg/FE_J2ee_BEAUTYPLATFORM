let selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
let selectedSpecialist = JSON.parse(localStorage.getItem("selectedStaff") || null);
let selectedDateTime = JSON.parse(localStorage.getItem("selectedDateTime") || null);
const maKH = Number(localStorage.getItem("hoSo_MaKH"));

const urlParams = new URLSearchParams(window.location.search);
const maNCC = urlParams.get('maNCC');
console.log("Mã NCC:", maNCC);

function setupPaymentSelection() {
    $(".payment-option").on("click", function () {
        $(".payment-option").removeClass("active-payment");
        $(this).addClass("active-payment");

        // Lưu phương thức vào localStorage
        const paymentMethod = $(this).data("method");
        localStorage.setItem("paymentMethod", paymentMethod);
    });
}

function loadSummary() {
    const staff = JSON.parse(localStorage.getItem("selectedStaff"));
    const services = JSON.parse(localStorage.getItem("selectedServices")) || [];
    const dateTime = JSON.parse(localStorage.getItem("selectedDateTime"));

    // ==== Ngày ====
    const date = new Date(dateTime.date);
    const dayName = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][date.getDay()];
    const formattedDate = `${dayName}, ngày ${date.getDate()} tháng ${date.getMonth() + 1}`;

    $(".summary-date").html(`
        <div class="fw-medium text-dark">${formattedDate}</div>
    `);

    // ==== Dịch vụ + Tính giờ từng dịch vụ ====
    const serviceContainer = $(".summary-services");
    serviceContainer.empty();

    let total = 0;

    // Start time lấy từ localStorage
    let currentStart = dateTime.time; // "11:00:00" dạng string

    function addMinutes(time, minutesToAdd) {
        let [h, m, s] = time.split(":").map(Number);
        let date = new Date();
        date.setHours(h, m + minutesToAdd, s || 0);
        let hh = String(date.getHours()).padStart(2, "0");
        let mm = String(date.getMinutes()).padStart(2, "0");
        let ss = String(date.getSeconds()).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    }

    services.forEach(sv => {
        total += sv.gia;

        let start = currentStart;
        let end = addMinutes(start, sv.thoigian);

        // Append UI
        serviceContainer.append(`
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="fw-medium">${sv.ten}</span>
                    <span class="summary-price">${sv.gia.toLocaleString()} đ</span>
                </div>
                <div class="small text-secondary">
                    ${sv.thoigian} phút với ${staff.ten}
                </div>
                <div class="small text-dark mt-2">
                    <i class="fa-thin fa-clock"></i> ${start.substring(0, 5)} – ${end.substring(0, 5)}
                </div>
            </div>
        `);

        // Cập nhật start time cho dịch vụ tiếp theo
        currentStart = end;
    });

    // ==== Tổng tiền ====
    $(".summary-total").text(total.toLocaleString() + " đ");
}

async function initConfirmPage() {
    setupPaymentSelection();
    loadSummary();
}

$(document).ready(function () {
    initConfirmPage();
});

async function postDatLich() {
    try {
        let tongTien = 0;
        let tongThoiGian = 0;

        selectedServices.forEach(s => {
            tongTien += s.gia;
            tongThoiGian += s.thoigian;
        });

        const datLichDTO = {
            maKH: maKH,
            tongThoiGian: tongThoiGian,
            tongTien: tongTien,
            trangThai: 0,
            ngayTao: selectedDateTime.date    // server tự parse LocalDate
        };

        console.log("Gửi DTO:", datLichDTO);
        const res = await callApi(`/datlich`, 'POST', datLichDTO);

        console.log("Kết quả tạo đặt lịch:", res);
        if (res.success) {
            return res.data.maDL;   // ⬅ LẤY maDL TRẢ VỀ
        }

        return null;
    } catch (error) {
        console.error('Lỗi tạo đặt lịch:', error);
        return null;
    }
}

async function buildCTDatLichList(maDL) {
    let startTime = selectedDateTime.time;

    // convert startTime → object Date để cộng phút
    let [h, m, s] = startTime.split(":").map(Number);
    let current = new Date();
    current.setHours(h, m, s, 0);

    const result = [];

    selectedServices.forEach(sv => {
        const batDau = new Date(current); // clone object

        // cộng thời gian dịch vụ
        current.setMinutes(current.getMinutes() + sv.thoigian);

        const ketThuc = new Date(current);

        result.push({
            maDL: maDL,
            maDV: sv.maDV,
            maNV: selectedSpecialist.maNV,
            thoiGianBatDau: batDau.toTimeString().substring(0, 8),
            thoiGianKetThuc: ketThuc.toTimeString().substring(0, 8),
            gia: sv.gia
        });
    });

    return result;
}

async function postThanhToan(maDL, phuongThuc) {
    try {
        // Tính tổng tiền
        let total = 0;
        selectedServices.forEach(s => total += s.gia);

        const dto = {
            maDL: maDL,
            phuongThuc: phuongThuc,
            soTien: total,
            trangThai: 1, // Chưa thanh toán
            ngayThanhToan: new Date().toISOString() // LocalDateTime
        };

        console.log("Thanh toán DTO:", dto);

        const res = await callApi(`/thanhtoan`, "POST", dto);

        console.log("Kết quả thêm thanh toán:", res);
        return res;

    } catch (error) {
        console.error("Lỗi post thanh toán:", error);
        return null;
    }
}

async function postCTDatLich(maDL) {
    try {
        const list = await buildCTDatLichList(maDL);

        console.log("CT gửi lên backend:", list);

        const res = await callApi(`/datlich/${maDL}/ct`, "POST", list);

        console.log("Kết quả thêm CT:", res);
        return res;
    } catch (error) {
        console.error('Lỗi thêm chi tiết đặt lịch:', error);
        return null;
    }
}

// ============ THÊM HÀM TẠO THANH TOÁN MOMO ============
async function createMomoPayment(maDL) {
    try {
        // Tính tổng tiền
        let total = 0;
        selectedServices.forEach(s => total += s.gia);

        // Tạo mô tả đơn hàng
        const serviceNames = selectedServices.map(s => s.ten).join(", ");
        const orderInfo = `Thanh toán dịch vụ: ${serviceNames}`;

        const requestBody = {
            maDL: maDL,
            amount: total,
            orderInfo: orderInfo
        };

        console.log("Tạo thanh toán MoMo:", requestBody);

        const res = await callApi(`/momo/create-payment`, "POST", requestBody);

        console.log("Kết quả từ MoMo:", res);

        if (res.success && res.data.resultCode === 0) {
            // MoMo trả về payUrl - redirect người dùng đến trang thanh toán
            return res.data.payUrl;
        } else {
            throw new Error(res.message || "Không thể tạo thanh toán MoMo");
        }

    } catch (error) {
        console.error("Lỗi tạo thanh toán MoMo:", error);
        throw error;
    }
}

// ============ CẬP NHẬT HÀM XÁC NHẬN ĐẶT LỊCH ============
async function handleConfirmBooking() {
    const paymentMethod = localStorage.getItem("paymentMethod");

    if (!paymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }

    // Hiển thị loading
    const btnConfirm = $(".btn-confirm");
    const originalText = btnConfirm.html();
    btnConfirm.prop("disabled", true).html('<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...');

    try {
        // 1️⃣ Tạo ĐẶT LỊCH
        const maDL = await postDatLich();
        if (!maDL) {
            throw new Error("Có lỗi khi tạo đặt lịch!");
        }

        console.log("Mã ĐL mới:", maDL);

        // 2️⃣ Tạo CHI TIẾT ĐẶT LỊCH
        const ctResult = await postCTDatLich(maDL);
        if (!ctResult || !ctResult.success) {
            throw new Error("Có lỗi khi tạo chi tiết đặt lịch!");
        }

        // 3️⃣ Xử lý theo PHƯƠNG THỨC THANH TOÁN
        if (paymentMethod === "1") {
            // THANH TOÁN TẠI CỬA HÀNG
            const thanhToanResult = await postThanhToan(maDL, 1);
            
            if (thanhToanResult && thanhToanResult.success) {
                alert("Đặt lịch thành công! Vui lòng thanh toán tại cửa hàng.");
                
                // Xóa storage
                clearBookingData();
                
                // Redirect về trang thành công
                window.location.href = `/client/pages/ThanhToanThanhCong.html?orderId=${maDL}&method=store`;
            } else {
                throw new Error("Có lỗi khi tạo thanh toán!");
            }

        } else if (paymentMethod === "2") {
            // THANH TOÁN QUA VÍ ĐIỆN TỬ (MOMO)
            const thanhToanResult = await postThanhToan(maDL, 2);
            
            if (!thanhToanResult || !thanhToanResult.success) {
                throw new Error("Có lỗi khi tạo bản ghi thanh toán!");
            }

            // Tạo thanh toán MoMo và lấy payUrl
            const momoPayUrl = await createMomoPayment(maDL);
            
            if (momoPayUrl) {
                // Lưu thông tin để xử lý callback
                localStorage.setItem("pendingBooking", JSON.stringify({
                    maDL: maDL,
                    timestamp: Date.now()
                }));
                
                // Redirect đến trang thanh toán MoMo
                window.location.href = momoPayUrl;
            } else {
                throw new Error("Không thể tạo link thanh toán MoMo!");
            }
        }

    } catch (error) {
        console.error("Lỗi xác nhận đặt lịch:", error);
        alert(error.message || "Có lỗi xảy ra, vui lòng thử lại!");
        
        // Reset button
        btnConfirm.prop("disabled", false).html(originalText);
    }
}

// ============ HÀM XÓA DỮ LIỆU BOOKING ============
function clearBookingData() {
    localStorage.removeItem("selectedStaff");
    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedDateTime");
    localStorage.removeItem("paymentMethod");
}

// ============ EVENT HANDLERS ============
$(document).on("click", ".btn-confirm", async function () {
    await handleConfirmBooking();
});

$(".continue-btn-top").on("click", function () {
    clearBookingData();
});