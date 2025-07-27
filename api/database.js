/**
 * MAPTSS Digital+ Database Layer
 * Advanced localStorage-based database simulation with indexing and relationships
 */

class MAPTSSDatabase {
    constructor() {
        this.prefix = 'maptss_';
        this.tables = {
            citizens: 'citizens',
            registrations: 'registrations',
            centers: 'centers',
            courses: 'courses',
            graduates: 'graduates',
            certificates: 'certificates',
            empregadores: 'empregadores',
            internships: 'internships',
            jobListings: 'job_listings',
            notifications: 'notifications',
            activities: 'activities',
            verifications: 'verifications'
        };
        
        this.initializeIndexes();
    }

    // Core storage methods
    async save(table, data) {
        const key = this.getTableKey(table);
        const existing = this.load(table) || [];
        
        // Update existing record or add new one
        const index = existing.findIndex(item => item.id === data.id);
        if (index >= 0) {
            existing[index] = { ...existing[index], ...data, updatedAt: new Date().toISOString() };
        } else {
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            existing.push(data);
        }
        
        localStorage.setItem(key, JSON.stringify(existing));
        this.updateIndexes(table, data);
        return data;
    }

    load(table) {
        const key = this.getTableKey(table);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    async findById(table, id) {
        const data = this.load(table);
        return data.find(item => item.id === id);
    }

    async findByField(table, field, value) {
        const data = this.load(table);
        return data.filter(item => item[field] === value);
    }

    async findWhere(table, predicate) {
        const data = this.load(table);
        return data.filter(predicate);
    }

    async delete(table, id) {
        const data = this.load(table);
        const filtered = data.filter(item => item.id !== id);
        const key = this.getTableKey(table);
        localStorage.setItem(key, JSON.stringify(filtered));
        return true;
    }

    // Citizens methods
    async saveCitizen(citizen) {
        return this.save(this.tables.citizens, citizen);
    }

    async getCitizen(id) {
        return this.findById(this.tables.citizens, id);
    }

    async getAllCitizens() {
        return this.load(this.tables.citizens);
    }

    async getCitizenByBI(bi) {
        const citizens = await this.findByField(this.tables.citizens, 'bi', bi);
        return citizens[0];
    }

    async getCitizenByEmail(email) {
        const citizens = await this.findByField(this.tables.citizens, 'email', email);
        return citizens[0];
    }

    // Registrations methods
    async saveRegistration(registration) {
        return this.save(this.tables.registrations, registration);
    }

    async updateRegistration(registration) {
        return this.save(this.tables.registrations, registration);
    }

    async getRegistration(id) {
        return this.findById(this.tables.registrations, id);
    }

    async getAllRegistrations() {
        return this.load(this.tables.registrations);
    }

    async getCitizenRegistrations(citizenId) {
        return this.findByField(this.tables.registrations, 'citizenId', citizenId);
    }

    async getRegistrationsByStatus(status) {
        return this.findByField(this.tables.registrations, 'status', status);
    }

    async getRegistrationsByCenter(centerId) {
        return this.findByField(this.tables.registrations, 'centerId', centerId);
    }

    async getRegistrationsByCourse(courseId) {
        return this.findByField(this.tables.registrations, 'courseId', courseId);
    }

    // Centers methods
    async saveCenter(center) {
        return this.save(this.tables.centers, center);
    }

    async getCenter(id) {
        return this.findById(this.tables.centers, id);
    }

    async getAllCenters() {
        return this.load(this.tables.centers);
    }

    async getCentersByProvince(province) {
        return this.findByField(this.tables.centers, 'province', province);
    }

    async getNearbyCenters(userLocation, radiusKm = 50) {
        const centers = await this.getAllCenters();
        return centers.filter(center => {
            if (!center.location) return false;
            const distance = this.calculateDistance(
                userLocation.latitude, 
                userLocation.longitude,
                center.location.latitude, 
                center.location.longitude
            );
            return distance <= radiusKm;
        });
    }

    // Courses methods
    async saveCourse(course) {
        return this.save(this.tables.courses, course);
    }

    async getCourse(id) {
        return this.findById(this.tables.courses, id);
    }

    async getAllCourses() {
        return this.load(this.tables.courses);
    }

    async getCoursesByCenter(centerId) {
        return this.findByField(this.tables.courses, 'centerId', centerId);
    }

    async getCoursesByArea(area) {
        return this.findByField(this.tables.courses, 'area', area);
    }

    // Graduates methods
    async saveGraduate(graduate) {
        return this.save(this.tables.graduates, graduate);
    }

    async getGraduate(id) {
        return this.findById(this.tables.graduates, id);
    }

    async getCertifiedGraduates() {
        return this.findWhere(this.tables.graduates, graduate => graduate.verified === true);
    }

    async getGraduatesByCompetency(area) {
        return this.findWhere(this.tables.graduates, graduate => 
            graduate.competencies.some(comp => comp.area === area)
        );
    }

    async getGraduatesByLocation(location) {
        return this.findByField(this.tables.graduates, 'location', location);
    }

    // Certificates methods
    async saveCertificate(certificate) {
        return this.save(this.tables.certificates, certificate);
    }

    async getCertificate(code) {
        const certificates = await this.findByField(this.tables.certificates, 'code', code);
        return certificates[0];
    }

    async getCertificatesByStudent(studentId) {
        return this.findByField(this.tables.certificates, 'studentId', studentId);
    }

    // Empregadores methods
    async saveEmpregador(empregador) {
        return this.save(this.tables.empregadores, empregador);
    }

    async getEmpregador(id) {
        return this.findById(this.tables.empregadores, id);
    }

    async getAllEmpregadores() {
        return this.load(this.tables.empregadores);
    }

    // Internships methods
    async saveInternship(internship) {
        return this.save(this.tables.internships, internship);
    }

    async getInternship(id) {
        return this.findById(this.tables.internships, id);
    }

    async getEmpregadorInternships(empregadorId) {
        return this.findByField(this.tables.internships, 'empregadorId', empregadorId);
    }

    async getGraduateInternships(graduateId) {
        return this.findByField(this.tables.internships, 'graduateId', graduateId);
    }

    // Job Listings methods
    async saveJobListing(jobListing) {
        return this.save(this.tables.jobListings, jobListing);
    }

    async getJobListing(id) {
        return this.findById(this.tables.jobListings, id);
    }

    async getEmpregadorJobListings(empregadorId) {
        return this.findByField(this.tables.jobListings, 'empregadorId', empregadorId);
    }

    async getActiveJobListings() {
        return this.findByField(this.tables.jobListings, 'status', 'open');
    }

    // Notifications methods
    async saveNotification(notification) {
        return this.save(this.tables.notifications, notification);
    }

    async getUserNotifications(userId) {
        return this.findByField(this.tables.notifications, 'userId', userId);
    }

    async getUnreadNotifications(userId) {
        return this.findWhere(this.tables.notifications, 
            notification => notification.userId === userId && !notification.read
        );
    }

    async markNotificationRead(notificationId) {
        const notification = await this.findById(this.tables.notifications, notificationId);
        if (notification) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
            return this.save(this.tables.notifications, notification);
        }
        return null;
    }

