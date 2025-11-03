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


// Add Email Address behavior
(function () {
    const addBtn = document.getElementById('addEmailBtn');
    const addForm = document.getElementById('addEmailForm');
    const saveBtn = document.getElementById('saveEmailBtn');
    const cancelBtn = document.getElementById('cancelEmailBtn');
    const input = document.getElementById('newEmailInput');
    const emailList = document.getElementById('emailList');
    const emailError = document.getElementById('emailError');

    function isValidEmail(e) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    }

    addBtn.addEventListener('click', function () {
        addForm.classList.remove('d-none');
        input.focus();
        addBtn.setAttribute('disabled', '');
    });

    cancelBtn.addEventListener('click', function () {
        addForm.classList.add('d-none');
        emailError.classList.add('d-none');
        emailError.textContent = '';
        input.value = '';
        addBtn.removeAttribute('disabled');
    });

    saveBtn.addEventListener('click', function () {
        const val = input.value.trim();
        if (!isValidEmail(val)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.classList.remove('d-none');
            return;
        }


        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center email-entry mb-2';
        wrapper.innerHTML = `
            <div class="me-3 email-icon bg-primary-subtle text-primary p-2 rounded-circle">
                <i class="fa-regular fa-envelope"></i>
            </div>
            <div>
                <div class="fw-medium">${val}</div>
                <div class="small text-muted">Just now</div>
            </div>`;

        emailList.appendChild(wrapper);
        // reset form
        input.value = '';
        emailError.classList.add('d-none');
        addForm.classList.add('d-none');
        addBtn.removeAttribute('disabled');

        // small saved feedback
        const tmp = document.createElement('span');
        tmp.className = 'ms-2 text-success small';
        tmp.textContent = 'Added';
        addBtn.parentNode.appendChild(tmp);
        setTimeout(() => tmp.remove(), 1200);
    });

})();