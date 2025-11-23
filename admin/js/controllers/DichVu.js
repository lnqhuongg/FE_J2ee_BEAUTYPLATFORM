(() => {
  let currentPage = 0;
  const pageSize = 5;
  let currentKeyword = '';

  async function getAllDichVu(page = 0) {
    let url = `/dichvu?page=${page}&size=${pageSize}`;
    if (currentKeyword) url += `&keyword=${encodeURIComponent(currentKeyword)}`;

    const res = await callApi(url);
    if (res && res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      currentPage = number;
      var loaiDichVu = getAllLDV();
      renderTable(content);
      renderPagination(totalElements || 0, number || 0, totalPages || 0);
    } else {
      document.querySelector('.custom-table tbody').innerHTML =
        `<tr><td colspan="7" class="text-center text-danger">${(res && res.message) || 'Lỗi server'}</td></tr>`;
    }
  }

  async function getAllLDV() {
    let url = `/loaidichvu`;

    const res = await callApi(url);
    if (res && res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      return content;
    } else {
      document.querySelector('.custom-table tbody').innerHTML =
        `<tr><td colspan="7" class="text-center text-danger">${(res && res.message) || 'Lỗi server'}</td></tr>`;
    }
  }

  async function loadLoaiDichVu() {
    const serviceTypes = document.getElementById("serviceTypes");
    serviceTypes.innerHTML = `<option value="-1">Đang tải...</option>`;

    const data = await getAllLDV();
    serviceTypes.innerHTML = `<option value="-1">Chọn loại dịch vụ</option>`;

    if (data && data.length > 0) {
      data.forEach(item => {
        serviceTypes.innerHTML += `
        <option value="${item.maLDV}">${item.tenLDV}</option>
      `;
      });
    }
  }


  async function getAllNCC() {
    let url = `/nhacungcap`;

    const res = await callApi(url);
    if (res && res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      return content;
    } else {
      document.querySelector('.custom-table tbody').innerHTML =
        `<tr><td colspan="7" class="text-center text-danger">${(res && res.message) || 'Lỗi server'}</td></tr>`;
    }
  }

  async function loadNCC() {
    const providers = document.getElementById("providers");
    providers.innerHTML = `<option value="-1">Đang tải...</option>`;

    const data = await getAllNCC();
    providers.innerHTML = `<option value="-1">Chọn doanh nghiệp của dịch vụ</option>`;

    if (data && data.length > 0) {
      data.forEach(item => {
        providers.innerHTML += `
        <option value="${item.maNCC}">${item.tenNCC}</option>
      `;
      });
    }
  }


  function getId(item) {
    return item.maDV || item.id || item.ma || '';
  }

  function getName(item) {
    return item.tenDV || item.ten || item.name || '';
  }

  function getLoaiName(item) {
    // try nested object or id/name fields
    if (!item) return '';
    if (item.loaiDichVu) return item.loaiDichVu.tenLDV;
    return '';
  }

  function getNCCName(item) {
    if (!item) return '';
    if (item.nhaCungCap) return item.nhaCungCap.tenNCC;
    return '';
  }

  function formatPrice(v) {
    if (v === undefined || v === null || v === '') return '';
    const n = Number(v);
    if (isNaN(n)) return v;
    return n.toLocaleString('vi-VN');
  }

  function getStatus(status) {
    return status === 1 || status === '1'
      ? '<span class="badge bg-success-subtle text-success">Đang hoạt động</span>'
      : '<span class="badge bg-secondary-subtle text-secondary">Tạm ngưng</span>';
  }

  function renderTable(data) {
    const tableBody = document.querySelector('.custom-table tbody');
    tableBody.innerHTML = '';

    data.forEach((item, index) => {
      const stt = currentPage * pageSize + index + 1;
      const id = getId(item);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${stt}</td>
        <td class="custom-column1st">${escapeHtml(getName(item))}</td>
        <td class="custom-column2nd">${escapeHtml(getLoaiName(item))}</td>
        <td class="text-center">${formatPrice(item.gia)}</td>
        <td class="text-center">${escapeHtml(item.thoiLuong)}</td>
        <td class="text-center">${getStatus(item.trangThai)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary btn_update_service" data-id="${id}" data-bs-toggle="modal" data-bs-target="#serviceModal">
            <i class="fa-regular fa-pen"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function renderPagination(totalItems, currentPageNum, totalPages) {
    const pagination = document.querySelector('.custom-pagination');
    const infoText = document.querySelector('.card-footer .text-muted');
    if (!pagination || !infoText) return;

    const start = totalItems === 0 ? 0 : currentPageNum * pageSize + 1;
    const end = Math.min((currentPageNum + 1) * pageSize, totalItems);
    infoText.innerHTML = `Hiển thị <strong>${start}–${end}</strong> trong <strong>${totalItems}</strong> dịch vụ`;

    pagination.innerHTML = '';

    const prev = document.createElement('li');
    prev.className = 'page-item' + (currentPageNum === 0 ? ' disabled' : '');
    prev.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-left"></i></a>`;
    prev.addEventListener('click', e => {
      e.preventDefault();
      if (currentPageNum > 0) getAllDichVu(currentPageNum - 1);
    });
    pagination.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
      const li = document.createElement('li');
      li.className = 'page-item' + (i === currentPageNum ? ' active' : '');
      li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
      li.addEventListener('click', e => {
        e.preventDefault();
        getAllDichVu(i);
      });
      pagination.appendChild(li);
    }

    const next = document.createElement('li');
    next.className = 'page-item' + (currentPageNum >= totalPages - 1 ? ' disabled' : '');
    next.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-right"></i></a>`;
    next.addEventListener('click', e => {
      e.preventDefault();
      if (currentPageNum < totalPages - 1) getAllDichVu(currentPageNum + 1);
    });
    pagination.appendChild(next);
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------------------------------------- này là cho cái nút trạng thái ----------------------------------------
  const switchInput = document.getElementById('serviceStatus');
  const switchLabel = document.getElementById('statusLabel'); // Lấy label đúng

  function updateLabel() {
    if (switchInput.checked) {
      switchLabel.textContent = 'Đang hoạt động';
      switchInput.value = 1;
    } else {
      switchLabel.textContent = 'Tạm ngưng';
      switchInput.value = 0;
    }
  }

  // Gọi khi thay đổi trạng thái
  switchInput.addEventListener('change', updateLabel);

  // Khởi tạo label đúng lúc load
  updateLabel();
  // ---------------------------------------- này là cho cái nút trạng thái ----------------------------------------

  // initialization
  function initDichVuPage() {
    getAllDichVu(0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-init="initDichVuPage"]')) initDichVuPage();
  });

  $(document).ready(function () {
    const $container = $('[data-init="initDichVuPage"]');
    if ($container.length === 0) return;

    const $modal = $('#serviceModal');
    const $submitBtn = $('.btn_submit_service');

    const $serviceId = $('#serviceId');
    const $serviceName = $('#serviceName');
    const $serviceTypes = $('#serviceTypes');
    const $servicePrice = $('#servicePrice');
    const $providers = $('#providers');
    const $serviceDuration = $('#serviceDuration');
    const $serviceDescription = $('#serviceDescription');
    const $serviceStatus = $('#serviceStatus');
    const $message = $('<div class="text-danger mt-2" />');

    // mấy block để ẩn hiện
    const $serviceIdBlock = $('#serviceIdBlock');
    const $serviceStatusBlock = $('#serviceStatusBlock');
    const $servicePromotionBlock = $('#servicePromotionBlock');

    // attach message container inside modal body if not present
    if ($modal.find('.modal-body form .text-danger').length === 0) {
      $modal.find('.modal-body form').append($message);
    } else {
      $message.text('');
    }

    $('.btn_create_service').on('click', async function () {
      // load dữ liệu của loại dv với nhà cung cấp lên select box 
      await loadLoaiDichVu();
      await loadNCC();

      $modal.attr('data-mode', 'add').attr('data-id', '');
      $modal.find('#serviceModalLabel').text('Thêm Dịch vụ mới');
      $submitBtn.text('Thêm mới');

      $serviceIdBlock.hide();
      $serviceStatusBlock.hide();
      $servicePromotionBlock.hide();

      $serviceName.val('');
      $serviceTypes.val('');
      $servicePrice.val('');
      $serviceDuration.val('');
      $serviceDescription.val('');
      $message.text('');
    });

    // edit
    $container.on('click', '.btn_update_service', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      // load dữ liệu của loại dv với nhà cung cấp lên select box 
      await loadLoaiDichVu();
      await loadNCC();

      $serviceIdBlock.show();
      $serviceStatusBlock.show();
      $servicePromotionBlock.show();

      const id = $(this).data('id');
      $modal.attr('data-mode', 'edit').attr('data-id', id);
      $modal.find('#serviceModalLabel').text('Cập nhật Dịch vụ');
      $submitBtn.text('Cập nhật');
      $message.text('');

      $serviceName.val('Đang tải...');

      $.ajax({
        url: 'http://localhost:8080/dichvu/' + id,
        type: 'GET',
        success: function (res) {
          if (res && res.success && res.data) {
            const d = res.data;

            $serviceId.val(d.maDV);
            $serviceName.val(d.tenDV);
            $serviceTypes.val(d.loaiDichVu.maLDV);
            $providers.val(d.nhaCungCap.maNCC);
            $servicePrice.val(d.gia || '');
            $serviceDuration.val(d.thoiLuong || '');
            $serviceDescription.val(d.moTa || '');
            // trạng thái
            if (d.trangThai == 1) {
              switchInput.checked = true;
            } else {
              switchInput.checked = false;
            }
            updateLabel();
          } else {
            alert('Không tải được dữ liệu: ' + ((res && res.message) || 'Lỗi server'));
            $serviceName.val('');
          }
        },
        error: function (xhr) {
          try {
            const err = JSON.parse(xhr.responseText);
            alert('Lỗi: ' + (err.message || 'Không kết nối được server'));
          } catch {
            alert('Lỗi kết nối server!');
          }
          $serviceName.val('');
        }
      });
    });

    // submit add/edit
    $submitBtn.on('click', function () {
      const mode = $modal.attr('data-mode') || 'add';
      const name = $serviceName.val().trim();
      if (!name) {
        $message.text('Vui lòng nhập tên dịch vụ!');
        return;
      }

      const loaiId = $serviceTypes.val();
      const payload = {
        tenDV: name,
        gia: Number($servicePrice.val()) || 0,
        thoiLuong: Number($serviceDuration.val()) || 0,
        moTa: $serviceDescription.val() || '',
        trangThai: parseInt($serviceStatus.val()) || 0,
      };

      // include loaiDichVu as nested object if id provided
      if (loaiId) payload.loaiDichVu = { maLDV: loaiId };

      const id = $modal.attr('data-id');
      const url = mode === 'add' ? 'http://localhost:8080/dichvu' : 'http://localhost:8080/dichvu/' + id;
      const type = mode === 'add' ? 'POST' : 'PUT';

      $.ajax({
        url: url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (res) {
          if (res && res.success) {
            $modal.modal('hide');
            getAllDichVu(currentPage);
            alert(mode === 'add' ? 'Thêm dịch vụ thành công!' : 'Cập nhật dịch vụ thành công!');
          } else {
            $message.text((res && res.message) || 'Có lỗi xảy ra!');
          }
        },
        error: function (xhr) {
          try {
            const err = JSON.parse(xhr.responseText);
            $message.text(err.message || 'Không kết nối được server');
          } catch {
            $message.text('Lỗi kết nối server!');
          }
        }
      });
    });

    // search
    $('.btn_search').on('click', function (e) {
      e.preventDefault();
      currentKeyword = $('#keyword').val().trim();
      getAllDichVu(0);
    });

    $('#keyword').on('keypress', function (e) {
      if (e.which === 13) $('.btn_search').click();
    });

    $('#searchService').on('submit', function (e) {
      e.preventDefault();
      $('.btn_search').click();
    });
  });

  window.initDichVuPage = initDichVuPage;

})();
