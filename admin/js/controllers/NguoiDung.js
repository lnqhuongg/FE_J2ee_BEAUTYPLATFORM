(() => {
  // ==================== BIẾN TOÀN CỤC ====================
  
  // Nhà Cung Cấp
  let currentPageNCC = 0;
  const pageSizeNCC = 5;
  let currentKeywordNCC = '';
  let currentLoaiHinhNCC = null;

  // Khách Hàng
  let currentPageKH = 0;
  const pageSizeKH = 5;
  let currentKeywordKH = '';

  // ==================== KHỞI TẠO TRANG ====================
  
  function initNguoiDungPage() {
    console.log("KHỞI TẠO TRANG QUẢN LÝ NGƯỜI DÙNG");
    
    // Load dữ liệu ban đầu (tab Nhà Cung Cấp active)
    getAllNhaCungCap(0);
    loadLoaiHinhOptions(); // Load dropdown loại hình
  }

  // Tự động khởi tạo khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('[data-init="initNguoiDungPage"]')) {
      initNguoiDungPage();
    }
  });

  // ==================== API: NHÀ CUNG CẤP ====================

  async function getAllNhaCungCap(page = 0) {
    let url = `/nhacungcap?page=${page}&size=${pageSizeNCC}`;

    // Thêm filter loại hình
    if (currentLoaiHinhNCC && currentLoaiHinhNCC !== '-1') {
      url += `&maLH=${currentLoaiHinhNCC}`;
    }

    // Thêm keyword tìm kiếm
    if (currentKeywordNCC) {
      url += `&keyword=${encodeURIComponent(currentKeywordNCC)}`;
    }

    const res = await callApi(url);

    if (res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      currentPageNCC = number;

      renderTableNCC(content);
      renderPaginationNCC(totalElements, number, totalPages);
    } else {
      document.querySelector("#supplier table tbody").innerHTML =
        `<tr><td colspan="6" class="text-center text-danger">${res.message || "Lỗi server"}</td></tr>`;
    }
  }

  function renderTableNCC(data) {
    const tableBody = document.querySelector("#supplier table tbody");
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có dữ liệu</td></tr>';
      return;
    }

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${item.maTK}</strong></td>
        <td>${item.tenNCC || 'N/A'}</td>
        <td>${item.email || 'N/A'}</td>
        <td>${item.tenLH || 'N/A'}</td>
        <td>${getStatusBadge(item.trangThai)}</td>
        <td class="text-center">
          <button class="btn-table border-0 btn btn-outline-primary btn_view_ncc" 
                  data-id="${item.maNCC}"
                  data-bs-toggle="modal" 
                  data-bs-target="#SupplierModal">
            <i class="fa-light fa-eye"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function renderPaginationNCC(totalItems, currentPageNum, totalPages) {
    const pagination = document.querySelector("#supplier .custom-pagination");
    const infoText = document.querySelector("#supplier .card-footer .text-muted");
    
    if (!pagination || !infoText) return;

    const start = totalItems === 0 ? 0 : currentPageNum * pageSizeNCC + 1;
    const end = Math.min((currentPageNum + 1) * pageSizeNCC, totalItems);
    
    infoText.innerHTML = `Hiển thị <strong>${start}–${end}</strong> trong <strong>${totalItems}</strong> nhà cung cấp`;

    pagination.innerHTML = "";

    // Prev button
    const prev = document.createElement("li");
    prev.className = "page-item" + (currentPageNum === 0 ? " disabled" : "");
    prev.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-left"></i></a>`;
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPageNum > 0) getAllNhaCungCap(currentPageNum - 1);
    });
    pagination.appendChild(prev);

    // Page numbers
    for (let i = 0; i < totalPages; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === currentPageNum ? " active" : "");
      li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
      li.addEventListener("click", (e) => {
        e.preventDefault();
        getAllNhaCungCap(i);
      });
      pagination.appendChild(li);
    }

    // Next button
    const next = document.createElement("li");
    next.className = "page-item" + (currentPageNum >= totalPages - 1 ? " disabled" : "");
    next.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-right"></i></a>`;
    next.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPageNum < totalPages - 1) getAllNhaCungCap(currentPageNum + 1);
    });
    pagination.appendChild(next);
  }

  // ==================== API: KHÁCH HÀNG ====================

  async function getAllKhachHang(page = 0) {
    let url = `/khachhang?page=${page}&size=${pageSizeKH}`;

    if (currentKeywordKH) {
      url += `&keyword=${encodeURIComponent(currentKeywordKH)}`;
    }

    const res = await callApi(url);

    if (res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      currentPageKH = number;

      renderTableKH(content);
      renderPaginationKH(totalElements, number, totalPages);
    } else {
      document.querySelector("#customer table tbody").innerHTML =
        `<tr><td colspan="5" class="text-center text-danger">${res.message || "Lỗi server"}</td></tr>`;
    }
  }

  function renderTableKH(data) {
    const tableBody = document.querySelector("#customer table tbody");
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Không có dữ liệu</td></tr>';
      return;
    }

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${item.maTK || 'N/A'}</strong></td>
        <td>${item.hoTen || 'N/A'}</td>
        <td>${item.email || 'N/A'}</td>
        <td>${getStatusBadge(item.trangThai)}</td>
        <td class="text-center">
          <button class="btn-table border-0 btn btn-outline-primary btn_view_kh" 
                  data-id="${item.maKH}"
                  data-bs-toggle="modal" 
                  data-bs-target="#CustomerAccountModal">
            <i class="fa-light fa-eye"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function renderPaginationKH(totalItems, currentPageNum, totalPages) {
    const pagination = document.querySelector("#customer .custom-pagination");
    const infoText = document.querySelector("#customer .card-footer .text-muted");
    
    if (!pagination || !infoText) return;

    const start = totalItems === 0 ? 0 : currentPageNum * pageSizeKH + 1;
    const end = Math.min((currentPageNum + 1) * pageSizeKH, totalItems);
    
    infoText.innerHTML = `Hiển thị <strong>${start}–${end}</strong> trong <strong>${totalItems}</strong> khách hàng`;

    pagination.innerHTML = "";

    // Prev button
    const prev = document.createElement("li");
    prev.className = "page-item" + (currentPageNum === 0 ? " disabled" : "");
    prev.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-left"></i></a>`;
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPageNum > 0) getAllKhachHang(currentPageNum - 1);
    });
    pagination.appendChild(prev);

    // Page numbers
    for (let i = 0; i < totalPages; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === currentPageNum ? " active" : "");
      li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
      li.addEventListener("click", (e) => {
        e.preventDefault();
        getAllKhachHang(i);
      });
      pagination.appendChild(li);
    }

    // Next button
    const next = document.createElement("li");
    next.className = "page-item" + (currentPageNum >= totalPages - 1 ? " disabled" : "");
    next.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-right"></i></a>`;
    next.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPageNum < totalPages - 1) getAllKhachHang(currentPageNum + 1);
    });
    pagination.appendChild(next);
  }

  // ==================== HELPER FUNCTIONS ====================

  function getStatusBadge(trangThai) {
    if (trangThai === 1) {
      return '<span class="badge bg-success-subtle text-success">Đang hoạt động</span>';
    } else if (trangThai === 0) {
      return '<span class="badge bg-secondary-subtle text-secondary">Tạm ngưng</span>';
    } else if (trangThai === 2) {
      return '<span class="badge bg-danger-subtle text-danger">Bị khóa</span>';
    }
    return '<span class="badge bg-secondary">N/A</span>';
  }

  // Load dropdown loại hình kinh doanh
  async function loadLoaiHinhOptions() {
    try {
      const res = await callApi('/loaihinh'); // Không phân trang
      
      if (res.success && res.data) {
        const select = document.querySelector('#supplier select.form-select');
        if (!select) return;

        // Giữ option mặc định
        select.innerHTML = '<option value="-1" selected>Loại hình Doanh nghiệp</option>';

        res.data.forEach(item => {
          if (item.trangThai === 1) { // Chỉ lấy loại hình đang hoạt động
            const option = document.createElement('option');
            option.value = item.maLH;
            option.textContent = item.tenLH;
            select.appendChild(option);
          }
        });
      }
    } catch (error) {
      console.error('Lỗi khi load loại hình:', error);
    }
  }

  // ==================== JQUERY EVENT HANDLERS ====================

  $(document).ready(function () {

    // ==================== TAB SWITCHING ====================
    
    $('#supplier-tab').on('click', function () {
      getAllNhaCungCap(0); // Load lại data khi switch tab
    });

    $('#customer-tab').on('click', function () {
      getAllKhachHang(0); // Load lại data khi switch tab
    });

    // ==================== NHÀ CUNG CẤP: TÌM KIẾM ====================

    $('#supplier .btn-purple-100').on('click', function () {
      currentKeywordNCC = $('#supplier input[type="text"]').val().trim();
      currentLoaiHinhNCC = $('#supplier select.form-select').val();
      getAllNhaCungCap(0);
    });

    $('#supplier input[type="text"]').on('keypress', function (e) {
      if (e.which === 13) {
        $('#supplier .btn-purple-100').click();
      }
    });

    $('#supplier select.form-select').on('change', function () {
      currentLoaiHinhNCC = $(this).val();
      getAllNhaCungCap(0);
    });

    // ==================== KHÁCH HÀNG: TÌM KIẾM ====================

    $('#customer .btn-purple-100').on('click', function () {
      currentKeywordKH = $('#customer input[type="text"]').val().trim();
      getAllKhachHang(0);
    });

    $('#customer input[type="text"]').on('keypress', function (e) {
      if (e.which === 13) {
        $('#customer .btn-purple-100').click();
      }
    });

    // ==================== NHÀ CUNG CẤP: XEM CHI TIẾT ====================

    $(document).on('click', '.btn_view_ncc', async function (e) {
      e.preventDefault();
      const maNCC = $(this).data('id');

      // Reset modal
      const $modal = $('#SupplierModal');
      $modal.find('.modal-title').text('Chi tiết Nhà cung cấp');
      $modal.find('input, select').prop('disabled', true); // Chế độ xem
      $modal.find('.btn-purple-100').hide(); // Ẩn nút submit

      try {
        const res = await callApi(`/nhacungcap/${maNCC}`);
        
        if (res.success && res.data) {
          const data = res.data;
          
          // Fill dữ liệu vào modal
          $modal.find('input[type="text"]').eq(0).val(data.maTK || '');
          $modal.find('input[type="text"]').eq(1).val(data.sdt || '');
          $modal.find('input[type="text"]').eq(2).val(data.tenNCC || '');
          $modal.find('input[placeholder*="email"]').val(data.email || '');
          
          // Giới tính
          if (data.gioiTinh === 0) {
            $modal.find('#gioitinh_nu').prop('checked', true);
          } else {
            $modal.find('#gioitinh_nam').prop('checked', true);
          }

          // Loại hình
          $modal.find('select').val(data.maLH || '-1');

        } else {
          alert('Không thể tải dữ liệu nhà cung cấp');
        }
      } catch (error) {
        alert('Lỗi khi tải dữ liệu: ' + error);
      }
    });

    // ==================== KHÁCH HÀNG: XEM CHI TIẾT ====================

    $(document).on('click', '.btn_view_kh', async function (e) {
      e.preventDefault();
      const maKH = $(this).data('id');

      // Reset modal
      const $modal = $('#CustomerAccountModal');
      $modal.find('.modal-title').text('Chi tiết Khách hàng');
      $modal.find('input, select').prop('disabled', true); // Chế độ xem
      $modal.find('.btn-purple-100').hide(); // Ẩn nút submit

      try {
        const res = await callApi(`/khachhang/${maKH}`);
        
        if (res.success && res.data) {
          const data = res.data;
          
          // Fill dữ liệu vào modal
          $modal.find('input[type="text"]').eq(0).val(data.maTK || '');
          $modal.find('input[type="text"]').eq(1).val(data.sdt || '');
          $modal.find('input[placeholder*="tên"]').val(data.hoTen || '');
          $modal.find('input[placeholder*="email"]').val(data.email || '');
          
          // Giới tính
          if (data.gioiTinh === 0) {
            $modal.find('#gioitinh_nu').prop('checked', true);
          } else {
            $modal.find('#gioitinh_nam').prop('checked', true);
          }

        } else {
          alert('Không thể tải dữ liệu khách hàng');
        }
      } catch (error) {
        alert('Lỗi khi tải dữ liệu: ' + error);
      }
    });

    // ==================== ĐÓNG MODAL: RESET STATE ====================

    $('#SupplierModal, #CustomerAccountModal').on('hidden.bs.modal', function () {
      $(this).find('input, select').prop('disabled', false);
      $(this).find('.btn-purple-100').show();
      $(this).find('input[type="text"]').val('');
    });

  });

  // Export hàm để có thể gọi từ bên ngoài
  window.initNguoiDungPage = initNguoiDungPage;

})();