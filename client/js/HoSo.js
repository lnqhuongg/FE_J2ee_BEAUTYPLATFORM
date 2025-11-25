document.getElementById("avatarInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById("avatarPreview").src = URL.createObjectURL(file);
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

        $(".profile-info-item").each(function () {
            const label = $(this).find(".profile-info-label").text().trim();
            const valueBlock = $(this).find(".profile-info-value");
            const value = valueBlock.text().trim();

            // Lưu giá trị cũ để dùng cho nút "Hủy"
            valueBlock.attr("data-old", value);

            // ==== GIỚI TÍNH ====
            if (label === "Giới tính") {
                const isNam = value === "Nam";
                const isNu = value === "Nữ";
                
                valueBlock.html(`
                    <div class="d-flex gap-3">
                        <label class="form-check">
                            <input class="form-check-input" type="radio" name="gender" value="1" ${isNam ? 'checked' : ''}> Nam
                        </label>
                        <label class="form-check">
                            <input class="form-check-input" type="radio" name="gender" value="2" ${isNu ? 'checked' : ''}> Nữ
                        </label>
                    </div>
                `);
            }

            // ==== NGÀY SINH ====
            else if (label === "Ngày sinh") {
                let day = "", month = "", year = "";
                
                // Parse ngày sinh nếu có (format: YYYY-MM-DD)
                if (value !== "-" && value.includes("-")) {
                    const parts = value.split("-");
                    year = parts[0];
                    month = parseInt(parts[1]);
                    day = parts[2];
                }
                
                valueBlock.html(`
                    <div class="d-flex gap-2">
                        <input type="number" min="1" max="31" class="form-control" placeholder="Ngày" value="${day}">
                        <select class="form-select">
                            <option value="">-- Tháng --</option>
                            ${Array.from({ length: 12 }, (_, i) => 
                                `<option value="${i + 1}" ${month == i + 1 ? 'selected' : ''}>Tháng ${i + 1}</option>`
                            ).join("")}
                        </select>
                        <input type="number" min="1900" max="2100" class="form-control" placeholder="Năm" value="${year}">
                    </div>
                `);
            }

            // ==== TRƯỜNG TEXT ====
            else if (label !== "Email") { // Email không cho sửa
                valueBlock.html(`
                    <input type="text" class="form-control" value="${value === '-' ? '' : value}">
                `);
            }
        });

        // ==== THAY NÚT ====
        $(".edit-profile").html(`
            <button id="saveBtn" class="btn btn-outline-dark btn-sm">Lưu</button>
            <button id="cancelBtn" class="btn btn-outline-dark btn-sm ms-2">Hủy</button>
        `);
    });

    // ====== CLICK HỦY – trả về dạng text ban đầu ======
    $(document).on("click", "#cancelBtn", function () {
        $(".profile-info-item").each(function () {
            const valueBlock = $(this).find(".profile-info-value");
            const oldVal = valueBlock.attr("data-old");
            valueBlock.text(oldVal);
        });

        restoreEditButton();
        isEditing = false;
    });

    // ====== CLICK LƯU ======
    $(document).on("click", "#saveBtn", function () {
        // Lấy giá trị từ các input
        let dataToSend = {
            hoTen: $("#hoTen").find("input").val() || "",
            sdt: $("#sdt").find("input").val() || "",
            gioiTinh: 0,
            ngaySinh: null,
            hinhAnh: $("#avatarPreview").attr("src") || ""
        };

        // ====== Ngày sinh ======
        const day = $("#ngaySinh").find("input").eq(0).val();
        const monthValue = $("#ngaySinh").find("select").val(); // Giá trị số từ 1-12
        const year = $("#ngaySinh").find("input").eq(1).val();

        if (day && monthValue && year) {
            // Format: YYYY-MM-DD
            const monthPadded = String(monthValue).padStart(2, '0');
            const dayPadded = String(day).padStart(2, '0');
            dataToSend.ngaySinh = `${year}-${monthPadded}-${dayPadded}`;
        }

        // ====== Giới tính ======
        const gtValue = $("#gioiTinh").find("input[type=radio]:checked").val();
        dataToSend.gioiTinh = gtValue ? parseInt(gtValue) : 0;

        const maKH = localStorage.getItem("hoSo_MaKH");

        console.log("Data gửi đi:", dataToSend); // Debug

        // ====== Gửi AJAX ======
        $.ajax({
            url: `http://localhost:8080/khachhang/${maKH}`,
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token
            },
            contentType: "application/json",
            data: JSON.stringify(dataToSend),
            success: function (res) {
                if(res.success) {
                    // Render lại UI
                    $("#hoTen").text(res.data.hoTen || "-");
                    $("#sdt").text(res.data.sdt || "-");
                    $("#ngaySinh").text(res.data.ngaySinh || "-");
                    
                    let gioiTinhText = "-";
                    if (res.data.gioiTinh === 1) gioiTinhText = "Nam";
                    else if (res.data.gioiTinh === 2) gioiTinhText = "Nữ";
                    $("#gioiTinh").text(gioiTinhText);
                    
                    $("#avatarPreview").attr("src", res.data.hinhAnh || "../img/image.png");
                    $("#avatarPreview_navbar").attr("src", res.data.hinhAnh || "../img/image.png");

                    restoreEditButton();
                    isEditing = false;
                } else {
                    console.log("Lỗi: " + (res.message || "Không thể cập nhật"));
                }
            },
            error: function (err) {
                console.error("Lỗi API update:", err);
            }
        });
    });

    function restoreEditButton() {
        $(".edit-profile").html(`
            <a href="#" id="editProfileBtn">Chỉnh sửa</a>
        `);
    }

});