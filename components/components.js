/**
 * MAPTSS Digital+ Component System
 * Reusable UI components for the platform
 */

class MAPTSSComponents {
    constructor() {
        this.modals = new Map();
        this.notifications = [];
        this.charts = new Map();
        
        this.initializeComponents();
    }

    initializeComponents() {
        this.createNotificationContainer();
        this.initializeTooltips();
        this.initializePopovers();
        this.initializeModals();
    }

    // Notification System
    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        const notificationId = 'notification_' + Date.now();
        
        const typeIcons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const typeColors = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        };

        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `alert ${typeColors[type]} alert-dismissible fade show`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <i class="${typeIcons[type]} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);

        // Auto dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                this.dismissNotification(notificationId);
            }, duration);
        }

        return notificationId;
    }

    dismissNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            const alert = new bootstrap.Alert(notification);
            alert.close();
        }
    }

    // Loading States
    showLoading(element, text = 'Carregando...') {
        const originalContent = element.innerHTML;
        element.setAttribute('data-original-content', originalContent);
        element.disabled = true;
        element.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${text}
        `;
    }

    hideLoading(element) {
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        }
        element.disabled = false;
    }

    // Modal System
    createModal(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = id;
        modal.tabIndex = -1;
        
        const size = options.size ? `modal-${options.size}` : '';
        const backdrop = options.backdrop !== false ? 'data-bs-backdrop="static"' : '';
        
        modal.innerHTML = `
            <div class="modal-dialog ${size}">
                <div class="modal-content">
                    <div class="modal-header ${options.headerClass || ''}">
                        <h5 class="modal-title">${title}</h5>
                        ${options.closable !== false ? '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' : ''}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal, {
            backdrop: options.backdrop !== false,
            keyboard: options.keyboard !== false
        });

        this.modals.set(id, bootstrapModal);
        return bootstrapModal;
    }

    showModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.show();
        }
    }

    hideModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.hide();
        }
    }

    // Confirmation Dialog
    showConfirmation(title, message, onConfirm, onCancel) {
        const modalId = 'confirmation-modal-' + Date.now();
        const content = `
            <p>${message}</p>
        `;
        const footer = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="${modalId}-confirm">Confirmar</button>
        `;

        const modal = this.createModal(modalId, title, content, {
            footer: footer,
            size: 'sm'
        });

        const confirmBtn = document.getElementById(`${modalId}-confirm`);
        confirmBtn.addEventListener('click', () => {
            modal.hide();
            if (onConfirm) onConfirm();
        });

        const modalElement = document.getElementById(modalId);
        modalElement.addEventListener('hidden.bs.modal', () => {
            if (onCancel) onCancel();
            modalElement.remove();
            this.modals.delete(modalId);
        });

        modal.show();
    }

    // Form Validation
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Este campo é obrigatório');
                isValid = false;
            } else {
                this.clearFieldError(input);
                
                // Specific validations
                if (input.type === 'email' && !this.isValidEmail(input.value)) {
                    this.showFieldError(input, 'Email inválido');
                    isValid = false;
                }
                
                if (input.type === 'tel' && !this.isValidPhone(input.value)) {
                    this.showFieldError(input, 'Telefone inválido');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        
        input.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        input.classList.remove('is-invalid');
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    isValidPhone(phone) {
        const regex = /^\+244\s?\d{3}\s?\d{3}\s?\d{3}$/;
        return regex.test(phone.replace(/\s/g, ''));
    }

    // Data Tables
    createDataTable(containerId, data, columns, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const table = document.createElement('table');
        table.className = 'table table-hover';
        
        // Create header
        const thead = document.createElement('thead');
        thead.className = 'table-light';
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.title;
            th.className = column.className || '';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                
                if (column.render) {
                    td.innerHTML = column.render(row[column.key], row);
                } else {
                    td.textContent = row[column.key] || '';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
        
        return table;
    }

    // Progress Bar
    createProgressBar(containerId, percentage, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.style.height = options.height || '10px';
        
        const progressFill = document.createElement('div');
        progressFill.className = `progress-bar ${options.color || 'bg-primary'}`;
        progressFill.style.width = `${percentage}%`;
        progressFill.setAttribute('role', 'progressbar');
        progressFill.setAttribute('aria-valuenow', percentage);
        progressFill.setAttribute('aria-valuemin', '0');
        progressFill.setAttribute('aria-valuemax', '100');
        
        if (options.animated) {
            progressFill.classList.add('progress-bar-animated');
        }
        
        if (options.showLabel) {
            progressFill.textContent = `${percentage}%`;
        }
        
        progressBar.appendChild(progressFill);
        container.appendChild(progressBar);
        
        return progressBar;
    }

    // Chart Components
    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !window.Chart) return;

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };

        const chartOptions = { ...defaultOptions, ...options };
        
        const chart = new Chart(canvas, {
            type: type,
            data: data,
            options: chartOptions
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    // File Upload Component
    createFileUpload(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const fileUpload = document.createElement('div');
        fileUpload.className = 'file-upload-area border-2 border-dashed rounded p-4 text-center';
        fileUpload.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
            <p class="mb-2">Arraste e solte arquivos aqui ou</p>
            <button type="button" class="btn btn-outline-primary">Selecionar Arquivos</button>
            <input type="file" class="d-none" ${options.multiple ? 'multiple' : ''} accept="${options.accept || '*'}">
            <small class="text-muted d-block mt-2">
                ${options.maxSize ? `Tamanho máximo: ${options.maxSize}MB` : ''}
            </small>
        `;

        const input = fileUpload.querySelector('input[type="file"]');
        const button = fileUpload.querySelector('button');
        
        button.addEventListener('click', () => input.click());
        
        // Drag and drop functionality
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('border-primary', 'bg-light');
        });
        
        fileUpload.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('border-primary', 'bg-light');
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('border-primary', 'bg-light');
            
            const files = e.dataTransfer.files;
            this.handleFileSelection(files, options);
        });
        
        input.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files, options);
        });

        container.appendChild(fileUpload);
        return fileUpload;
    }

    handleFileSelection(files, options) {
        Array.from(files).forEach(file => {
            if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
                this.showNotification(`Arquivo ${file.name} é muito grande`, 'error');
                return;
            }
            
            if (options.onFileSelect) {
                options.onFileSelect(file);
            }
        });
    }

    // Search Component
    createSearchBox(containerId, onSearch, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const searchBox = document.createElement('div');
        searchBox.className = 'search-box position-relative';
        searchBox.innerHTML = `
            <input type="search" class="form-control" placeholder="${options.placeholder || 'Pesquisar...'}" autocomplete="off">
            <i class="fas fa-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
            <div class="search-results position-absolute w-100 bg-white border rounded shadow-sm d-none" style="z-index: 1000; max-height: 300px; overflow-y: auto;"></div>
        `;

        const input = searchBox.querySelector('input');
        const resultsContainer = searchBox.querySelector('.search-results');
        
        let searchTimeout;
        
        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= (options.minLength || 2)) {
                searchTimeout = setTimeout(() => {
                    onSearch(query).then(results => {
                        this.displaySearchResults(resultsContainer, results, options);
                    });
                }, options.delay || 300);
            } else {
                resultsContainer.classList.add('d-none');
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target)) {
                resultsContainer.classList.add('d-none');
            }
        });

        container.appendChild(searchBox);
        return searchBox;
    }

    displaySearchResults(container, results, options) {
        if (results.length === 0) {
            container.innerHTML = '<div class="p-3 text-muted">Nenhum resultado encontrado</div>';
            container.classList.remove('d-none');
            return;
        }

        container.innerHTML = results.map(result => {
            if (options.renderResult) {
                return options.renderResult(result);
            }
            return `<div class="p-2 border-bottom search-result-item" data-value="${result.id}">${result.name}</div>`;
        }).join('');

        // Add click handlers to results
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                if (options.onSelect) {
                    const value = item.getAttribute('data-value');
                    const result = results.find(r => r.id == value);
                    options.onSelect(result);
                }
                container.classList.add('d-none');
            });
        });

        container.classList.remove('d-none');
    }

    // Initialize Tooltips and Popovers
    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    initializePopovers() {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }

    initializeModals() {
        // Initialize any existing modals
        const existingModals = document.querySelectorAll('.modal');
        existingModals.forEach(modalElement => {
            const modalId = modalElement.id;
            if (modalId && !this.modals.has(modalId)) {
                const modal = new bootstrap.Modal(modalElement);
                this.modals.set(modalId, modal);
            }
        });
    }

    // Utility methods
    formatDate(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('HH', hours)
            .replace('mm', minutes);
    }

    formatCurrency(amount, currency = 'AOA') {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('pt-AO').format(number);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize global components instance
window.MAPTSSComponents = new MAPTSSComponents();