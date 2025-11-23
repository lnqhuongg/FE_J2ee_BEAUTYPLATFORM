(function () {
  const showMessage = (targetForm, text, type = 'success') => {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3 py-2 fade show rounded-3`;
    alert.innerHTML = `<i class="fa-regular fa-circle-check me-1"></i> ${text}`;
    targetForm.appendChild(alert);
    setTimeout(() => alert.remove(), 1800);
  };

  // --- Thông tin tài khoản ---
  const accountForm = document.getElementById('accountForm');
  if (accountForm) {
    accountForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = accountForm.fullname.value.trim();
      const email = accountForm.email.value.trim();

      if (!name || !email) return showMessage(accountForm, 'Vui lòng nhập đầy đủ thông tin!', 'danger');

      console.log('Lưu thông tin:', { name, email });
      showMessage(accountForm, 'Đã lưu thay đổi thông tin!');
    });
  }

  // --- Đổi mật khẩu ---
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', e => {
      e.preventDefault();

      const oldPass = passwordForm.oldPassword.value.trim();
      const newPass = passwordForm.newPassword.value.trim();
      const confirm = passwordForm.confirmPassword.value.trim();

      if (!oldPass || !newPass || !confirm)
        return showMessage(passwordForm, 'Vui lòng nhập đầy đủ mật khẩu!', 'danger');
      if (newPass !== confirm)
        return showMessage(passwordForm, 'Mật khẩu xác nhận không khớp!', 'danger');

      console.log('Đổi mật khẩu:', { oldPass, newPass });
      showMessage(passwordForm, 'Đã cập nhật mật khẩu!');
      passwordForm.reset();
    });
  }
})();