    // Activities methods
    async saveActivity(activity) {
        return this.save(this.tables.activities, activity);
    }

    async getRecentActivities(limit = 20) {
        const activities = this.load(this.tables.activities);
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    async getActivitiesByUser(userId, limit = 10) {
        const activities = await this.findByField(this.tables.activities, 'userId', userId);
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    async getActivitiesByType(type) {
        return this.findByField(this.tables.activities, 'type', type);
    }

    // Verifications methods
    async saveVerification(verification) {
        return this.save(this.tables.verifications, verification);
    }

    async getVerificationCount(empregadorId) {
        const verifications = await this.findByField(this.tables.verifications, 'empregadorId', empregadorId);
        return verifications.length;
    }

    async getVerificationsByEmpregador(empregadorId) {
        return this.findByField(this.tables.verifications, 'empregadorId', empregadorId);
    }

    // Utility methods
    getTableKey(table) {
        return this.prefix + table;
    }

    initializeIndexes() {
        // Initialize search indexes for better performance
        this.indexes = {
            citizens_by_bi: this.getTableKey('idx_citizens_bi'),
            citizens_by_email: this.getTableKey('idx_citizens_email'),
            registrations_by_citizen: this.getTableKey('idx_reg_citizen'),
            registrations_by_status: this.getTableKey('idx_reg_status'),
            centers_by_province: this.getTableKey('idx_centers_province'),
            graduates_by_competency: this.getTableKey('idx_grad_competency')
        };
    }

    updateIndexes(table, data) {
        // Update search indexes when data changes
        switch (table) {
            case this.tables.citizens:
                this.updateCitizenIndexes(data);
                break;
            case this.tables.registrations:
                this.updateRegistrationIndexes(data);
                break;
            case this.tables.centers:
                this.updateCenterIndexes(data);
                break;
            case this.tables.graduates:
                this.updateGraduateIndexes(data);
                break;
        }
    }

    updateCitizenIndexes(citizen) {
        // Index by BI
        const biIndex = JSON.parse(localStorage.getItem(this.indexes.citizens_by_bi) || '{}');
        biIndex[citizen.bi] = citizen.id;
        localStorage.setItem(this.indexes.citizens_by_bi, JSON.stringify(biIndex));

        // Index by email
        const emailIndex = JSON.parse(localStorage.getItem(this.indexes.citizens_by_email) || '{}');
        emailIndex[citizen.email] = citizen.id;
        localStorage.setItem(this.indexes.citizens_by_email, JSON.stringify(emailIndex));
    }

    updateRegistrationIndexes(registration) {
        // Index by citizen
        const citizenIndex = JSON.parse(localStorage.getItem(this.indexes.registrations_by_citizen) || '{}');
        if (!citizenIndex[registration.citizenId]) {
            citizenIndex[registration.citizenId] = [];
        }
        if (!citizenIndex[registration.citizenId].includes(registration.id)) {
            citizenIndex[registration.citizenId].push(registration.id);
        }
        localStorage.setItem(this.indexes.registrations_by_citizen, JSON.stringify(citizenIndex));

        // Index by status
        const statusIndex = JSON.parse(localStorage.getItem(this.indexes.registrations_by_status) || '{}');
        if (!statusIndex[registration.status]) {
            statusIndex[registration.status] = [];
        }
        if (!statusIndex[registration.status].includes(registration.id)) {
            statusIndex[registration.status].push(registration.id);
        }
        localStorage.setItem(this.indexes.registrations_by_status, JSON.stringify(statusIndex));
    }

    updateCenterIndexes(center) {
        // Index by province
        const provinceIndex = JSON.parse(localStorage.getItem(this.indexes.centers_by_province) || '{}');
        if (!provinceIndex[center.province]) {
            provinceIndex[center.province] = [];
        }
        if (!provinceIndex[center.province].includes(center.id)) {
            provinceIndex[center.province].push(center.id);
        }
        localStorage.setItem(this.indexes.centers_by_province, JSON.stringify(provinceIndex));
    }

    updateGraduateIndexes(graduate) {
        // Index by competency areas
        const competencyIndex = JSON.parse(localStorage.getItem(this.indexes.graduates_by_competency) || '{}');
        graduate.competencies.forEach(comp => {
            if (!competencyIndex[comp.area]) {
                competencyIndex[comp.area] = [];
            }
            if (!competencyIndex[comp.area].includes(graduate.id)) {
                competencyIndex[comp.area].push(graduate.id);
            }
        });
        localStorage.setItem(this.indexes.graduates_by_competency, JSON.stringify(competencyIndex));
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Backup and restore methods
    async exportData() {
        const data = {};
        Object.values(this.tables).forEach(table => {
            data[table] = this.load(table);
        });
        return data;
    }

    async importData(data) {
        Object.entries(data).forEach(([table, records]) => {
            const key = this.getTableKey(table);
            localStorage.setItem(key, JSON.stringify(records));
        });
        this.rebuildIndexes();
    }

    async clearAllData() {
        Object.values(this.tables).forEach(table => {
            const key = this.getTableKey(table);
            localStorage.removeItem(key);
        });
        this.clearIndexes();
    }

    clearIndexes() {
        Object.values(this.indexes).forEach(indexKey => {
            localStorage.removeItem(indexKey);
        });
    }

    rebuildIndexes() {
        this.clearIndexes();
        
        // Rebuild all indexes
        const citizens = this.load(this.tables.citizens);
        citizens.forEach(citizen => this.updateCitizenIndexes(citizen));

        const registrations = this.load(this.tables.registrations);
        registrations.forEach(registration => this.updateRegistrationIndexes(registration));

        const centers = this.load(this.tables.centers);
        centers.forEach(center => this.updateCenterIndexes(center));

        const graduates = this.load(this.tables.graduates);
        graduates.forEach(graduate => this.updateGraduateIndexes(graduate));
    }

    // Statistics methods
    async getTableStats() {
        const stats = {};
        Object.values(this.tables).forEach(table => {
            const data = this.load(table);
            stats[table] = {
                count: data.length,
                lastUpdated: data.length > 0 ? 
                    Math.max(...data.map(item => new Date(item.updatedAt || item.createdAt))) : null
            };
        });
        return stats;
    }

    async getStorageInfo() {
        let totalSize = 0;
        const tablesSizes = {};
        
        Object.values(this.tables).forEach(table => {
            const key = this.getTableKey(table);
            const data = localStorage.getItem(key);
            const size = data ? new Blob([data]).size : 0;
            tablesSizes[table] = size;
            totalSize += size;
        });

        return {
            totalSize,
            tablesSizes,
            availableSpace: this.getAvailableStorageSpace()
        };
    }

    getAvailableStorageSpace() {
        try {
            // Test localStorage capacity
            const testKey = 'test_capacity';
            const testData = 'x'.repeat(1024); // 1KB chunks
            let used = 0;
            
            try {
                while (true) {
                    localStorage.setItem(testKey + used, testData);
                    used++;
                    if (used > 10000) break; // Safety limit
                }
            } catch (e) {
                // Storage full
            }
            
            // Clean up test data
            for (let i = 0; i < used; i++) {
                localStorage.removeItem(testKey + i);
            }
            
            return used * 1024; // Return available space in bytes
        } catch (e) {
            return -1; // Unknown
        }
    }
}