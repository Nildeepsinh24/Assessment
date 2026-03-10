class CustomerFormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.STORAGE_KEY = 'hotel_submissions';
        this.init();
    }

    init() {
        // Event delegation for real-time validation (on input/blur)
        this.form.addEventListener('input', (e) => this.handleValidation(e.target));
        this.form.addEventListener('blur', (e) => this.handleValidation(e.target), true);

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Form reset
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.clearForm());
        }
    }

    handleValidation(field) {
        if (!field.name) return true;

        let isValid = true;

        switch (field.name) {
            case 'fullName':
                isValid = field.value.trim().length >= 3;
                break;
            case 'phoneNumber':
                isValid = /^\d{10}$/.test(field.value);
                break;
            case 'emailAddress':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
                break;
            case 'aadharCard':
                isValid = /^\d{12}$/.test(field.value);
                break;
            case 'address':
            case 'purpose':
                isValid = field.value.trim().length > 0;
                break;
            case 'checkInDate':
                isValid = this.validateFutureDate(field.value);
                break;
            case 'checkOutDate':
                const checkInValue = this.form.elements['checkInDate'].value;
                isValid = this.validateCheckOutDate(checkInValue, field.value);
                break;
            case 'noOfAdults':
                isValid = parseInt(field.value) > 0;
                break;
        }

        // Apply visual feedback
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        return isValid;
    }

    validateFutureDate(dateStr) {
        if (!dateStr) return false;
        const selectedDate = new Date(dateStr).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }

    validateCheckOutDate(checkInStr, checkOutStr) {
        if (!checkOutStr || !this.validateFutureDate(checkOutStr)) return false;
        if (!checkInStr) return true;

        const checkIn = new Date(checkInStr).setHours(0, 0, 0, 0);
        const checkOut = new Date(checkOutStr).setHours(0, 0, 0, 0);
        return checkOut > checkIn;
    }

    validateForm() {
        let isFormValid = true;
        const elements = Array.from(this.form.elements).filter(el => el.name);

        elements.forEach(field => {
            if (!this.handleValidation(field)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.validateForm()) {
            this.saveToLocalStorage();
            showMessage('Registration successful!', 'success');
            this.clearForm();
        } else {
            showMessage('Please fix the errors in the form.', 'danger');
        }
    }

    saveToLocalStorage() {
        const formData = new FormData(this.form);
        const dataInfo = Object.fromEntries(formData.entries());
        dataInfo.id = Date.now().toString(); // unique ID

        const existingData = getItem(this.STORAGE_KEY);
        existingData.push(dataInfo);

        setItem(this.STORAGE_KEY, existingData);
    }

    clearForm() {
        this.form.reset();
        const elements = Array.from(this.form.elements).filter(el => el.name);
        elements.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    }
}
