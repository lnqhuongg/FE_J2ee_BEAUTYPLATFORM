(() => {
  let currentPage = 0;
  const pageSize = 5;
  let currentKeyword = '';

  // Build URL and call API (reuse global callApi if available)
  async function getAllLoaiDichVu(page = 0) {
    let url = `/loaidichvu?page=${page}&size=${pageSize}`;
    if (currentKeyword) url += `&keyword=${encodeURIComponent(currentKeyword)}`;

    const res = await callApi(url);
    if (res && res.success && res.data) {
      const { content, totalElements, number, totalPages } = res.data;
      currentPage = number;
      renderTable(content || []);
      renderPagination(totalElements || 0, number || 0, totalPages || 0);
    } else {
      document.querySelector('.custom-table tbody').innerHTML =
        `<tr><td colspan="4" class="text-center text-danger">${(res && res.message) || 'Lỗi server'}</td></tr>`;
    }
  }

  function getName(item) {
    // try common property names returned by backend
    return item.tenLDV || item.tenLoaiDichVu || item.ten || item.name || '';
  }

  function getId(item) {
    return item.maLDV || item.id || item.maLoaiDichVu || item.ma || '';
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
            <td class="text-center">${escapeHtml(getId(item))}</td>
            <td class="custom-column2nd">${escapeHtml(getName(item))}</td>
            <td class="text-center">${getStatus(item.trangThai)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary btn_update_modal" 
                        data-bs-toggle="modal" 
                        data-bs-target="#serviceTypeModal"
                        data-id="${id}">
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
    infoText.innerHTML = `Hiển thị <strong>${start}–${end}</strong> trong <strong>${totalItems}</strong> loại dịch vụ`;

    pagination.innerHTML = '';

    // Prev
    const prev = document.createElement('li');
    prev.className = 'page-item' + (currentPageNum === 0 ? ' disabled' : '');
    prev.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-left"></i></a>`;
    prev.addEventListener('click', e => {
      e.preventDefault();
      if (currentPageNum > 0) getAllLoaiDichVu(currentPageNum - 1);
    });
    pagination.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
      const li = document.createElement('li');
      li.className = 'page-item' + (i === currentPageNum ? ' active' : '');
      li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
      li.addEventListener('click', e => {
        e.preventDefault();
        getAllLoaiDichVu(i);
      });
      pagination.appendChild(li);
    }

    const next = document.createElement('li');
    next.className = 'page-item' + (currentPageNum >= totalPages - 1 ? ' disabled' : '');
    next.innerHTML = `<a class="page-link" href="#"><i class="fa-light fa-chevron-right"></i></a>`;
    next.addEventListener('click', e => {
      e.preventDefault();
      if (currentPageNum < totalPages - 1) getAllLoaiDichVu(currentPageNum + 1);
    });
    pagination.appendChild(next);
  }

  // sanitize basic HTML (simple escape)
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // init function
  function initLoaiDichVuPage() {
    getAllLoaiDichVu(0);
  }

  // DOM ready and jQuery bindings
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-init="initLoaiDichVuPage"]')) {
      initLoaiDichVuPage();
    }
  });

  $(document).ready(function () {
    const $container = $('[data-init="initLoaiDichVuPage"]');
    if ($container.length === 0) return;

    const $modal = $('#serviceTypeModal');
    const $title = $('#serviceTypeModalLabel');
    const $serviceName = $modal.find('#serviceName');
    const $statusSelect = $modal.find('select');
    const $message = $modal.find('.text-danger');
    const $submitBtn = $modal.find('.btn-blue-100.border').first();

    // Create modal open (buttons that target this modal)
    $container.on('click', '[data-bs-target="#serviceTypeModal"]', function (e) {
      // If clicked an edit action we will handle in btn_update_modal handler below.
      // This handler is mainly to prepare modal for 'add' when user clicked the top Add button.
      const trigger = $(this);
      // If the trigger has data-id attribute, leave for the edit handler
      if (trigger.data('id')) return;

      $modal.attr('data-mode', 'add').attr('data-id', '');
      $title.text('Thêm Loại dịch vụ mới');
      $submitBtn.text('Thêm mới');
      $serviceName.val('');
      $statusSelect.val($statusSelect.find('option').first().val());
      $message.text('');
    });

    // Click edit (delegated)
    $container.on('click', '.btn_update_modal', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const id = $(this).data('id');
      $modal.attr('data-mode', 'edit').attr('data-id', id);
      $title.text('Cập nhật Loại dịch vụ');
      $submitBtn.text('Cập nhật');
      $message.text('');
      $serviceName.val('Đang tải...');

      $.ajax({
        url: 'http://localhost:8080/loaidichvu/' + id,
        type: 'GET',
        success: function (res) {
          if (res && res.success && res.data) {
            const d = res.data;
            $serviceName.val(getName(d));
            if (d.trangThai !== undefined) $statusSelect.val(d.trangThai);
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

    // Submit (add or edit)
    $submitBtn.on('click', function () {
      const mode = $modal.attr('data-mode') || 'add';
      const name = $serviceName.val().trim();
      if (!name) {
        $message.text('Vui lòng nhập tên loại dịch vụ!');
        return;
      }

      const data = { tenLDV: name };
      if (mode === 'edit') data.trangThai = parseInt($statusSelect.val());
      else data.trangThai = 1;

      const id = $modal.attr('data-id');
      const url = mode === 'add' ? 'http://localhost:8080/loaidichvu' : 'http://localhost:8080/loaidichvu/' + id;
      const type = mode === 'add' ? 'POST' : 'PUT';

      $.ajax({
        url: url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
          if (res && res.success) {
            $modal.modal('hide');
            getAllLoaiDichVu(currentPage);
            alert(mode === 'add' ? 'Thêm thành công!' : 'Cập nhật thành công!');
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

    // Search handling: the page's search input and button are inside the same container
    $container.on('click', '.btn-purple-100', function (e) {
      e.preventDefault();
      currentKeyword = $container.find('input[type="text"]').first().val().trim();
      getAllLoaiDichVu(0);
    });

    $container.on('keypress', 'input[type="text"]', function (e) {
      if (e.which === 13 || e.key === 'Enter') {
        e.preventDefault();
        $container.find('.btn-purple-100').first().click();
      }
    });

    $container.on('submit', 'form', function (e) {
      e.preventDefault();
      $container.find('.btn-purple-100').first().click();
    });
  });

  // expose init
  window.initLoaiDichVuPage = initLoaiDichVuPage;

})();
