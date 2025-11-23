console.log("api.js đã load! (dùng fetch thuần)");

const BASE_URL = "http://localhost:8080";

// HÀM callApi SIÊU GỌN – DỄ HIỂU – KHÔNG LỖI
async function callApi(endpoint, options = {}) {
  // Đảm bảo endpoint có dấu /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = BASE_URL + cleanEndpoint;

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : null,
    });

    const result = await response.json(); // ← result chính là { success: true, data: { content: [...] } }

    if (response.ok && result.success) {
      return { success: true, data: result.data }; // ← data là Page<LoaiHinh>
    } else {
      return { success: false, message: result.message || "Lỗi server" };
    }
  } catch (err) {
    console.error("Lỗi kết nối:", err);
    return { success: false, message: "Không kết nối được server" };
  }
}

// Export để dùng ở file khác (nếu cần)
window.callApi = callApi;