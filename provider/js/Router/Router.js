// file này viết ra có xử dụng ajax, fetch dữ liệu từng trang lên mà không bị reload lại trang
const PAGE_BASE = './pages/';

// Thêm biến toàn cục để lưu script hiện tại
let currentScripts = [];

// Hàm xóa JS cũ khi chuyển trang - tránh tình trạng load nhiều các trang js mặc dù đã qua page khác
function cleanupPreviousScripts() {
    currentScripts.forEach(script => {
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    });
    currentScripts = [];    
}

// ------------------------------------------------------
async function loadPage(page) {
    const main = document.getElementById('main');
    main.style.opacity = 0;

    // 1. xóa js cũ trc khi load page mới 
    cleanupPreviousScripts();

    try {
        // fetch các trang quản lý dịch vụ, hồ sơ, loại dịch vụ, loại hình kinh doanh, người dùng, tổng quan
        const res = await fetch(PAGE_BASE + page);
        if (!res.ok) throw new Error('Không thể tải trang ' + page);
        // chuyển res bên trênh thành text
        const html = await res.text();
        main.innerHTML = html;

        // BƯỚC 2: LOAD LẠI SCRIPT MỚI + LƯU ĐỂ XÓA SAU
        const scripts = main.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');

            if (oldScript.src) {
                newScript.src = oldScript.src;
                // Đảm bảo src là absolute
                if (!newScript.src.startsWith('http') && !newScript.src.startsWith('/')) {
                    newScript.src = '/' + newScript.src;
                }
            } else {
                newScript.textContent = oldScript.textContent;
            }

            // Thêm vào body và lưu lại để xóa sau
            document.body.appendChild(newScript);
            currentScripts.push(newScript);

            oldScript.remove();
        });

        // BƯỚC 3: TỰ ĐỘNG GỌI HÀM KHỞI TẠO QUA data-init
        const initElement = main.querySelector('[data-init]');
        if (initElement) {
            const initFnName = initElement.getAttribute('data-init');
            // Đợi 1 frame để DOM sẵn sàng
            requestAnimationFrame(() => {
                if (typeof window[initFnName] === 'function') {
                    window[initFnName]();
                }
            });
        }

        // cái này để load javascript của từng trang 
        // Bạn đang append lại chính thẻ <script> từ innerHTML, nhưng script đó đã bị “chết” khi chèn vào DOM.
        // Nói dễ hiểu là: innerHTML chỉ copy nội dung HTML tĩnh, chứ không còn “kích hoạt” script.
        // => Khi bạn appendChild(script) thì nó không tải lại file JS nữa vì nó đã bị parse rồi.
        

        // Sau khi load xong: hiển thị mượt -- ko có cái animation này thì load trang bị cứng, đơ
        requestAnimationFrame(() => {
            main.style.opacity = 1;
        });

        // Cập nhật URL mà không reload (History API)
        window.history.pushState({ page }, '', '#' + page);

    } catch (err) {
        main.innerHTML = `<div class="p-5 text-center text-danger">${err.message}</div>`;
    }
}

// ------------------------------------------------------
// Khi user bấm nút back/forward trên trình duyệt
window.addEventListener('popstate', e => {
    const page = e.state?.page || 'TongQuan.html';
    loadPage(page);
});

// Gọi đầu tiên khi load trang
document.addEventListener('DOMContentLoaded', async () => {
    // load navbar với sidebar trước
    await loadComponent('navbar', 'Navbar.html');
    await loadComponent('sidebar', 'Sidebar.html');

    // Lắng nghe click trên các link sidebar
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a[data-page]');
        if (link) {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            loadPage(page);
        }
    });

    // Load trang mặc định (hoặc theo hash trên URL)
    const initialPage = location.hash ? location.hash.replace('#', '') : 'TongQuan.html';
    loadPage(initialPage);
});
