// MAPTSS Digital+ Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeAnimations();
    initializeCounters();
    initializeScrollEffects();
    initializeFormValidation();
    initializeTooltips();
    initializeModals();
    
    console.log('MAPTSS Digital+ initialized successfully');
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - navbar.offsetHeight;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.style.background = 'rgba(13, 27, 42, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = 'rgba(13, 27, 42, 0.9)';
            navbar.style.backdropFilter = 'none';
        }
    });
    
    // Active navigation highlighting
    function updateActiveNav() {
        const scrollPosition = window.scrollY + navbar.offsetHeight + 50;
        
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const sectionTop = targetSection.offsetTop;
                const sectionBottom = sectionTop + targetSection.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call
}

// Animation effects
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // Stagger card animations
                if (entry.target.classList.contains('card-entrance')) {
                    const cards = entry.target.parentElement.querySelectorAll('.card-entrance');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.animationDelay = `${index * 0.1}s`;
                            card.classList.add('aos-animate');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-right, .fade-in-left, .slide-in-top, .slide-in-bottom, .zoom-in, .card-entrance');
    animatedElements.forEach(el => {
        el.classList.add('aos-init');
        observer.observe(el);
    });
    
    // Hero section entrance animation
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');
        
        if (heroContent) heroContent.classList.add('fade-in-up');
        if (heroImage) heroImage.classList.add('fade-in-right', 'delay-300');
    }, 200);
}

// Counter animations
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            counter.textContent = Math.floor(current).toLocaleString();
            
            if (current >= target) {
                clearInterval(timer);
                counter.textContent = target.toLocaleString();
            }
        }, 16);
    };
    
    // Intersection observer for counters
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                if (!counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    animateCounter(counter);
                }
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Scroll effects
function initializeScrollEffects() {
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Scroll reveal for elements
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.15 });
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
    
    // Scroll to top button
    createScrollToTopButton();
}

// Create scroll to top button
function createScrollToTopButton() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollTopBtn.className = 'scroll-to-top btn btn-warning position-fixed';
    scrollTopBtn.style.cssText = `
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: none;
        z-index: 9999;
        border: none;
        box-shadow: 0 4px 15px rgba(206, 17, 38, 0.3);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollTopBtn);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.style.display = 'block';
            setTimeout(() => {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.transform = 'scale(1)';
            }, 10);
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (scrollTopBtn.style.opacity === '0') {
                    scrollTopBtn.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // Scroll to top functionality
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effects
    scrollTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(206, 17, 38, 0.4)';
    });
    
    scrollTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(206, 17, 38, 0.3)';
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Add shake animation to invalid inputs
                const invalidInputs = form.querySelectorAll(':invalid');
                invalidInputs.forEach(input => {
                    input.classList.add('shake');
                    setTimeout(() => {
                        input.classList.remove('shake');
                    }, 500);
                });
                
                // Show error notification
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            } else {
                // Show success notification
                showNotification('Formulário enviado com sucesso!', 'success');
            }
            
            form.classList.add('was-validated');
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize modals
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function() {
            this.style.paddingLeft = '0';
        });
        
        modal.addEventListener('shown.bs.modal', function() {
            const autofocusElement = this.querySelector('[autofocus]');
            if (autofocusElement) {
                autofocusElement.focus();
            }
        });
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} notification-slide-in position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        border: none;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        dismissNotification(notification);
    }, 5000);
    
    // Manual dismiss
    notification.querySelector('.btn-close').addEventListener('click', () => {
        dismissNotification(notification);
    });
}

function dismissNotification(notification) {
    notification.classList.add('notification-slide-out');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 500);
}

// GPS Location functionality (for citizen panel)
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation não é suportada neste navegador'));
            return;
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        };
        
        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            error => {
                let message = 'Erro ao obter localização';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permissão de localização negada';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Localização indisponível';
                        break;
                    case error.TIMEOUT:
                        message = 'Timeout ao obter localização';
                        break;
                }
                reject(new Error(message));
            },
            options
        );
    });
}

// Loading state management
function showLoading(element, text = 'Carregando...') {
    const originalContent = element.innerHTML;
    element.setAttribute('data-original-content', originalContent);
    element.innerHTML = `
        <div class="d-flex align-items-center justify-content-center">
            <div class="loading-spinner me-2"></div>
            <span>${text}</span>
        </div>
    `;
    element.disabled = true;
}

function hideLoading(element) {
    const originalContent = element.getAttribute('data-original-content');
    if (originalContent) {
        element.innerHTML = originalContent;
        element.removeAttribute('data-original-content');
    }
    element.disabled = false;
}

// Performance optimization
function debounce(func, wait) {
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

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
initializeLazyLoading();

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for use in other scripts
window.MAPTSS = {
    showNotification,
    getCurrentLocation,
    showLoading,
    hideLoading,
    debounce
};