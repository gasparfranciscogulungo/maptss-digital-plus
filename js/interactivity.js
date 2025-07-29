/**
 * MAPTSS Digital+ Enhanced Interactivity
 * Additional features for improved user experience
 */

// Enhanced dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Simulate real-time updates for citizen dashboard
    if (document.querySelector('.dashboard-stats')) {
        updateDashboardStats();
        setInterval(updateDashboardStats, 30000); // Update every 30 seconds
    }

    // Enhanced form validation
    const inscricaoForm = document.getElementById('inscricaoForm');
    if (inscricaoForm) {
        setupFormValidation(inscricaoForm);
    }

    // Location services
    const locationBtn = document.getElementById('getCurrentLocationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', updateUserLocation);
    }

    // Notification system
    initNotificationSystem();
    
    // Search functionality
    initSearchFeatures();
});

/**
 * Update dashboard statistics with simulated real-time data
 */
function updateDashboardStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        // Add subtle animation to indicate real-time updates
        stat.style.transform = 'scale(1.05)';
        setTimeout(() => {
            stat.style.transform = 'scale(1)';
        }, 200);
    });
}

/**
 * Enhanced form validation with Portuguese messages
 */
function setupFormValidation(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const requiredFields = form.querySelectorAll('[required]');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                errors.push(`${field.placeholder || field.name} é obrigatório`);
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            showSuccessMessage('Inscrição submetida com sucesso!');
            form.reset();
        } else {
            showErrorMessage('Por favor, preencha todos os campos obrigatórios.');
        }
    });
}

/**
 * GPS location services
 */
function updateUserLocation() {
    const btn = document.getElementById('getCurrentLocationBtn');
    const originalText = btn.textContent;
    
    btn.textContent = 'Obtendo localização...';
    btn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Simulate updating nearby centers
                updateNearbyCenters(lat, lon);
                
                btn.textContent = 'Localização Atualizada ✓';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            },
            function(error) {
                console.error('Erro ao obter localização:', error);
                btn.textContent = 'Erro na localização';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        );
    } else {
        btn.textContent = 'GPS não disponível';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

/**
 * Update nearby centers based on location
 */
function updateNearbyCenters(lat, lon) {
    // Simulate finding nearby centers
    const centrosContainer = document.querySelector('.centros-proximos');
    if (centrosContainer) {
        const centers = [
            { name: 'Centro INEFOP Luanda', distance: '1.2 km', vagas: 18 },
            { name: 'Centro Técnico Maianga', distance: '3.8 km', vagas: 12 },
            { name: 'Instituto Médio Industrial', distance: '5.1 km', vagas: 8 }
        ];
        
        // Update the display with animation
        centrosContainer.style.opacity = '0.5';
        setTimeout(() => {
            // Update content here
            centrosContainer.style.opacity = '1';
        }, 500);
    }
}

/**
 * Notification system initialization
 */
function initNotificationSystem() {
    // Simulate new notifications
    setTimeout(() => {
        addNotification('Nova vaga disponível em Informática Básica', 'info');
    }, 5000);
    
    setTimeout(() => {
        addNotification('Documentos aprovados para Soldadura', 'success');
    }, 15000);
}

/**
 * Add notification to the system
 */
function addNotification(message, type = 'info') {
    const notificationArea = document.querySelector('.notifications-area');
    if (!notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        <strong>${type === 'success' ? 'Sucesso!' : 'Nova notificação:'}</strong> ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    notificationArea.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Initialize search features
 */
function initSearchFeatures() {
    const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const targetContainer = e.target.getAttribute('data-target');
            
            if (targetContainer) {
                filterItems(targetContainer, query);
            }
        });
    });
}

/**
 * Filter items based on search query
 */
function filterItems(containerSelector, query) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const items = container.querySelectorAll('.filterable-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Export functions for global use
window.MAPTSSInteractivity = {
    updateDashboardStats,
    updateUserLocation,
    addNotification,
    showSuccessMessage,
    showErrorMessage
};