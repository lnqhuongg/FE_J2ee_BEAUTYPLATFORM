// API Configuration
const API_BASE_URL = 'http://localhost:8080'; // Thay đổi theo backend của bạn
let currentCustomerId = 1; // Lấy từ session/localStorage
let appointments = [];
let selectedAppointment = null;

// Mapping trạng thái
const STATUS_MAPPING = {
    0: { text: 'Chờ xác nhận', color: '#f59e0b', icon: 'fa-clock' },
    1: { text: 'Đã xác nhận', color: '#47b053', icon: 'fa-badge-check' },
    2: { text: 'Hoàn thành', color: '#3b82f6', icon: 'fa-circle-check' },
    3: { text: 'Đã hủy', color: '#ef4444', icon: 'fa-circle-xmark' }
};

// Load danh sách cuộc hẹn khi trang load
$(document).ready(function() {
    // Lấy mã khách hàng từ localStorage hoặc session
    const storedCustomerId = localStorage.getItem('hoSo_MaKH');
    if (storedCustomerId) {
        currentCustomerId = parseInt(storedCustomerId);
    }

    loadAppointments();

    // Xử lý thay đổi filter
    $('.form-select').on('change', function() {
        const filterValue = $(this).val();
        filterAppointments(filterValue);
    });
});

// Load tất cả cuộc hẹn
async function loadAppointments() {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/datlich/khachhang/${currentCustomerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success && result.data) {
            appointments = result.data;
            renderAppointmentList(appointments);

            // Tự động chọn cuộc hẹn đầu tiên
            if (appointments.length > 0) {
                showAppointmentDetails(appointments[0]);
            }
        } else {
            showError('Không thể tải danh sách cuộc hẹn');
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('Đã xảy ra lỗi khi tải danh sách cuộc hẹn');
    } finally {
        hideLoading();
    }
}

// Load cuộc hẹn theo trạng thái
async function loadAppointmentsByStatus(status) {
    try {
        showLoading();

        const response = await fetch(
            `${API_BASE_URL}/datlich/khachhang/${currentCustomerId}/trangthai/${status}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = await response.json();

        if (result.success && result.data) {
            appointments = result.data;
            renderAppointmentList(appointments);
        } else {
            showError('Không thể tải danh sách cuộc hẹn');
        }
    } catch (error) {
        console.error('Error loading appointments by status:', error);
        showError('Đã xảy ra lỗi khi tải danh sách cuộc hẹn');
    } finally {
        hideLoading();
    }
}

// Render danh sách cuộc hẹn
function renderAppointmentList(appointmentList) {
    const container = $('.list_appointments');
    container.empty();

    if (appointmentList.length === 0) {
        container.html('<p class="text-center text-muted mt-4">Không có cuộc hẹn nào</p>');
        $('.appointment_details').html('<p class="text-center text-muted mt-4">Chọn một cuộc hẹn để xem chi tiết</p>');
        return;
    }

    appointmentList.forEach((appointment, index) => {
        const status = STATUS_MAPPING[appointment.trangThai];
        const formattedDate = formatDate(appointment.ngayTao);
        
        // Lấy tên nhà cung cấp từ chi tiết đầu tiên (giả sử)
        const providerName = appointment.chiTiet.length > 0 
            ? `Cuộc hẹn #${appointment.maDL}` 
            : 'Chưa có thông tin';

        const element = `
            <div class="appointment_element mb-3 ${index === 0 ? 'active' : ''}" 
                 data-id="${appointment.maDL}" 
                 onclick="selectAppointment(${appointment.maDL})">
                <div class="d-flex justify-content-between align-items-center">
                    <strong style="font-size: 15px;">${providerName}</strong>
                    <span style="font-size: 13px; color: #8e8e8e;">${formattedDate}</span>
                </div>
                <div class="mt-1 d-flex justify-content-between align-items-center">
                    <span style="font-size: 12px; color: ${status.color};">
                        <i class="fa-light ${status.icon} me-1"></i>${status.text}
                    </span>
                    <span style="font-size: 13px; font-weight: 600;">
                        ${formatCurrency(appointment.tongTien)}
                    </span>
                </div>
            </div>
        `;
        container.append(element);
    });
}

// Chọn cuộc hẹn
function selectAppointment(maDL) {
    // Remove active class from all appointments
    $('.appointment_element').removeClass('active');
    
    // Add active class to selected appointment
    $(`.appointment_element[data-id="${maDL}"]`).addClass('active');

    const appointment = appointments.find(a => a.maDL === maDL);
    if (appointment) {
        showAppointmentDetails(appointment);
    }
}

