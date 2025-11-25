const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const toast = document.getElementById("toast");
const toastClose = document.getElementById("toastClose");

avatarInput.addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (file) {
        avatarPreview.src = URL.createObjectURL(file);

        // Hiện toast
        showToast("Đã thay đổi ảnh đại diện thành công");
    }
});

function showToast(message) {
    document.getElementById("toastMessage").innerText = message;

    toast.classList.add("show");

    // Tự tắt sau 5 giây
    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}

toastClose.addEventListener("click", () => {
    toast.classList.remove("show");
});
