 // Select specialist
//  Khi người dùng chọn một chuyên viên (bấm vào card hoặc nút "Chọn"), hàm này làm nhiệm vụ đánh dấu lựa chọn và cập nhật thông tin.
        function selectSpecialist(id) {
            const specialist = specialists.find(s => s.id == id);
            if (!specialist) return;

            selectedSpecialist = specialist;

            // Update UI
            document.querySelectorAll('.specialist-card').forEach(card => {
                card.classList.remove('selected');
            });

            document.querySelectorAll('.specialist-select-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            document.querySelector(`[data-id="${id}"]`).classList.add('selected');
            document.querySelector(`.specialist-select-btn[data-id="${id}"]`).classList.add('selected');

            // Update summary
            updateSummary();

            // Enable continue button
            document.getElementById('continueBtn').disabled = false;
        }

        // Update summary - cập nhật phần “Tóm tắt” khi có chuyên viên được chọn.
        function updateSummary() {
            const summaryEmpty = document.getElementById('summaryEmpty');
            const summaryServices = document.getElementById('summaryServices');
            const summaryTotal = document.getElementById('summaryTotal');

            if (selectedSpecialist) {
                summaryEmpty.style.display = 'none';
                summaryServices.innerHTML = `
                    <div class="summary-service-item">
                        <span class="summary-service-name">Haircut</span>
                        <span class="summary-service-price">${selectedSpecialist.price}</span>
                    </div>
                `;
                summaryTotal.textContent = selectedSpecialist.price;
            } else {
                summaryEmpty.style.display = 'block';
                summaryServices.innerHTML = '';
                summaryTotal.textContent = 'từ 380 HK$';
            }
        }

        // Sự kiện nút tiếp tục khi đã chọn đươc chuyên viên
        document.getElementById('continueBtn').addEventListener('click', function() {
            if (selectedSpecialist) {
                alert('Đã chọn chuyên viên: ' + selectedSpecialist.name);
                // You can redirect to next step here
            }
        });


        document.querySelectorAll('.specialist-card').forEach(card => {
        card.addEventListener('click', function() {
            selectSpecialist(this.dataset.id);
        });
});

document.querySelectorAll('.specialist-select-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectSpecialist(this.dataset.id);
    });
});
function selectSpecialist(id) {
    const card = document.querySelector(`.specialist-card[data-id="${id}"]`);
    if (!card) return;

    const name = card.querySelector(".specialist-name").textContent;
    const price = card.querySelector(".specialist-price").textContent;

    selectedSpecialist = { id, name, price };

    document.querySelectorAll('.specialist-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.specialist-select-btn').forEach(btn => btn.classList.remove('selected'));

    card.classList.add('selected');
    document.querySelector(`.specialist-select-btn[data-id="${id}"]`).classList.add('selected');

    updateSummary();
    document.getElementById('continueBtn').disabled = false;
}
