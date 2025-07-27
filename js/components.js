// MAPTSS Digital+ Components
// Reusable UI components and widgets

// Timeline Component
class Timeline {
    constructor(container, items) {
        this.container = container;
        this.items = items;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.items.forEach((item, index) => {
            const timelineItem = this.createTimelineItem(item, index);
            this.container.appendChild(timelineItem);
        });
    }

    createTimelineItem(item, index) {
        const div = document.createElement('div');
        div.className = 'timeline-item fade-in-up';
        div.style.animationDelay = `${index * 0.1}s`;
        
        div.innerHTML = `
            <div class="timeline-marker bg-${item.status}"></div>
            <div class="timeline-content">
                <h6 class="fw-bold">${item.title}</h6>
                <p class="text-muted mb-1">${item.description}</p>
                <small class="text-muted">${item.date}</small>
            </div>
        `;
        
        return div;
    }

    addItem(item) {
        this.items.unshift(item);
        this.render();
    }
}

// Center Card Component
class CenterCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        const div = document.createElement('div');
        div.className = 'col-lg-6 card-entrance';
        
        div.innerHTML = `
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="fw-bold">${this.data.name}</h5>
                        <span class="badge ${this.getDistanceBadgeClass()}">${this.data.distance}</span>
                    </div>
                    <p class="text-muted mb-3">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        ${this.data.address}
                    </p>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <small class="text-muted">Cursos Disponíveis:</small>
                            <p class="fw-semibold mb-0">${this.data.courses}</p>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Vagas Abertas:</small>
                            <p class="fw-semibold mb-0 ${this.getVacancyClass()}">${this.data.vacancies}</p>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning btn-sm flex-fill" onclick="viewCenterCourses('${this.data.id}')">
                            <i class="fas fa-eye me-1"></i>Ver Cursos
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="getDirections('${this.data.id}')">
                            <i class="fas fa-route"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="contactCenter('${this.data.id}')">
                            <i class="fas fa-phone"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }

    getDistanceBadgeClass() {
        const distance = parseFloat(this.data.distance);
        if (distance < 3) return 'bg-success';
        if (distance < 8) return 'bg-warning text-dark';
        return 'bg-secondary';
    }

    getVacancyClass() {
        const vacancies = parseInt(this.data.vacancies);
        if (vacancies > 20) return 'text-success';
        if (vacancies > 5) return 'text-warning';
        return 'text-danger';
    }
}

// Course Card Component
class CourseCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        const div = document.createElement('div');
        div.className = 'col-lg-4 col-md-6 card-entrance';
        
        div.innerHTML = `
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="bg-${this.data.category.color} rounded p-2">
                            <i class="fas fa-${this.data.category.icon} text-white"></i>
                        </div>
                        <span class="badge ${this.getStatusBadgeClass()}">${this.data.status}</span>
                    </div>
                    <h5 class="fw-bold mb-2">${this.data.title}</h5>
                    <p class="text-muted mb-3">${this.data.description}</p>
                    <div class="mb-3">
                        <small class="text-muted d-block">Duração: ${this.data.duration}</small>
                        <small class="text-muted d-block">Modalidade: ${this.data.mode}</small>
                        <small class="text-muted d-block">Centro: ${this.data.center}</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-success">${this.data.price}</span>
                        <button class="btn btn-warning btn-sm" onclick="enrollCourse('${this.data.id}')">
                            <i class="fas fa-plus me-1"></i>Inscrever
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }

    getStatusBadgeClass() {
        switch(this.data.status.toLowerCase()) {
            case 'vagas abertas':
                return 'bg-success';
            case 'poucas vagas':
                return 'bg-warning text-dark';
            case 'lista de espera':
                return 'bg-secondary';
            default:
                return 'bg-info';
        }
    }
}

