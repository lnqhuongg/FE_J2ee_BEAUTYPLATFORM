// console.log("api.js đã load! (dùng fetch thuần)");

// const BASE_URL = "http://localhost:8080";

// // HÀM callApi SIÊU GỌN – DỄ HIỂU – KHÔNG LỖI
// async function callApi(endpoint, options = {}) {
//   // Đảm bảo endpoint có dấu /
//   const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
//   const url = BASE_URL + cleanEndpoint;

//   try {
//     const response = await fetch(url, {
//       method: options.method || "GET",
//       headers: {
//         "Content-Type": "application/json",
//         ...options.headers,
//       },
//       body: options.body ? JSON.stringify(options.body) : null,
//     });

//     const result = await response.json(); // ← result chính là { success: true, data: { content: [...] } }

//     if (response.ok && result.success) {
//       return { success: true, data: result.data }; // ← data là Page<LoaiHinh>
//     } else {
//       return { success: false, message: result.message || "Lỗi server" };
//     }
//   } catch (err) {
//     console.error("Lỗi kết nối:", err);
//     return { success: false, message: "Không kết nối được server" };
//   }
// }

// // Export để dùng ở file khác (nếu cần)
// window.callApi = callApi;
/**
 * Hàm gọi API chung cho toàn bộ ứng dụng
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/auth/dangnhap')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Dữ liệu gửi đi (cho POST, PUT)
 * @param {object} headers - Headers bổ sung
 * @returns {Promise<object>} - Response từ server
 */
async function callApi(endpoint, method = 'GET', data = null, headers = {}) {
  const API_BASE_URL = 'http://localhost:8080';
  
  try {
    // Cấu hình request
    const config = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Thêm token nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Thêm body cho POST, PUT, DELETE
    if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      config.body = JSON.stringify(data);
    }

    // Gọi API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Parse response
    const result = await response.json();

    // Kiểm tra nếu token hết hạn (401)
    if (response.status === 401) {
      // Xóa token và redirect về trang login
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // Chỉ redirect nếu không phải trang login
      if (!window.location.pathname.includes('dangnhap') && !window.location.pathname.includes('login')) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = '/dangnhap.html';
      }
    }

    return result;

  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    return {
      success: false,
      message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!',
      data: null
    };
  }
}

/**
 * Hàm kiểm tra user đã đăng nhập chưa
 * @returns {boolean}
 */
function isLoggedIn() {
  const token = localStorage.getItem('token');
  return !!token;
}

/**
 * Hàm lấy thông tin user hiện tại
 * @returns {object|null}
 */
function getCurrentUser() {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * Hàm đăng xuất
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  window.location.href = '/dangnhap.html';
}

/**
 * Hàm kiểm tra quyền truy cập
 * @param {number} requiredRole - Loại tài khoản yêu cầu (1=Admin, 2=NCC, 3=KH)
 * @returns {boolean}
 */
function checkRole(requiredRole) {
  const userInfo = getCurrentUser();
  if (!userInfo) return false;
  return userInfo.loaiTK === requiredRole;
}

/**
 * Hàm bảo vệ trang (yêu cầu đăng nhập)
 */
async function requireAuth() {
  if (!isLoggedIn()) {
    alert('Vui lòng đăng nhập để tiếp tục!');
    window.location.href = '/dangnhap.html';
    return false;
  }

  // Validate token
  try {
    const token = localStorage.getItem('token');
    const res = await callApi('/auth/validate', 'POST', { token });
    
    if (!res.success || !res.data.valid) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi validate token:', error);
    return false;
  }
}

/**
 * Hàm bảo vệ trang theo role
 * @param {number} requiredRole - Loại tài khoản yêu cầu
 */
async function requireRole(requiredRole) {
  const isAuth = await requireAuth();
  if (!isAuth) return false;

  if (!checkRole(requiredRole)) {
    alert('Bạn không có quyền truy cập trang này!');
    
    // Redirect về trang phù hợp với role
    const userInfo = getCurrentUser();
    if (userInfo.loaiTK === 1) {
      window.location.href = '/admin/dashboard.html';
    } else if (userInfo.loaiTK === 2) {
      window.location.href = '/ncc/dashboard.html';
    } else {
      window.location.href = '/index.html';
    }
    return false;
  }

  return true;
}