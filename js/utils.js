// MAPTSS Digital+ Utility Functions
// Helper functions and utilities

// Date and Time Utilities
const DateUtils = {
    formatDate(date, format = 'dd/mm/yyyy') {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        switch(format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'dd de mmm de yyyy':
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                              'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                return `${day} de ${months[d.getMonth()]} de ${year}`;
            default:
                return d.toLocaleDateString('pt-AO');
        }
    },

    formatTime(date, format = '24h') {
        const d = new Date(date);
        
        if (format === '12h') {
            return d.toLocaleTimeString('pt-AO', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        return d.toLocaleTimeString('pt-AO', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `Há ${days} dia${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else {
            return 'Agora mesmo';
        }
    },

    isBusinessDay(date) {
        const d = new Date(date);
        const day = d.getDay();
        return day >= 1 && day <= 5; // Monday to Friday
    },

    addBusinessDays(date, days) {
        const result = new Date(date);
        let addedDays = 0;
        
        while (addedDays < days) {
            result.setDate(result.getDate() + 1);
            if (this.isBusinessDay(result)) {
                addedDays++;
            }
        }
        
        return result;
    }
};

// String Utilities
const StringUtils = {
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    slugify(str) {
        return this.removeAccents(str)
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    },

    truncate(str, length, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },

    maskBI(bi) {
        // Mask Bilhete de Identidade: 000000000LA000
        if (!bi || bi.length < 13) return bi;
        return bi.substring(0, 3) + '***' + bi.substring(6, 8) + '***' + bi.substring(11);
    },

    maskPhone(phone) {
        // Mask phone number: +244 9** *** ***
        if (!phone || phone.length < 9) return phone;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('244')) {
            return '+244 9** *** ***';
        }
        return '9** *** ***';
    },

    formatBI(bi) {
        // Format BI: 000000000LA000
        const cleaned = bi.replace(/\D/g, '');
        if (cleaned.length >= 11) {
            return cleaned.substring(0, 9) + 'LA' + cleaned.substring(9, 12);
        }
        return bi;
    },

    formatPhone(phone) {
        // Format phone: +244 900 000 000
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('244') && cleaned.length === 12) {
            return `+244 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
        } else if (cleaned.length === 9) {
            return `+244 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
        }
        return phone;
    }
};

// Validation Utilities
const ValidationUtils = {
    isValidBI(bi) {
        // Validate Angolan BI format: 000000000LA000
        const pattern = /^\d{9}[A-Z]{2}\d{3}$/;
        return pattern.test(bi.replace(/\s/g, ''));
    },

    isValidPhone(phone) {
        // Validate Angolan phone numbers
        const cleaned = phone.replace(/\D/g, '');
        return (cleaned.startsWith('244') && cleaned.length === 12) ||
               (cleaned.startsWith('9') && cleaned.length === 9);
    },

    isValidEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    },

    isValidNIF(nif) {
        // Validate Angolan NIF (Número de Identificação Fiscal)
        const cleaned = nif.replace(/\D/g, '');
        return cleaned.length === 9 || cleaned.length === 10;
    },

    passwordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^A-Za-z0-9]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        let strength = 'Muito Fraca';
        if (score >= 4) strength = 'Forte';
        else if (score >= 3) strength = 'Média';
        else if (score >= 2) strength = 'Fraca';

        return { score, strength, checks };
    }
};

// File Utilities
const FileUtils = {
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        return imageExtensions.includes(this.getFileExtension(filename).toLowerCase());
    },

    isPDFFile(filename) {
        return this.getFileExtension(filename).toLowerCase() === 'pdf';
    },

    validateFileType(file, allowedTypes) {
        const extension = this.getFileExtension(file.name).toLowerCase();
        return allowedTypes.includes(extension);
    },

    validateFileSize(file, maxSizeMB) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    },

    compressImage(file, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
};

// Location Utilities
const LocationUtils = {
    provinces: [
        'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
        'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
        'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
        'Namibe', 'Uíge', 'Zaire'
    ],

    municipalities: {
        'Luanda': ['Luanda', 'Belas', 'Cacuaco', 'Cazenga', 'Icolo e Bengo', 'Kissama', 'Quiçama', 'Viana'],
        'Benguela': ['Benguela', 'Baía Farta', 'Bocoio', 'Caimbambo', 'Catumbela', 'Chongoroi', 'Cubal', 'Ganda', 'Lobito'],
        // Add more as needed
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    toRad(value) {
        return value * Math.PI / 180;
    },

    formatDistance(km) {
        if (km < 1) {
            return Math.round(km * 1000) + ' m';
        }
        return km.toFixed(1) + ' km';
    },

    getProvinceFromCoordinates(lat, lng) {
        // Simplified mapping - in real implementation, use proper geocoding
        if (lat >= -9.5 && lat <= -8.5 && lng >= 12.5 && lng <= 14.5) {
            return 'Luanda';
        }
        // Add more mappings as needed
        return 'Unknown';
    }
};

// Storage Utilities
const StorageUtils = {
    set(key, value, expires = null) {
        const item = {
            value: value,
            expires: expires ? Date.now() + expires : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;

        try {
            const parsed = JSON.parse(item);
            
            if (parsed.expires && Date.now() > parsed.expires) {
                localStorage.removeItem(key);
                return null;
            }
            
            return parsed.value;
        } catch (e) {
            localStorage.removeItem(key);
            return null;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    setSession(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },

    getSession(key) {
        const item = sessionStorage.getItem(key);
        try {
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    },

    removeSession(key) {
        sessionStorage.removeItem(key);
    }
};

// Network Utilities
const NetworkUtils = {
    isOnline() {
        return navigator.onLine;
    },

    onNetworkChange(callback) {
        window.addEventListener('online', () => callback(true));
        window.addEventListener('offline', () => callback(false));
    },

    async checkConnectivity() {
        try {
            const response = await fetch('/ping', { 
                method: 'GET',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    retryRequest(fn, retries = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            fn()
                .then(resolve)
                .catch(error => {
                    if (retries > 0) {
                        setTimeout(() => {
                            this.retryRequest(fn, retries - 1, delay * 2)
                                .then(resolve)
                                .catch(reject);
                        }, delay);
                    } else {
                        reject(error);
                    }
                });
        });
    }
};

// Form Utilities
const FormUtils = {
    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    },

    populateForm(form, data) {
        Object.keys(data).forEach(key => {
            const element = form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = Boolean(data[key]);
                } else if (element.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = data[key];
                }
            }
        });
    },

    resetFormValidation(form) {
        form.classList.remove('was-validated');
        const inputs = form.querySelectorAll('.is-invalid, .is-valid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
    },

    validateForm(form) {
        const data = this.serializeForm(form);
        const errors = {};

        // Example validations
        if (data.email && !ValidationUtils.isValidEmail(data.email)) {
            errors.email = 'Email inválido';
        }

        if (data.bi && !ValidationUtils.isValidBI(data.bi)) {
            errors.bi = 'BI inválido';
        }

        if (data.phone && !ValidationUtils.isValidPhone(data.phone)) {
            errors.phone = 'Telefone inválido';
        }

        return { isValid: Object.keys(errors).length === 0, errors, data };
    }
};

// URL Utilities
const URLUtils = {
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },

    removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    },

    buildURL(base, params) {
        const url = new URL(base);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.set(key, params[key]);
            }
        });
        return url.toString();
    }
};

// Export utilities
window.Utils = {
    DateUtils,
    StringUtils,
    ValidationUtils,
    FileUtils,
    LocationUtils,
    StorageUtils,
    NetworkUtils,
    FormUtils,
    URLUtils
};

// Global helper functions
window.formatDate = DateUtils.formatDate;
window.formatTime = DateUtils.formatTime;
window.validateBI = ValidationUtils.isValidBI;
window.validatePhone = ValidationUtils.isValidPhone;
window.formatFileSize = FileUtils.formatFileSize;