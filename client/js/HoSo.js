document.getElementById("avatarInput").addEventListener("change", async function (event) {
    const file = event.target.files[0];

    if (!file) return;

    // Tạo FormData gửi file lên backend
    const formData = new FormData();
    formData.append("file", file);

    try {
        const uploadResponse = await fetch("http://localhost:8080/upload/khachhang", {
            method: "POST",
            body: formData
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
            const imageUrl = uploadData.data.url;

            // Hiển thị preview avatar
            document.getElementById("avatarPreview").src = imageUrl;

            // Nếu bạn muốn lưu để gửi PUT cập nhật KH sau:
            localStorage.setItem("uploadedAvatarUrl", imageUrl);
        } else {
            console.error("Upload failed:", uploadData.message);
        }

    } catch (error) {
        console.error("Lỗi upload:", error);
    }
});


$(document).ready(function () {
    let isEditing = false;

    const token = localStorage.getItem("token"); 
    if (!token) {
        console.warn("Chưa đăng nhập!");
        return;
    }

    // Gọi API để lấy hồ sơ tài khoản
    $.ajax({
        url: "http://localhost:8080/auth/hoso",
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (hoso) {
            localStorage.setItem("hoSo_MaKH", hoso.data.maKH);
            // Avatar
            if (hoso.data.hinhAnh) {
                $("#avatarPreview").attr("src", hoso.data.hinhAnh);
                $("#avatarPreview_navbar").attr("src", hoso.data.hinhAnh);
            }

            $("#profileName").text(hoso.data.hoTen || "Người dùng");    
            $(".user-name").text(hoso.data.hoTen || "Người dùng"); 
            // Họ Tên
            $("#hoTen").text(hoso.data.hoTen || "-");

            // Số điện thoại
            $("#sdt").text(hoso.data.sdt || "-");

            // Email
            $("#email").text(hoso.data.email || "-");

            // Ngày sinh
            $("#ngaySinh").text(hoso.data.ngaySinh ? hoso.data.ngaySinh : "-");

            // Giới tính
            let gt = "-";
            if (hoso.data.gioiTinh === 1) gt = "Nam";
            else if (hoso.data.gioiTinh === 2) gt = "Nữ";

            $("#gioiTinh").text(gt);
        },
        error: function (err) {
            console.error("Lỗi khi load hồ sơ:", err);
        }
    });

    // ====== CLICK CHỈNH SỬA ======
    $(document).on("click", "#editProfileBtn", function (e) {
        e.preventDefault();
        if (isEditing) return;
        isEditing = true;
        $(".edit-btn").removeClass("d-none");

        $(".profile-info-item").each(function () {
            const label = $(this).find(".profile-info-label").text().trim();
            const valueBlock = $(this).find(".profile-info-value");
            const value = valueBlock.text().trim();
            const errorBlock = $(this).find(".invalid-feedback");

            // Lưu giá trị cũ
            valueBlock.attr("data-old", value);

            // Reset lỗi
            errorBlock.text("").hide();

            if (label === "Giới tính") {
                const isNam = value === "Nam";
                const isNu = value === "Nữ";

                valueBlock.html(`
                    <div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="gender" value="1" ${isNam ? 'checked' : ''}>
                            <label class="form-check-label">Nam</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="gender" value="2" ${isNu ? 'checked' : ''}>
                            <label class="form-check-label">Nữ</label>
                        </div>
                    </div>
                `);
            } else if (label === "Ngày sinh") {
                let day = "", month = "", year = "";
                if (value !== "-" && value.includes("-")) {
                    const parts = value.split("-");
                    year = parts[0];
                    month = parseInt(parts[1]);
                    day = parts[2];
                }
                valueBlock.html(`
                    <div class="d-flex gap-2">
                        <input type="number" min="1" max="31" class="form-control form-control-sm" placeholder="Ngày" value="${day}">
                        <select class="form-select form-select-sm">
                            <option value="">-- Tháng --</option>
                            ${Array.from({ length: 12 }, (_, i) => 
                                `<option value="${i+1}" ${month==i+1?'selected':''}>Tháng ${i+1}</option>`
                            ).join('')}
                        </select>
                        <input type="number" min="1900" max="2100" class="form-control form-control-sm" placeholder="Năm" value="${year}">
                    </div>
                `);
            } else if (label !== "Email") {
                valueBlock.html(`<input type="text" class="form-control form-control-sm" value="${value==='-'?'':value}">`);
            }
        });

        $(".edit-profile").html(`
            <button id="saveBtn" class="btn btn-outline-dark btn-sm">Lưu</button>
            <button id="cancelBtn" class="btn btn-outline-dark btn-sm ms-2">Hủy</button>
        `);
    });

    // Hủy
    $(document).on("click", "#cancelBtn", function () {
        $(".profile-info-item").each(function () {
            const valueBlock = $(this).find(".profile-info-value");
            valueBlock.text(valueBlock.attr("data-old"));
            $(this).find(".invalid-feedback").text("").hide();
        });
        restoreEditButton();
        isEditing = false;
    });

    // Lưu + Validate
    $(document).on("click", "#saveBtn", function () {
        let isValid = true;

        let dataToSend = {
            hoTen: $("#hoTen").find("input").val() || "",
            sdt: $("#sdt").find("input").val() || "",
            gioiTinh: 0,
            ngaySinh: null,
            hinhAnh: localStorage.getItem("uploadedAvatarUrl") || null
        };

        // Validate Họ tên
        if (!dataToSend.hoTen.trim()) {
            $("#hoTen").find("input").addClass("is-invalid");
            $("#hoTenError").text("Vui lòng nhập họ tên").show();
            isValid = false;
        } else {
            $("#hoTen").find("input").removeClass("is-invalid");
            $("#hoTenError").hide();
        }

        // Validate SĐT
        const phoneVal = dataToSend.sdt.trim();
        if (!phoneVal) {
            $("#sdt").find("input").addClass("is-invalid");
            $("#sdtError").text("Vui lòng nhập số điện thoại").show();
            isValid = false;
        } else if (!/^[0-9]{9,10}$/.test(phoneVal)) {
            $("#sdt").find("input").addClass("is-invalid");
            $("#sdtError").text("Số điện thoại không hợp lệ").show();
            isValid = false;
        } else {
            $("#sdt").find("input").removeClass("is-invalid");
            $("#sdtError").hide();
        }

        // Validate Giới tính
        const gtVal = $("#gioiTinh").find("input[type=radio]:checked").val();
        if (!gtVal) {
            $("#gioiTinhError").text("Vui lòng chọn giới tính").show();
            isValid = false;
        } else {
            $("#gioiTinhError").hide();
            dataToSend.gioiTinh = parseInt(gtVal);
        }

        // Validate Ngày sinh
        const day = $("#ngaySinh").find("input").eq(0).val();
        const month = $("#ngaySinh").find("select").val();
        const year = $("#ngaySinh").find("input").eq(1).val();
        if (!day || !month || !year) {
            $("#ngaySinhError").text("Vui lòng nhập ngày sinh đầy đủ").show();
            isValid = false;
        } else {
            const tuoi = new Date().getFullYear() - parseInt(year);
            if (tuoi < 10) {
                $("#ngaySinhError").text("Tuổi không hợp lệ").show();
                isValid = false;
            } else {
                $("#ngaySinhError").hide();
                dataToSend.ngaySinh = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            }
        }

        if (!isValid) return;

        const maKH = localStorage.getItem("hoSo_MaKH");
        $.ajax({
            url: `http://localhost:8080/khachhang/${maKH}`,
            method: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify(dataToSend),
            success: function (res) {
                if(res.success){
                    $("#hoTen").text(res.data.hoTen || "-");
                    $("#sdt").text(res.data.sdt || "-");
                    $("#ngaySinh").text(res.data.ngaySinh || "-");
                    $("#gioiTinh").text(res.data.gioiTinh===1?"Nam":"Nữ");
                    $("#avatarPreview, #avatarPreview_navbar").attr("src", res.data.hinhAnh || "../img/image.png");
                    restoreEditButton();
                    isEditing = false;
                } else {
                    console.log(res.message || "Không thể cập nhật");
                }
            },
            error: function(err){
                console.error("Lỗi API update:", err);
            }
        });
    });

    function restoreEditButton() {
        $(".edit-profile").html(`
            <a href="#" id="editProfileBtn">Chỉnh sửa</a>
        `);
        $(".edit-btn").addClass("d-none");
    }

});