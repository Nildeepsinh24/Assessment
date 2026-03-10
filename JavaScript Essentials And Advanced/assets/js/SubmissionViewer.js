import { getItem, setItem, showMessage } from './utils.js';

export class SubmissionViewer {
    constructor(tableBodyId, searchInputId) {
        this.tableBody = document.getElementById(tableBodyId);
        this.searchInput = document.getElementById(searchInputId);
        this.noDataMsg = document.getElementById('noDataMessage');

        if (!this.tableBody) return;

        this.STORAGE_KEY = 'hotel_submissions';
        this.init();
    }

    init() {
        this.renderTable();

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.filterData(e.target.value));
        }

        // Event delegation for deleting records
        this.tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.getAttribute('data-id');
                this.deleteRecord(id);
            }
        });
    }

    renderTable(searchTerm = '') {
        const data = getItem(this.STORAGE_KEY);
        this.tableBody.innerHTML = '';

        let filteredData = data;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = data.filter(item =>
                item.fullName.toLowerCase().includes(term) ||
                item.checkInDate.includes(term)
            );
        }

        if (filteredData.length === 0) {
            this.noDataMsg.classList.add('show-msg');
            this.tableBody.parentElement.style.display = 'none'; // hide table head
            return;
        }

        this.noDataMsg.classList.remove('show-msg');
        this.tableBody.parentElement.style.display = 'table'; // show table

        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(item.fullName)}</td>
                <td>${this.escapeHtml(item.phoneNumber)}</td>
                <td>${this.escapeHtml(item.emailAddress)}</td>
                <td>${this.escapeHtml(item.aadharCard)}</td>
                <td>${this.escapeHtml(item.checkInDate)}</td>
                <td>${this.escapeHtml(item.checkOutDate)}</td>
                <td>${this.escapeHtml(item.noOfAdults)}</td>
                <td>${this.escapeHtml(item.purpose)}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">Delete</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    filterData(searchTerm) {
        this.renderTable(searchTerm);
    }

    deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            const data = getItem(this.STORAGE_KEY);
            const newData = data.filter(item => item.id !== id);
            setItem(this.STORAGE_KEY, newData);
            this.renderTable(this.searchInput ? this.searchInput.value : '');
            showMessage('Record deleted successfully', 'success');
        }
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return (unsafe + '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
