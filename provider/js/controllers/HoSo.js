(function () {
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('profileForm');
    let editing = false;

    function setEditable(flag) {
        const controls = form.querySelectorAll('input, select, textarea');
        controls.forEach(c => c.disabled = !flag);
    }

    editBtn.addEventListener('click', function () {
        if (!editing) {
            editing = true;
            setEditable(true);
            editBtn.textContent = 'Save';
            cancelBtn.classList.remove('d-none');
            editBtn.classList.remove('btn-primary');
            editBtn.classList.add('btn-success');
        } else {
            editing = false;
            setEditable(false);
            editBtn.textContent = 'Edit';
            cancelBtn.classList.add('d-none');
            editBtn.classList.remove('btn-success');
            editBtn.classList.add('btn-primary');
            editBtn.blur();
            const tmp = document.createElement('span');
            tmp.className = 'ms-2 text-success small';
            tmp.textContent = 'Saved';
            editBtn.parentNode.appendChild(tmp);
            setTimeout(() => tmp.remove(), 1200);
        }
    });

    cancelBtn.addEventListener('click', function () {
        editing = false;
        setEditable(false);
        editBtn.textContent = 'Edit';
        cancelBtn.classList.add('d-none');
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-primary');
    });

    setEditable(false);
})();

// Working Hours Editing
(function () {
    const editHoursBtn = document.getElementById('editHoursBtn');
    const cancelHoursBtn = document.getElementById('cancelHoursBtn');
    const saveHoursBtn = document.getElementById('saveHoursBtn');
    const hoursViewMode = document.getElementById('hoursViewMode');
    const hoursEditMode = document.getElementById('hoursEditMode');
    const toggleClosedBtns = document.querySelectorAll('.toggle-closed-btn');

    editHoursBtn.addEventListener('click', function () {
        hoursViewMode.classList.add('d-none');
        hoursEditMode.classList.remove('d-none');
        editHoursBtn.classList.add('d-none');
        cancelHoursBtn.classList.remove('d-none');
        saveHoursBtn.classList.remove('d-none');
    });

    cancelHoursBtn.addEventListener('click', function () {
        hoursViewMode.classList.remove('d-none');
        hoursEditMode.classList.add('d-none');
        editHoursBtn.classList.remove('d-none');
        cancelHoursBtn.classList.add('d-none');
        saveHoursBtn.classList.add('d-none');
    });

    saveHoursBtn.addEventListener('click', function () {
        hoursViewMode.classList.remove('d-none');
        hoursEditMode.classList.add('d-none');
        editHoursBtn.classList.remove('d-none');
        cancelHoursBtn.classList.add('d-none');
        saveHoursBtn.classList.add('d-none');

        const tmp = document.createElement('span');
        tmp.className = 'ms-2 text-success small';
        tmp.textContent = 'Saved';
        saveHoursBtn.parentNode.appendChild(tmp);
        setTimeout(() => tmp.remove(), 1200);
    });

    toggleClosedBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const day = this.getAttribute('data-day');
            const inputs = hoursEditMode.querySelectorAll(`input[data-day="${day}"]`);
            const indicator = hoursEditMode.querySelectorAll('.day-indicator')[day];

            if (this.textContent.trim() === 'Mở') {
                inputs.forEach(input => input.disabled = true);
                this.textContent = 'Đóng';
                this.classList.remove('btn-outline-danger');
                this.classList.add('btn-outline-success');
                indicator.classList.add('off');
            } else {
                inputs.forEach(input => input.disabled = false);
                this.textContent = 'Mở';
                this.classList.remove('btn-outline-success');
                this.classList.add('btn-outline-danger');
                indicator.classList.remove('off');
            }
        });
    });
})();

// Images Management
(function () {
    const editImagesBtn = document.getElementById('editImagesBtn');
    const cancelImagesBtn = document.getElementById('cancelImagesBtn');
    const saveImagesBtn = document.getElementById('saveImagesBtn');
    const imagesViewMode = document.getElementById('imagesViewMode');
    const imagesEditMode = document.getElementById('imagesEditMode');
    const imageBoxes = document.querySelectorAll('.image-upload-box.rounded');
    const imageInputs = document.querySelectorAll('.image-input');

    editImagesBtn.addEventListener('click', function () {
        imagesViewMode.classList.add('d-none');
        imagesEditMode.classList.remove('d-none');
        editImagesBtn.classList.add('d-none');
        cancelImagesBtn.classList.remove('d-none');
        saveImagesBtn.classList.remove('d-none');
    });

    cancelImagesBtn.addEventListener('click', function () {
        imagesViewMode.classList.remove('d-none');
        imagesEditMode.classList.add('d-none');
        editImagesBtn.classList.remove('d-none');
        cancelImagesBtn.classList.add('d-none');
        saveImagesBtn.classList.add('d-none');
    });

    saveImagesBtn.addEventListener('click', function () {
        imagesViewMode.classList.remove('d-none');
        imagesEditMode.classList.add('d-none');
        editImagesBtn.classList.remove('d-none');
        cancelImagesBtn.classList.add('d-none');
        saveImagesBtn.classList.add('d-none');

        const tmp = document.createElement('span');
        tmp.className = 'ms-2 text-success small';
        tmp.textContent = 'Saved';
        saveImagesBtn.parentNode.appendChild(tmp);
        setTimeout(() => tmp.remove(), 1200);
    });

    // Image upload handlers
    imageInputs.forEach(input => {
        const box = input.parentElement;
        
        box.addEventListener('click', function () {
            input.click();
        });

        input.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    box.innerHTML = '';
                    box.classList.add('has-image');
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.alt = 'Uploaded image';
                    box.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });
})();