(() => {
  // ==================== BIẾN TOÀN CỤC ====================
  
  let currentEmail = '';
  let isExistingUser = false;
  // ==================== Kiểm tra token ====================
    document.addEventListener("DOMContentLoaded", () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
          localStorage.setItem('token', token);
          // Redirect tới trang chính
          window.location.href = 'TrangChu.html';
          return;
      }

      initDangNhapPage(); // load trang login/register bình thường
  });

  document.getElementById("loginLink").addEventListener("click", function () {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
  });
  document.getElementById("registerLink").addEventListener("click", function () {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
  });

  // ==================== KHỞI TẠO TRANG ====================
  
  function initDangNhapPage() {
    // Kiểm tra nếu đã đăng nhập
    checkExistingLogin();
  }

  // Tự động khởi tạo khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    initDangNhapPage();
  });

  // ==================== KIỂM TRA ĐĂNG NHẬP ====================

  async function checkExistingLogin() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await callApi('/auth/validate', 'POST', { token });
      
      if (res.success && res.data && res.data.valid) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        // Redirect dựa vào loại tài khoản
        if (userInfo.loaiTK === 2) {
          window.location.href = '/ncc/dashboard.html';
        } else if (userInfo.loaiTK === 3) {
          window.location.href = 'TrangChu.html';
        } else if (userInfo.loaiTK === 1) {
          window.location.href = '/admin/dashboard.html';
        }
      }
    } catch (error) {
      console.error('Lỗi kiểm tra token:', error);
    }
  }

  // ==================== HIỂN THỊ THÔNG BÁO ====================

  function showAlert(elementId, message, type = 'danger') {
    const alertDiv = document.getElementById(elementId);
    if (!alertDiv) return;

    alertDiv.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show mt-2 p-2" role="alert">
        ${message}
      </div>
    `;

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      alertDiv.innerHTML = '';
    }, 5000);
  }

  function hideAlert(elementId) {
    const alertDiv = document.getElementById(elementId);
    if (alertDiv) {
      alertDiv.innerHTML = '';
    }
  }

  // ==================== CHUYỂN ĐỔI GIỮA CÁC BƯỚC ====================

  function showEmailStep() {
    document.getElementById('emailStep').style.display = 'flex';
    document.getElementById('authStep').style.display = 'none';
    
    // Reset form
    document.getElementById('inputEmail').value = '';
    hideAlert('register_emailAlert');
    hideAlert('login_emailAlert');
    hideAlert('login_passwordAlert');
  }

  function showOtpStep() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('otpStep').style.display = 'block';
    
    hideAlert('otpAlert');
    $('#inputOtp').val('').focus();
  }


  function showAuthStep(isLogin = true) {
    document.getElementById('emailStep').style.display = 'none';
    document.getElementById('authStep').style.display = 'flex';
    
    hideAlert('authAlert');
    // Hiển thị form đăng ký
    document.getElementById('authTitle').textContent = 'Tạo tài khoản mới';
    document.getElementById('authDescription').innerHTML = 
      `Gần xong rồi! Tạo tài khoản mới cho email <strong>${currentEmail}</strong> của bạn bằng cách hoàn thành các thông tin sau`;
    
    document.getElementById('formLogin').style.display = 'none';
    document.getElementById('formRegister').style.display = 'block';
    
    // Focus vào input họ tên
    setTimeout(() => {
      document.getElementById('inputFullname').focus();
    }, 100);
  }

  // ==================== XỬ LÝ CHECK EMAIL ====================

  async function handleCheckEmailExists(email) {
    try {
      // Gọi API kiểm tra email có tồn tại không
      const res = await callApi(`/auth/check-email?email=${encodeURIComponent(email)}`, 'GET');
      
      if (res.success) {
        isExistingUser = res.data.exists || false;
        return res.data.exists;
      } else {
        // Nếu API không có endpoint check-email, mặc định là user mới
        isExistingUser = false;
        return res.data.exists;
      }
    } catch (error) {
      console.error('Lỗi kiểm tra email:', error);
      // Nếu có lỗi, cho phép tiếp tục (mặc định là đăng ký)
      isExistingUser = false;
      return res.data.exists;
    }
  }

  // ==================== XỬ LÝ ĐĂNG NHẬP ====================

  async function handleLogin(email,matKhau) {
    const btnLogin = document.getElementById('btnLogin');
    console.log("Đang xử lý đăng nhập..."+email+matKhau);
    try {
      // Disable button và hiển thị loading
      btnLogin.disabled = true;
      btnLogin.textContent = 'Đang xử lý...';

      const res = await callApi('/auth/dangnhap', 'POST', {
        email: email,
        matKhau: matKhau
      });
      if (res.success && res.data) {
        // Lưu token và thông tin user
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        
        showAlert('login_passwordAlert', 'Đăng nhập thành công! Đang chuyển hướng...', 'success');
        
        // Redirect sau 1.5 giây
        setTimeout(() => {
          if (res.data.loaiTK === 2) {
            window.location.href = '/ncc/dashboard.html';
          } else if (res.data.loaiTK === 3) {
            window.location.href = '/client/pages/TrangChu.html';
          } else if (res.data.loaiTK === 1) {
            window.location.href = '/admin/dashboard.html';
          } else {
            window.location.href = '/index.html';
          }
        }, 1500);

      } else {
        showAlert('login_passwordAlert', res.message || 'Email hoặc mật khẩu không đúng!');
      }

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      showAlert('login_passwordAlert', 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!');
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Đăng nhập';
    }
  }

  // ==================== XỬ LÝ ĐĂNG KÝ ====================

  async function handleRegister(hoTen, matKhau, xacNhanMatKhau, sdt, ngaySinh, gioiTinh) {
    const btnRegister = document.getElementById('btnRegister');
    
    try {
      // Validate
      if (matKhau !== xacNhanMatKhau) {
        showAlert('authAlert', 'Mật khẩu xác nhận không khớp!');
        return;
      }

      if (matKhau.length < 6) {
        showAlert('authAlert', 'Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }

      // Validate số điện thoại (9-10 số)
      if (!/^[0-9]{9,10}$/.test(sdt)) {
        showAlert('authAlert', 'Số điện thoại không hợp lệ!');
        return;
      }
      
      // Validate tuổi > 10
      const tuoi = new Date().getFullYear() - new Date(ngaySinh).getFullYear();
      if (tuoi < 10) {
        showAlert('authAlert', 'Tuổi không hợp lệ!');
        return;
      }

      // Disable button và hiển thị loading
      btnRegister.disabled = true;
      btnRegister.textContent = 'Đang xử lý...';

      const res = await callApi('/auth/dangky', 'POST', {
        email: currentEmail,
        matKhau: matKhau,
        xacNhanMatKhau: xacNhanMatKhau,
        loaiTK: 3, // Khách hàng
        hoTen: hoTen,
        sdt: sdt,
        ngaySinh: ngaySinh,
        gioiTinh: Number(gioiTinh)
      });

      if (res.success && res.data) {
        // Lưu token và thông tin user
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        
        showAlert('authAlert', 'Đăng ký thành công! Đang chuyển hướng...', 'success');
        
        // Redirect sau 1.5 giây
        setTimeout(() => {
          window.location.href = '/TrangChu.html';
        }, 1500);

      } else {
        showAlert('authAlert', res.message || 'Đăng ký không thành công!');
      }

    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      showAlert('authAlert', 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại!');
    } finally {
      btnRegister.disabled = false;
      btnRegister.textContent = 'Đăng ký';
    }
  }

  // ==================== OAUTH2 LOGIN ====================

  function handleOAuth2Login(provider) {
    // Redirect đến endpoint OAuth2 của backend
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  }

  // ==================== JQUERY EVENT HANDLERS ====================

  $(document).ready(function () {

    // ==================== FORM CHECK EMAIL ====================
    
    $('#formCheckEmail').on('submit', async function (e) {
      e.preventDefault();
      
      const email = $('#inputEmail').val().trim();
      
      if (!email) {
        showAlert('register_emailAlert', 'Vui lòng nhập địa chỉ email!');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('register_emailAlert', 'Địa chỉ email không hợp lệ!');
        return;
      }

      const btnContinue = $('#btnContinueEmail');
      btnContinue.prop('disabled', true).text('Đang kiểm tra...');

      currentEmail = email;
      
      // Kiểm tra email có tồn tại không
      const isExists = await handleCheckEmailExists(email);
      
      if (!isExists) {
        await callApi('/auth/send-otp?email=' + encodeURIComponent(email), 'POST');
        showOtpStep();
      } else {
        showAlert('register_emailAlert', 'Email đã tồn tại trong hệ thống!');
      }

      btnContinue.prop('disabled', false).text('Tiếp tục');
    });

    // ==================== FORM ĐĂNG NHẬP ====================
    
    $('#formLogin').on('submit', async function (e) {
      e.preventDefault();

      const password = $('#inputLoginPassword').val();
      const email = $('#inputLoginEmail').val().trim();
      
      if (!email) {
        showAlert('login_emailAlert', 'Vui lòng nhập địa chỉ email!');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('login_emailAlert', 'Địa chỉ email không hợp lệ!');
        return;
      }
      if (!password) {
        showAlert('login_passwordAlert', 'Vui lòng nhập mật khẩu!');
        return;
      }

      await handleLogin(email,password);
    });

    // ==================== FORM ĐĂNG KÝ ====================
    
    $('#formRegister').on('submit', async function (e) {
      e.preventDefault();
      
      const hoTen = $('#inputFullname').val().trim();
      const matKhau = $('#inputRegisterPassword').val();
      const xacNhanMatKhau = $('#inputConfirmPassword').val();
      const sdt = $('#inputPhone').val().trim();
      const ngaySinh = $('#inputBirthdate').val();
      const gioiTinh = $('#inputGender').val();
      
      if (!hoTen) {
        showAlert('authAlert', 'Vui lòng nhập họ và tên!');
        return;
      }

      if (!matKhau) {
        showAlert('authAlert', 'Vui lòng nhập mật khẩu!');
        return;
      }

      if (!xacNhanMatKhau) {
        showAlert('authAlert', 'Vui lòng nhập xác nhận mật khẩu!');
        return;
      }

      if (!sdt) {
        showAlert('authAlert', 'Vui lòng nhập số điện thoại!');
        return;
      }

      if (!ngaySinh) {
        showAlert('authAlert', 'Vui lòng chọn ngày sinh!');
        return;
      }

      if (!gioiTinh) {
        showAlert('authAlert', 'Vui lòng chọn giới tính!');
        return;
      }

      await handleRegister(hoTen, matKhau, xacNhanMatKhau, sdt, ngaySinh, gioiTinh);
    });

    $('#formOtp').on('submit', async function(e) {
        e.preventDefault();
        const otp = $('#inputOtp').val().trim();

        if (!otp) {
            showAlert('otpAlert', 'Vui lòng nhập OTP!');
            return;
        }

        const res = await callApi(`/auth/verify-otp?email=${encodeURIComponent(currentEmail)}&otp=${encodeURIComponent(otp)}`, 'POST');

        if (res.success) {
            // OTP hợp lệ, chuyển sang bước đăng nhập hoặc đăng ký
            showAuthStep(isExistingUser);
        } else {
            showAlert('otpAlert', res.message || 'OTP không hợp lệ!');
        }
    });
    $('#resendOtp').on('click', async function(e) {
        e.preventDefault();

        const btn = $(this);
        btn.prop('disabled', true).text('Đang gửi OTP...'); // Disable và đổi text

        try {
            await callApi('/auth/send-otp?email=' + encodeURIComponent(currentEmail), 'POST');
            showAlert('otpAlert', 'OTP đã được gửi lại!', 'success');
        } catch (error) {
            console.error('Lỗi gửi OTP:', error);
            showAlert('otpAlert', 'Gửi OTP thất bại. Vui lòng thử lại!', 'danger');
        } finally {
            btn.prop('disabled', false).text('Gửi lại OTP'); // Bật lại button và đổi text về
        }
    });


    // ==================== QUAY LẠI NHẬP EMAIL ====================
    
    $('#linkBackToEmail, #linkBackToEmail2').on('click', function (e) {
      e.preventDefault();
      showEmailStep();
      
      // Reset form đăng nhập/đăng ký
      $('#formLogin')[0].reset();
      $('#formRegister')[0].reset();
    });

    // ==================== OAUTH2 BUTTONS ====================
    
    $('#btnLoginGoogle').on('click', function () {
      handleOAuth2Login('google');
    });

    $('#btnLoginFacebook').on('click', function () {
      handleOAuth2Login('facebook');
    });

    // ==================== ENTER KEY SUPPORT ====================
    
    $('#inputEmail').on('keypress', function (e) {
      if (e.which === 13) {
        $('#formCheckEmail').submit();
      }
    });

    $('#inputLoginPassword').on('keypress', function (e) {
      if (e.which === 13) {
        $('#formLogin').submit();
      }
    });

  });

  // Export hàm để có thể gọi từ bên ngoài
  window.initDangNhapPage = initDangNhapPage;

})();