// Hiển thị chi tiết cuộc hẹn
async function showAppointmentDetails(appointment) {
    const maNCC = appointment.chiTiet[0].maNCC;
    // Lấy thông tin nhà cung cấp từ API
    const imagesRes = await callApi(`/nhacungcap/${maNCC}/hinhanh`, 'GET');
    imagesNCC = imagesRes && imagesRes.success ? imagesRes.data : [];
    const mainImage = imagesNCC.find(img => img.imageMain == 1);
    imageNCC = mainImage ? mainImage.imageUrl : null;

    selectedAppointment = appointment;
    const status = STATUS_MAPPING[appointment.trangThai];
    const formattedDate = formatDateDetail(appointment.ngayTao);
    
    // Lấy thời gian bắt đầu từ dịch vụ đầu tiên
    const startTime = appointment.chiTiet.length > 0 
        ? appointment.chiTiet[0].thoiGianBatDau 
        : '00:00';

    const detailsHtml = `
        <div class="image-wrapper">
            <img src="${imageNCC}" alt="Provider Image">
        </div>
        <h4 style="font-weight: 900;" class="mt-3 ms-3">Cuộc hẹn #${appointment.maDL}</h4>
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <div class="ms-3 mb-2" style="font-size: 13px;">
                    <i class="fa-thin fa-clock me-2"></i>Ngày hẹn: 
                    <span>${formattedDate}</span>
                    <span>lúc ${startTime}</span>
                </div>
                <div class="ms-3 mb-2" style="font-size: 13px;">
                    <i class="fa-thin fa-wallet me-2"></i>Tổng tiền: 
                    <span style="font-weight: 600;">${formatCurrency(appointment.tongTien)}</span>
                </div>
                <div class="ms-3" style="font-size: 13px;">
                    <i class="fa-thin fa-clock-rotate-left me-2"></i>Tổng thời gian: 
                    <span>${appointment.tongThoiGian} phút</span>
                </div>
            </div>
            <div style="color: ${status.color};" class="d-flex align-items-center me-3">
                <i class="fa-light ${status.icon} me-2" style="font-size: 25px;"></i> 
                ${status.text}
            </div>
        </div>

        <hr>

        <h6 class="ms-3">Dịch vụ</h6>
        
        <div class="services-list-appointment ms-3">
            ${renderServicesList(appointment.chiTiet)}
        </div>
    `;

    $('.appointment_details').html(detailsHtml);
}

// Render danh sách dịch vụ
function renderServicesList(services) {
    if (services.length === 0) {
        return '<p class="text-muted">Chưa có dịch vụ nào</p>';
    }

    return services.map(service => {
        const duration = calculateDuration(service.thoiGianBatDau, service.thoiGianKetThuc);
        return `
            <div class="service-appointment d-flex justify-content-between mb-3 pb-2 border-bottom">
                <div>
                    <div style="font-weight: 600;">${service.tenDichVu}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        <i class="fa-regular fa-user me-1"></i>${service.tenNhanVien}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 2px;">
                        <i class="fa-regular fa-clock me-1"></i>${service.thoiGianBatDau} - ${service.thoiGianKetThuc}
                    </div>
                </div>
                <div class="text-end">
                    <div style="font-weight: 600;">${formatCurrency(service.gia)}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">${duration} phút</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render nút hành động
function renderActionButtons(status) {
    if (status === 0 || status === 1) { // Chờ xác nhận hoặc đã xác nhận
        return `
            <hr>
            <div class="d-flex justify-content-end gap-2 me-3 mb-3">
                <button class="btn btn-outline-danger" onclick="cancelAppointment()">
                    <i class="fa-regular fa-xmark me-1"></i>Hủy cuộc hẹn
                </button>
            </div>
        `;
    }
    return '';
}

// Filter cuộc hẹn
function filterAppointments(filterValue) {
    let filteredAppointments = [...appointments];

    switch(filterValue) {
        case 'newest':
            filteredAppointments.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
            break;
        case 'oldest':
            filteredAppointments.sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao));
            break;
        case 'pending':
            loadAppointmentsByStatus(0);
            return;
        case 'confirmed':
            loadAppointmentsByStatus(1);
            return;
        case 'completed':
            loadAppointmentsByStatus(2);
            return;
        case 'cancelled':
            loadAppointmentsByStatus(3);
            return;
    }

    renderAppointmentList(filteredAppointments);
    if (filteredAppointments.length > 0) {
        showAppointmentDetails(filteredAppointments[0]);
    }
}

// Hủy cuộc hẹn
async function cancelAppointment() {
    if (!selectedAppointment) return;

    if (!confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này?')) {
        return;
    }

    try {
        // TODO: Implement API hủy cuộc hẹn
        showToast('Đã hủy cuộc hẹn thành công', 'success');
        loadAppointments(); // Reload list
    } catch (error) {
        showToast('Không thể hủy cuộc hẹn', 'error');
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateDetail(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `Ngày ${day} tháng ${month}, ${year}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function calculateDuration(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
}

function showLoading() {
    $('.list_appointments').html('<div class="text-center mt-4"><i class="fa-duotone fa-spinner-third fa-spin fa-2x"></i></div>');
}

function hideLoading() {
    // Loading will be replaced by content
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'success') {
    const toast = $('#toast');
    const toastMessage = $('#toastMessage');
    
    toastMessage.text(message);
    toast.removeClass('success error').addClass(type);
    toast.addClass('show');
    
    setTimeout(() => {
        toast.removeClass('show');
    }, 3000);
}

// Make functions globally accessible
window.selectAppointment = selectAppointment;
window.cancelAppointment = cancelAppointment;