// Notification Component
class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notificationCenter';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto dismiss
        setTimeout(() => {
            this.dismiss(notification);
        }, duration);
        
        return notification;
    }

    createNotification(message, type) {
        const div = document.createElement('div');
        div.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible notification-slide-in mb-2`;
        div.style.cssText = `
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border: none;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getIcon(type)} me-2"></i>
                <span class="flex-grow-1">${message}</span>
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
        `;
        
        // Add dismiss functionality
        div.querySelector('.btn-close').addEventListener('click', () => {
            this.dismiss(div);
        });
        
        return div;
    }

    getIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    dismiss(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Progress Bar Component
class ProgressBar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            value: 0,
            max: 100,
            animated: true,
            striped: false,
            color: 'primary',
            showPercentage: true,
            ...options
        };
        this.render();
    }

    render() {
        const percentage = (this.options.value / this.options.max) * 100;
        
        this.container.innerHTML = `
            <div class="progress" style="height: 20px;">
                <div class="progress-bar ${this.options.animated ? 'progress-bar-animated' : ''} 
                     ${this.options.striped ? 'progress-bar-striped' : ''} bg-${this.options.color}"
                     role="progressbar" style="width: ${percentage}%"
                     aria-valuenow="${this.options.value}" 
                     aria-valuemin="0" 
                     aria-valuemax="${this.options.max}">
                    ${this.options.showPercentage ? Math.round(percentage) + '%' : ''}
                </div>
            </div>
        `;
    }

    setValue(value) {
        this.options.value = Math.max(0, Math.min(this.options.max, value));
        this.render();
    }

    animateToValue(targetValue, duration = 1000) {
        const startValue = this.options.value;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = startValue + (targetValue - startValue) * progress;
            this.setValue(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
}

// Data Table Component
class DataTable {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            data: [],
            columns: [],
            searchable: true,
            sortable: true,
            pagination: true,
            pageSize: 10,
            ...options
        };
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        if (this.options.searchable) {
            this.renderSearch();
        }
        
        this.renderTable();
        
        if (this.options.pagination) {
            this.renderPagination();
        }
    }

    renderSearch() {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'mb-3';
        searchDiv.innerHTML = `
            <div class="input-group">
                <span class="input-group-text">
                    <i class="fas fa-search"></i>
                </span>
                <input type="text" class="form-control" placeholder="Pesquisar..." id="tableSearch">
            </div>
        `;
        
        this.container.appendChild(searchDiv);
        
        const searchInput = searchDiv.querySelector('#tableSearch');
        searchInput.addEventListener('input', MAPTSS.debounce((e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.renderTable();
            if (this.options.pagination) {
                this.renderPagination();
            }
        }, 300));
    }

    renderTable() {
        const filteredData = this.getFilteredData();
        const paginatedData = this.getPaginatedData(filteredData);
        
        const table = document.createElement('table');
        table.className = 'table table-striped table-hover';
        
        // Header
        const thead = document.createElement('thead');
        thead.className = 'table-dark';
        const headerRow = document.createElement('tr');
        
        this.options.columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.header;
            
            if (this.options.sortable && column.sortable !== false) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => {
                    this.sort(column.field);
                });
                
                if (this.sortColumn === column.field) {
                    const icon = document.createElement('i');
                    icon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'} ms-2`;
                    th.appendChild(icon);
                }
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        paginatedData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.className = 'fade-in-up';
            tr.style.animationDelay = `${index * 0.05}s`;
            
            this.options.columns.forEach(column => {
                const td = document.createElement('td');
                
                if (column.render) {
                    td.innerHTML = column.render(row[column.field], row, index);
                } else {
                    td.textContent = row[column.field] || '';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Replace existing table
        const existingTable = this.container.querySelector('.table-container');
        if (existingTable) {
            existingTable.remove();
        }
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container table-responsive';
        tableContainer.appendChild(table);
        
        this.container.appendChild(tableContainer);
    }

    renderPagination() {
        const filteredData = this.getFilteredData();
        const totalPages = Math.ceil(filteredData.length / this.options.pageSize);
        
        if (totalPages <= 1) return;
        
        const existingPagination = this.container.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container d-flex justify-content-between align-items-center mt-3';
        
        // Info
        const info = document.createElement('div');
        const start = (this.currentPage - 1) * this.options.pageSize + 1;
        const end = Math.min(this.currentPage * this.options.pageSize, filteredData.length);
        info.textContent = `Mostrando ${start}-${end} de ${filteredData.length} registos`;
        info.className = 'text-muted';
        
        // Pagination
        const pagination = document.createElement('nav');
        const paginationList = document.createElement('ul');
        paginationList.className = 'pagination mb-0';
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        if (this.currentPage > 1) {
            prevLi.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage--;
                this.renderTable();
                this.renderPagination();
            });
        }
        paginationList.appendChild(prevLi);
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            
            if (i !== this.currentPage) {
                li.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentPage = i;
                    this.renderTable();
                    this.renderPagination();
                });
            }
            
            paginationList.appendChild(li);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Próximo</a>`;
        if (this.currentPage < totalPages) {
            nextLi.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage++;
                this.renderTable();
                this.renderPagination();
            });
        }
        paginationList.appendChild(nextLi);
        
        pagination.appendChild(paginationList);
        
        paginationContainer.appendChild(info);
        paginationContainer.appendChild(pagination);
        
        this.container.appendChild(paginationContainer);
    }

    getFilteredData() {
        if (!this.searchTerm) return this.options.data;
        
        return this.options.data.filter(row => {
            return this.options.columns.some(column => {
                const value = row[column.field];
                return value && value.toString().toLowerCase().includes(this.searchTerm);
            });
        });
    }

    getPaginatedData(data) {
        if (!this.options.pagination) return data;
        
        const start = (this.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        
        return data.slice(start, end);
    }

    sort(field) {
        if (this.sortColumn === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = field;
            this.sortDirection = 'asc';
        }
        
        this.options.data.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            if (aVal === bVal) return 0;
            
            const comparison = aVal < bVal ? -1 : 1;
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        
        this.renderTable();
        if (this.options.pagination) {
            this.renderPagination();
        }
    }

    updateData(newData) {
        this.options.data = newData;
        this.currentPage = 1;
        this.render();
    }
}

// Chart Component (Simple Bar Chart)
class SimpleChart {
    constructor(container, data, options = {}) {
        this.container = container;
        this.data = data;
        this.options = {
            type: 'bar',
            height: 300,
            colors: ['#CE1126', '#FFCD00', '#0D1B2A'],
            ...options
        };
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.container.style.height = this.options.height + 'px';
        this.container.style.position = 'relative';
        
        if (this.options.type === 'bar') {
            this.renderBarChart();
        }
    }

    renderBarChart() {
        const maxValue = Math.max(...this.data.map(item => item.value));
        
        this.data.forEach((item, index) => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                position: absolute;
                bottom: 30px;
                left: ${(index * 100) / this.data.length}%;
                width: ${80 / this.data.length}%;
                height: ${(item.value / maxValue) * (this.options.height - 60)}px;
                background: ${this.options.colors[index % this.options.colors.length]};
                border-radius: 4px 4px 0 0;
                transition: all 0.3s ease;
                cursor: pointer;
            `;
            
            bar.addEventListener('mouseenter', function() {
                this.style.opacity = '0.8';
                this.style.transform = 'scale(1.05)';
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.opacity = '1';
                this.style.transform = 'scale(1)';
            });
            
            const label = document.createElement('div');
            label.style.cssText = `
                position: absolute;
                bottom: 0;
                left: ${(index * 100) / this.data.length + 5}%;
                width: ${80 / this.data.length}%;
                height: 25px;
                text-align: center;
                font-size: 12px;
                color: #666;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            label.textContent = item.label;
            
            const value = document.createElement('div');
            value.style.cssText = `
                position: absolute;
                bottom: ${(item.value / maxValue) * (this.options.height - 60) + 5}px;
                left: ${(index * 100) / this.data.length}%;
                width: ${80 / this.data.length}%;
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                color: #333;
            `;
            value.textContent = item.value;
            
            this.container.appendChild(bar);
            this.container.appendChild(label);
            this.container.appendChild(value);
        });
    }
}

// Export components
window.Components = {
    Timeline,
    CenterCard,
    CourseCard,
    NotificationCenter,
    ProgressBar,
    DataTable,
    SimpleChart
};

// Initialize global notification center
window.NotificationCenter = new NotificationCenter();