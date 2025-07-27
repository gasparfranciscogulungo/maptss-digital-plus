// Bootstrap-like JavaScript functionality for MAPTSS Digital+
// Essential interactive components

// Navbar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Dropdown functionality
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownToggles.forEach(toggle => {
        const dropdownMenu = toggle.nextElementSibling;
        
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            dropdownMenu.classList.toggle('show');
        });
        
        // Close on outside click
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
    });

    // Accordion functionality
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = document.querySelector(this.getAttribute('data-bs-target'));
            const isCollapsed = this.classList.contains('collapsed');
            
            // Close all other accordion items in the same accordion
            const accordion = this.closest('.accordion');
            if (accordion) {
                accordion.querySelectorAll('.accordion-button').forEach(btn => {
                    if (btn !== this) {
                        btn.classList.add('collapsed');
                        const otherTarget = document.querySelector(btn.getAttribute('data-bs-target'));
                        if (otherTarget) {
                            otherTarget.classList.remove('show');
                        }
                    }
                });
            }
            
            // Toggle current item
            if (isCollapsed) {
                this.classList.remove('collapsed');
                target.classList.add('show');
            } else {
                this.classList.add('collapsed');
                target.classList.remove('show');
            }
        });
    });

    // Modal functionality (basic)
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSelector = this.getAttribute('data-bs-target');
            const modal = document.querySelector(targetSelector);
            
            if (modal) {
                showModal(modal);
            }
        });
    });

    // Close modal functionality
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        });
    });

    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this);
            }
        });
    });
});

// Modal functions
function showModal(modal) {
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.style.paddingRight = '0px';
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1040;
        width: 100vw;
        height: 100vh;
        background-color: #000;
        opacity: 0.5;
    `;
    document.body.appendChild(backdrop);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    modal.setAttribute('tabindex', '-1');
    modal.focus();
    
    // Trigger shown event
    const event = new CustomEvent('shown.bs.modal');
    modal.dispatchEvent(event);
}

function hideModal(modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    
    // Remove backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Trigger hidden event
    const event = new CustomEvent('hidden.bs.modal');
    modal.dispatchEvent(event);
}

// Tooltip functionality (basic)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(element => {
        const title = element.getAttribute('title') || element.getAttribute('data-bs-title');
        
        element.addEventListener('mouseenter', function() {
            showTooltip(this, title);
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip(this);
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-custom';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        z-index: 1070;
        display: block;
        margin: 0;
        font-size: 0.875rem;
        word-wrap: break-word;
        opacity: 0.9;
        background-color: #000;
        color: #fff;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        pointer-events: none;
        max-width: 200px;
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
    tooltip.style.top = (rect.top - tooltipRect.height - 5) + 'px';
    
    element._tooltip = tooltip;
}

function hideTooltip(element) {
    if (element._tooltip) {
        element._tooltip.remove();
        element._tooltip = null;
    }
}

// Alert functionality
function createAlert(message, type = 'info', dismissible = true) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}${dismissible ? ' alert-dismissible' : ''}`;
    alert.style.cssText = `
        position: relative;
        padding: 0.75rem 1.25rem;
        margin-bottom: 1rem;
        border: 1px solid transparent;
        border-radius: 0.25rem;
    `;
    
    // Set colors based on type
    const colors = {
        primary: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
        secondary: { bg: '#e2e3e5', border: '#d6d8db', text: '#383d41' },
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
        danger: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
        info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
    };
    
    const colorSet = colors[type] || colors.info;
    alert.style.backgroundColor = colorSet.bg;
    alert.style.borderColor = colorSet.border;
    alert.style.color = colorSet.text;
    
    alert.innerHTML = message;
    
    if (dismissible) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            z-index: 2;
            padding: 0.75rem 1.25rem;
            background: transparent;
            border: 0;
            cursor: pointer;
        `;
        closeBtn.innerHTML = '×';
        closeBtn.style.fontSize = '1.5rem';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.lineHeight = '1';
        closeBtn.style.color = colorSet.text;
        closeBtn.style.opacity = '0.5';
        
        closeBtn.addEventListener('click', function() {
            alert.remove();
        });
        
        alert.appendChild(closeBtn);
    }
    
    return alert;
}

// Progress bar animation
function animateProgressBar(progressBar, targetPercentage, duration = 1000) {
    const startPercentage = parseInt(progressBar.style.width) || 0;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentPercentage = startPercentage + (targetPercentage - startPercentage) * progress;
        progressBar.style.width = currentPercentage + '%';
        progressBar.textContent = Math.round(currentPercentage) + '%';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            const headerOffset = 80; // Account for fixed navbar
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Initialize tooltips when DOM is ready
document.addEventListener('DOMContentLoaded', initializeTooltips);

// Export functions for global use
window.bootstrap = {
    Modal: {
        getInstance: function(element) {
            return {
                show: function() { showModal(element); },
                hide: function() { hideModal(element); }
            };
        }
    },
    Tooltip: {
        getInstance: function(element) {
            return {
                show: function() { 
                    const title = element.getAttribute('title') || element.getAttribute('data-bs-title');
                    showTooltip(element, title); 
                },
                hide: function() { hideTooltip(element); }
            };
        }
    }
};