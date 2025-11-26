document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.service-card');
    const summaryEmpty = document.getElementById('summary-empty');
    const summaryServices = document.getElementById('summary-services');
    const summaryTotal = document.getElementById('summary-total');
    const continueBtn = document.getElementById('continueBtn');

    // lưu dịch vụ đã chọn: { id: {name, price} }
    const selected = {};

    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });

    function renderSummary() {
        const ids = Object.keys(selected);
        summaryServices.innerHTML = '';

        if (ids.length === 0) {
            summaryEmpty.style.display = 'block';
            summaryTotal.textContent = 'miễn phí';
            continueBtn.disabled = true;
            continueBtn.style.backgroundColor = '#bdbdbd';
            continueBtn.style.cursor = 'not-allowed';
            return;
        }

        summaryEmpty.style.display = 'none';

        let total = 0;
        ids.forEach(id => {
            const item = selected[id];
            total += item.price;

            const row = document.createElement('div');
            row.className = 'd-flex justify-content-between mb-1';
            row.innerHTML = `
                <div style="font-size:14px;">${item.name}</div>
                <div style="font-size:14px;">${currencyFormatter.format(item.price)}</div>
            `;
            summaryServices.appendChild(row);
        });

        summaryTotal.textContent = currencyFormatter.format(total);
        continueBtn.disabled = false;
        continueBtn.style.backgroundColor = '#111';
        continueBtn.style.cursor = 'pointer';
    }

    cards.forEach(card => {
        const btn = card.querySelector('.service-add-btn');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price, 10);

        function toggle() {
            const isSelected = card.classList.toggle('selected');

            // đổi dấu + ↔ ✓
            const span = btn.querySelector('span');
            span.textContent = isSelected ? '✓' : '+';

            if (isSelected) {
                selected[id] = { name, price };
            } else {
                delete selected[id];
            }
            renderSummary();
        }

        // click cả card hoặc nút đều được
        card.addEventListener('click', function (e) {
            // tránh click vào link bên trong (nếu sau này có)
            if (e.target.tagName.toLowerCase() === 'a') return;
            toggle();
        });

        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // không cho bubble lên card thêm lần nữa
            toggle();
        });
    });
});