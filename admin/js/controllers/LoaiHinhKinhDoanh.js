(() => {
  var currentPage = 0;
  const pageSize = 5;
  let currentKeyword = '';

  // === XÓA HOẶC BỎ QUA ĐOẠN KIỂM TRA NÀY ===
  // if (window.initLoaiHinhPage) {
  //     console.log("ĐÃ TẢI RỒI – BỎ QUA!");
  //     return;
  // }

  // === CÁC HÀM CỦA BẠN (giữ nguyên) ===
  async function getAllLoaiHinh(page = 0) {
    let url = `/loaihinh?page=${page}&size=${pageSize}`; // ← TẠO URL MỚI

    if (currentKeyword) {
      url += `&keyword=${encodeURIComponent(currentKeyword)}`;
    }

    const res = await callApi(url); // ← DÙNG URL MỚI

    if (res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      currentPage = number;

      renderTable(content);
      renderPagination(totalElements, number, totalPages);
    } else {
      document.querySelector(".custom-table tbody").innerHTML =
        `<tr><td colspan="5" class="text-center text-danger">${res.message || "Lỗi server"}</td></tr>`;
    }
  }

  function renderTable(data) {
    const tableBody = document.querySelector(".custom-table tbody");
    tableBody.innerHTML = "";

    data.forEach((item, index) => {
      const stt = currentPage * pageSize + index + 1;
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${stt}</td>
                <td class="text-center">${item.maLH}</td>
                <td class="text-center">${item.tenLH}</td>
                <td class="text-center">${getStatus(item.trangThai)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary btn_update_modal" 
                            data-bs-toggle="modal" 
                            data-bs-target="#businessTypeModal">
                        <i class="fa-regular fa-pen"></i>
                    </button>
                </td>
            `;
      tableBody.appendChild(row);
    });
  }

  function getStatus(status) {
    return status === 1
      ? '<span class="badge bg-success-subtle text-success">Đang hoạt động</span>'
      : '<span class="badge bg-secondary-subtle text-secondary">Tạm ngưng</span>';
  }

  function renderPagination(totalItems, currentPageNum, totalPages) {
    const pagination = document.querySelector(".custom-pagination");
    const infoText = document.querySelector(".card-footer .text-muted");
    if (!pagination || !infoText) return;

    const start = totalItems === 0 ? 0 : currentPageNum * pageSize + 1;
    const end = Math.min((currentPageNum + 1) * pageSize, totalItems);
    infoText.innerHTML = `Hiển thị <strong>${start}–${end}</strong> trong <strong>${totalItems}</strong> loại hình`;

    pagination.innerHTML = "";

    // Prev
    const prev = document.createElement("li");
    prev.className = "page-item" + (currentPageNum === 0 ? " disabled" : "");
    prev.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-left"></i></a>`;
    prev.addEventListener("click", e => {
      e.preventDefault();
      if (currentPageNum > 0) getAllLoaiHinh(currentPageNum - 1);
    });
    pagination.appendChild(prev);

    // Pages
    for (let i = 0; i < totalPages; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === currentPageNum ? " active" : "");
      li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
      li.addEventListener("click", e => {
        e.preventDefault();
        getAllLoaiHinh(i);
      });
      pagination.appendChild(li);
    }

    // Next
    const next = document.createElement("li");
    next.className = "page-item" + (currentPageNum >= totalPages - 1 ? " disabled" : "");
    next.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-right"></i></a>`;
    next.addEventListener("click", e => {
      e.preventDefault();
      if (currentPageNum < totalPages - 1) getAllLoaiHinh(currentPageNum + 1);
    });
    pagination.appendChild(next);
  }

  // === KHỞI TẠO KHI CÓ data-init ===
  function initLoaiHinhPage() {
    console.log("KHỞI TẠO TRANG LOẠI HÌNH KINH DOANH");
    getAllLoaiHinh(0);
  }

  // === GỌI TỰ ĐỘNG KHI TRANG SẴN SÀNG ===
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('[data-init="initLoaiHinhPage"]')) {
      initLoaiHinhPage();
    }
  });

  // === ĐẢM BẢO jQuery ĐÃ LOAD TRƯỚC ===
  $(document).ready(function () {

    const $modal = $('#businessTypeModal');
    const $title = $('#businessTypeModalLabel');
    const $submitBtn = $('.btn_submit_form');
    const $tenLH = $('#tenLH');
    const $trangThai = $('#trangThai');
    const $trangThaiGroup = $('#trangThaiGroup');
    const $message = $('#message_validate');

    // === 1. NÚT THÊM MỚI ===
    $('.btn_create_modal').on('click', function () {
      $modal.find('[data-mode]').attr('data-mode', 'add').attr('data-id', '');
      $title.text('Thêm Loại hình kinh doanh mới');
      $submitBtn.text('Thêm mới');
      $tenLH.val('');
      $trangThaiGroup.hide();
      $message.text('');
    });

    // === 2. NÚT SỬA – CHỈ MỞ MODAL SAU KHI CÓ DATA ===
    $(document).on('click', '.btn_update_modal', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const maLH = $(this).closest('tr').find('td:nth-child(2)').text();

      // Đặt chế độ trước
      $modal.find('[data-mode]').attr('data-mode', 'edit').attr('data-id', maLH);
      $title.text('Cập nhật Loại hình kinh doanh');
      $submitBtn.text('Cập nhật');
      $trangThaiGroup.show();
      $message.text('');
      $tenLH.val(''); // xóa tạm để tránh nhầm

      // HIỂN THỊ LOADING TRONG MODAL
      $tenLH.val('Đang tải...');

      // GỌI API LẤY DỮ LIỆU
      $.ajax({
        url: 'http://localhost:8080/loaihinh/' + maLH,
        type: 'GET',
        success: function (res) {
          if (res.success && res.data) {
            $tenLH.val(res.data.tenLH);
            $trangThai.val(res.data.trangThai);
            // $modal.modal('show'); // CHỈ MỞ 1 LẦN DUY NHẤT Ở ĐÂY!
          } else {
            alert('Không tải được dữ liệu: ' + (res.message || 'Lỗi server'));
            $tenLH.val('');
          }
        },
        error: function (xhr) {
          try {
            const err = JSON.parse(xhr.responseText);
            alert('Lỗi: ' + (err.message || 'Không kết nối được server'));
          } catch {
            alert('Lỗi kết nối server!');
          }
          $tenLH.val('');
        }
      });
    });

    // === 3. NÚT SUBMIT (Thêm hoặc Sửa) ===
    $submitBtn.on('click', function () {
      const mode = $modal.find('[data-mode]').attr('data-mode');
      const tenLH = $tenLH.val().trim();

      if (!tenLH) {
        $message.text('Vui lòng nhập tên loại hình!');
        return;
      }

      const data = { tenLH: tenLH };
      if (mode === 'edit') {
        data.trangThai = parseInt($trangThai.val());
      } else {
        data.trangThai = 1; // mặc định đang hoạt động
      }

      const url = mode === 'add'
        ? 'http://localhost:8080/loaihinh'
        : 'http://localhost:8080/loaihinh/' + $modal.find('[data-id]').attr('data-id');

      const type = mode === 'add' ? 'POST' : 'PUT';

      $.ajax({
        url: url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
          if (res.success) {
            $modal.modal('hide');
            getAllLoaiHinh(currentPage); // TẢI LẠI BẢNG
            alert(mode === 'add' ? 'Thêm thành công!' : 'Cập nhật thành công!');
          } else {
            $message.text(res.message || 'Có lỗi xảy ra!');
          }
        },
        error: function (xhr) {
          try {
            const err = JSON.parse(xhr.responseText);
            $message.text(err.message || 'Không kết nối được server');
          } catch {
            $message.text('Lỗi kết nối server!');
          }
          $tenLH.val('');
        }
      });
    });


    // ==== 4. tìm kiếm ==== 
    // Biến toàn cục
    $('.btn_search').on('click', function () {
      currentKeyword = $('#keyword').val().trim(); // ← DÙNG BIẾN TOÀN CỤC
      getAllLoaiHinh(0);
    });

    $('#keyword').on('keypress', function (e) {
      if (e.which === 13) {
        $('.btn_search').click();
      }
    });

    $('#searchLH').on('submit', function (e) {
      e.preventDefault();
      $('.btn_search').click();
    });

  });

  // === EXPORT HÀM ĐỂ KHÔNG BỊ BỎ QUA ===
  window.initLoaiHinhPage = initLoaiHinhPage;

})();