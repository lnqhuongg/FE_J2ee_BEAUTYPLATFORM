document.getElementById("avatarInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById("avatarPreview").src = URL.createObjectURL(file);
    }
});


$(document).ready(function () {
    let isEditing = false;

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
                valueBlock.html(`
                    <div class="d-flex gap-3">
                        <label class="form-check">
                            <input class="form-check-input" type="radio" name="gender" value="Nam"> Nam
                        </label>
                        <label class="form-check">
                            <input class="form-check-input" type="radio" name="gender" value="Nữ"> Nữ
                        </label>
                    </div>
                `);
            }

            // ==== NGÀY SINH ====
            else if (label === "Ngày sinh") {
                valueBlock.html(`
                    <div class="d-flex gap-2">
                        <input type="number" min="1" max="31" class="form-control" placeholder="Ngày">
                        <select class="form-select">
                            ${Array.from({ length: 12 }, (_, i) => `<option>Tháng ${i + 1}</option>`).join("")}
                        </select>
                        <input type="number" min="1900" max="2100" class="form-control" placeholder="Năm">
                    </div>
                `);
            }

            // ==== TRƯỜNG TEXT ====
            else {
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

    // ====== CLICK LƯU – gửi AJAX, KHÔNG load lại trang ======
    // $(document).on("click", "#saveBtn", function () {

    //     let dataToSend = {};

    //     $(".profile-info-item").each(function () {
    //         const label = $(this).find(".profile-info-label").text().trim();
    //         const valueBlock = $(this).find(".profile-info-value");

    //         let value = "-";

    //         // Giới tính
    //         if (label === "Giới tính") {
    //             value = valueBlock.find("input[type=radio]:checked").val() || "-";
    //         }
    //         // Ngày sinh
    //         else if (label === "Ngày sinh") {
    //             const d = valueBlock.find("input").eq(0).val();
    //             const m = valueBlock.find("select").val();
    //             const y = valueBlock.find("input").eq(1).val();
    //             value = (d && m && y) ? `${d}/${m}/${y}` : "-";
    //         }
    //         // Trường text
    //         else {
    //             value = valueBlock.find("input").val() || "-";
    //         }

    //         dataToSend[label] = value;
    //     });

    //     // ==== AJAX gửi lên backend mà không reload trang ====
    //     $.ajax({
    //         url: "/update-profile",   // đường dẫn API backend của bạn
    //         method: "POST",
    //         data: dataToSend,
    //         success: function (res) {

    //             // Sau khi backend trả về → render lại dạng text
    //             $(".profile-info-item").each(function () {
    //                 const label = $(this).find(".profile-info-label").text().trim();
    //                 $(this).find(".profile-info-value").text(dataToSend[label]);
    //             });

    //             restoreEditButton();
    //             isEditing = false;
    //         },
    //         error: function () {
    //             alert("Có lỗi xảy ra!");
    //         }
    //     });
    // });

    function restoreEditButton() {
        $(".edit-profile").html(`
            <a href="#" id="editProfileBtn">Chỉnh sửa</a>
        `);
    }

});
