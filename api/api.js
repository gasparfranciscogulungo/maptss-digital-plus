/**
 * MAPTSS Digital+ API Layer
 * Simulated REST API for managing all platform data
 */

class MAPTSSApi {
    constructor() {
        this.baseUrl = '/api/v1';
        this.storage = new MAPTSSDatabase();
        this.auth = new MAPTSSAuth();
        
        // Initialize with sample data if empty
        this.initializeSampleData();
    }

    // Authentication endpoints
    async login(credentials) {
        return this.auth.login(credentials);
    }

    async logout() {
        return this.auth.logout();
    }

    async getCurrentUser() {
        return this.auth.getCurrentUser();
    }

    // Citizens API
    async getCitizenDashboard(citizenId) {
        const citizen = await this.storage.getCitizen(citizenId);
        const registrations = await this.storage.getCitizenRegistrations(citizenId);
        const nearbyCenters = await this.storage.getNearbyCenters(citizen.location);
        
        return {
            citizen,
            registrations,
            nearbyCenters,
            stats: {
                totalRegistrations: registrations.length,
                approvedRegistrations: registrations.filter(r => r.status === 'approved').length,
                pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
                nearbyCentersCount: nearbyCenters.length
            }
        };
    }

    async submitRegistration(registrationData) {
        const registration = {
            id: this.generateId(),
            ...registrationData,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            documentsStatus: this.analyzeDocuments(registrationData.documents)
        };
        
        await this.storage.saveRegistration(registration);
        
        // Send notification
        await this.sendNotification({
            userId: registrationData.citizenId,
            type: 'registration_submitted',
            message: 'Sua inscrição foi submetida com sucesso'
        });
        
        return registration;
    }

    // Gestor API
    async getGestorDashboard() {
        const registrations = await this.storage.getAllRegistrations();
        const centers = await this.storage.getAllCenters();
        const courses = await this.storage.getAllCourses();
        
        return {
            stats: {
                totalRegistrations: registrations.length,
                approvedRegistrations: registrations.filter(r => r.status === 'approved').length,
                pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
                rejectedRegistrations: registrations.filter(r => r.status === 'rejected').length,
                activeCenters: centers.filter(c => c.status === 'active').length,
                totalCenters: centers.length
            },
            recentActivity: await this.getRecentActivity(),
            monthlyStats: await this.getMonthlyRegistrationStats()
        };
    }

    async getRegistrationsForManagement(filters = {}) {
        let registrations = await this.storage.getAllRegistrations();
        
        // Apply filters
        if (filters.status) {
            registrations = registrations.filter(r => r.status === filters.status);
        }
        if (filters.course) {
            registrations = registrations.filter(r => r.courseId === filters.course);
        }
        if (filters.center) {
            registrations = registrations.filter(r => r.centerId === filters.center);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            registrations = registrations.filter(r => 
                r.citizenName.toLowerCase().includes(searchLower) ||
                r.citizenBI.includes(searchLower) ||
                r.citizenPhone.includes(searchLower)
            );
        }
        
        // Add citizen and course details
        const enrichedRegistrations = await Promise.all(
            registrations.map(async (registration) => {
                const citizen = await this.storage.getCitizen(registration.citizenId);
                const course = await this.storage.getCourse(registration.courseId);
                const center = await this.storage.getCenter(registration.centerId);
                
                return {
                    ...registration,
                    citizen,
                    course,
                    center
                };
            })
        );
        
        return enrichedRegistrations;
    }

    async approveRegistration(registrationId, gestorId) {
        const registration = await this.storage.getRegistration(registrationId);
        
        registration.status = 'approved';
        registration.approvedBy = gestorId;
        registration.approvedAt = new Date().toISOString();
        
        await this.storage.updateRegistration(registration);
        
        // Log activity
        await this.logActivity({
            type: 'registration_approved',
            userId: gestorId,
            targetId: registrationId,
            details: `Inscrição aprovada para ${registration.citizenName}`
        });
        
        // Send notification to citizen
        await this.sendNotification({
            userId: registration.citizenId,
            type: 'registration_approved',
            message: `Sua inscrição para ${registration.courseName} foi aprovada!`
        });
        
        return registration;
    }

    async rejectRegistration(registrationId, gestorId, reason) {
        const registration = await this.storage.getRegistration(registrationId);
        
        registration.status = 'rejected';
        registration.rejectedBy = gestorId;
        registration.rejectedAt = new Date().toISOString();
        registration.rejectionReason = reason;
        
        await this.storage.updateRegistration(registration);
        
        // Log activity
        await this.logActivity({
            type: 'registration_rejected',
            userId: gestorId,
            targetId: registrationId,
            details: `Inscrição rejeitada: ${reason}`
        });
        
        // Send notification to citizen
        await this.sendNotification({
            userId: registration.citizenId,
            type: 'registration_rejected',
            message: `Sua inscrição foi rejeitada. Motivo: ${reason}`
        });
        
        return registration;
    }

    // Empregador API
    async getEmpregadorDashboard(empregadorId) {
        const empregador = await this.storage.getEmpregador(empregadorId);
        const graduates = await this.storage.getCertifiedGraduates();
        const internships = await this.storage.getEmpregadorInternships(empregadorId);
        const jobListings = await this.storage.getEmpregadorJobListings(empregadorId);
        
        return {
            empregador,
            stats: {
                availableGraduates: graduates.length,
                activeInternships: internships.filter(i => i.status === 'active').length,
                openJobListings: jobListings.filter(j => j.status === 'open').length,
                certificatesVerified: await this.storage.getVerificationCount(empregadorId)
            },
            recentGraduates: graduates.slice(0, 10),
            recentActivity: await this.getEmpregadorRecentActivity(empregadorId)
        };
    }

    async searchGraduates(criteria) {
        let graduates = await this.storage.getCertifiedGraduates();
        
        // Apply search criteria
        if (criteria.competency) {
            graduates = graduates.filter(g => 
                g.competencies.some(c => c.area === criteria.competency)
            );
        }
        if (criteria.location) {
            graduates = graduates.filter(g => g.location === criteria.location);
        }
        if (criteria.experience) {
            graduates = graduates.filter(g => g.experienceLevel === criteria.experience);
        }
        if (criteria.age) {
            const [minAge, maxAge] = criteria.age.split('-').map(Number);
            graduates = graduates.filter(g => {
                const age = this.calculateAge(g.birthDate);
                return age >= minAge && age <= maxAge;
            });
        }
        if (criteria.name) {
            const searchLower = criteria.name.toLowerCase();
            graduates = graduates.filter(g => 
                g.name.toLowerCase().includes(searchLower)
            );
        }
        
        return graduates;
    }

    async verifyCertificate(certificateCode) {
        const certificate = await this.storage.getCertificate(certificateCode);
        
        if (!certificate) {
            return {
                valid: false,
                error: 'Certificado não encontrado'
            };
        }
        
        // Verify authenticity
        const isValid = this.validateCertificateSignature(certificate);
        
        if (!isValid) {
            return {
                valid: false,
                error: 'Certificado inválido ou falsificado'
            };
        }
        
        // Log verification
        await this.logActivity({
            type: 'certificate_verified',
            targetId: certificate.id,
            details: `Certificado verificado: ${certificate.code}`
        });
        
        return {
            valid: true,
            certificate: {
                ...certificate,
                verifiedAt: new Date().toISOString()
            }
        };
    }

    // Centers and Courses API
    async getCenters(filters = {}) {
        let centers = await this.storage.getAllCenters();
        
        if (filters.province) {
            centers = centers.filter(c => c.province === filters.province);
        }
        if (filters.status) {
            centers = centers.filter(c => c.status === filters.status);
        }
        
        return centers;
    }

    async getCourses(filters = {}) {
        let courses = await this.storage.getAllCourses();
        
        if (filters.area) {
            courses = courses.filter(c => c.area === filters.area);
        }
        if (filters.centerId) {
            courses = courses.filter(c => c.centerId === filters.centerId);
        }
        if (filters.duration) {
            courses = courses.filter(c => c.duration === filters.duration);
        }
        
        return courses;
    }

    async getNearbyCenters(userLocation, radiusKm = 50) {
        const centers = await this.storage.getAllCenters();
        
        return centers.filter(center => {
            const distance = this.calculateDistance(
                userLocation.latitude, 
                userLocation.longitude,
                center.location.latitude, 
                center.location.longitude
            );
            return distance <= radiusKm;
        }).sort((a, b) => {
            const distanceA = this.calculateDistance(
                userLocation.latitude, 
                userLocation.longitude,
                a.location.latitude, 
                a.location.longitude
            );
            const distanceB = this.calculateDistance(
                userLocation.latitude, 
                userLocation.longitude,
                b.location.latitude, 
                b.location.longitude
            );
            return distanceA - distanceB;
        });
    }

    // Reports API
    async generateReport(type, parameters) {
        switch (type) {
            case 'registrations_monthly':
                return this.generateRegistrationsReport(parameters);
            case 'centers_performance':
                return this.generateCentersPerformanceReport(parameters);
            case 'graduates_by_area':
                return this.generateGraduatesByAreaReport(parameters);
            default:
                throw new Error(`Report type ${type} not supported`);
        }
    }

    // Notifications API
    async getNotifications(userId) {
        return this.storage.getUserNotifications(userId);
    }

    async markNotificationRead(notificationId) {
        return this.storage.markNotificationRead(notificationId);
    }

    async sendNotification(notification) {
        const notificationData = {
            id: this.generateId(),
            ...notification,
            sentAt: new Date().toISOString(),
            read: false
        };
        
        await this.storage.saveNotification(notificationData);
        
        // In a real app, this would trigger push notifications, emails, SMS, etc.
        console.log('Notification sent:', notificationData);
        
        return notificationData;
    }

    // Utility methods
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
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

    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    analyzeDocuments(documents) {
        const requiredDocs = ['bi', 'certificate', 'photo', 'residence'];
        const submittedDocs = Object.keys(documents || {});
        
        return {
            total: requiredDocs.length,
            submitted: submittedDocs.length,
            missing: requiredDocs.filter(doc => !submittedDocs.includes(doc)),
            complete: submittedDocs.length === requiredDocs.length
        };
    }

    validateCertificateSignature(certificate) {
        // In a real system, this would verify cryptographic signatures
        // For simulation, we'll just check if the certificate has required fields
        return certificate.code && certificate.issuedAt && certificate.studentId;
    }

    async getRecentActivity() {
        const activities = await this.storage.getRecentActivities(20);
        return activities;
    }

    async getMonthlyRegistrationStats() {
        const registrations = await this.storage.getAllRegistrations();
        const stats = {};
        
        registrations.forEach(registration => {
            const month = new Date(registration.submittedAt).toISOString().slice(0, 7);
            if (!stats[month]) {
                stats[month] = 0;
            }
            stats[month]++;
        });
        
        return stats;
    }

    async logActivity(activity) {
        const activityData = {
            id: this.generateId(),
            ...activity,
            timestamp: new Date().toISOString()
        };
        
        await this.storage.saveActivity(activityData);
        return activityData;
    }

    async getEmpregadorRecentActivity(empregadorId) {
        const activities = await this.storage.getActivitiesByUser(empregadorId, 10);
        return activities;
    }

    async initializeSampleData() {
        // Check if data already exists
        const existingCenters = await this.storage.getAllCenters();
        if (existingCenters.length > 0) {
            return; // Data already initialized
        }

        // Initialize sample data
        await this.createSampleCenters();
        await this.createSampleCourses();
        await this.createSampleCitizens();
        await this.createSampleRegistrations();
        await this.createSampleGraduates();
    }

    async createSampleCenters() {
        const centers = [
            {
                id: 'center_inefop_luanda',
                name: 'Centro INEFOP Luanda',
                address: 'Rua Rainha Ginga, Maianga, Luanda',
                province: 'Luanda',
                municipality: 'Luanda',
                location: { latitude: -8.8389, longitude: 13.2894 },
                phone: '+244 222 000 001',
                email: 'luanda@inefop.ao',
                status: 'active',
                capacity: 500,
                coursesOffered: ['informatica', 'soldadura', 'electricidade'],
                facilities: ['Computer Lab', 'Workshop', 'Library']
            },
            {
                id: 'center_tecnico_maianga',
                name: 'Centro Técnico Maianga',
                address: 'Avenida Deolinda Rodrigues, Maianga',
                province: 'Luanda',
                municipality: 'Luanda',
                location: { latitude: -8.8450, longitude: 13.2920 },
                phone: '+244 222 000 002',
                email: 'maianga@maptss.ao',
                status: 'active',
                capacity: 300,
                coursesOffered: ['soldadura', 'mecanica', 'construcao'],
                facilities: ['Workshop', 'Tools Library']
            }
        ];

        for (const center of centers) {
            await this.storage.saveCenter(center);
        }
    }

    async createSampleCourses() {
        const courses = [
            {
                id: 'course_informatica_basica',
                name: 'Informática Básica',
                area: 'informatica',
                duration: 3,
                durationType: 'months',
                modality: 'presencial',
                description: 'Aprenda os fundamentos da informática, incluindo Windows, Word, Excel e Internet.',
                requirements: ['12ª Classe', 'Conhecimentos básicos de matemática'],
                centerId: 'center_inefop_luanda',
                maxStudents: 25,
                schedule: 'Segunda a Sexta, 14h às 17h',
                cost: 0,
                certificate: true
            },
            {
                id: 'course_soldadura_basica',
                name: 'Soldadura Básica',
                area: 'soldadura',
                duration: 4,
                durationType: 'months',
                modality: 'presencial',
                description: 'Curso prático de soldadura com certificação reconhecida nacionalmente.',
                requirements: ['9ª Classe', 'Exame médico'],
                centerId: 'center_tecnico_maianga',
                maxStudents: 15,
                schedule: 'Segunda a Sexta, 8h às 12h',
                cost: 0,
                certificate: true
            }
        ];

        for (const course of courses) {
            await this.storage.saveCourse(course);
        }
    }

    async createSampleCitizens() {
        const citizens = [
            {
                id: 'citizen_001',
                name: 'João Silva Santos',
                bi: '004123456LA041',
                birthDate: '1999-03-15',
                gender: 'M',
                phone: '+244 923 456 789',
                email: 'joao.silva@email.com',
                address: 'Rua da Independência, nº 123, Maianga, Luanda',
                province: 'Luanda',
                municipality: 'Luanda',
                education: '12ª Classe',
                maritalStatus: 'Solteiro',
                location: { latitude: -8.8400, longitude: 13.2900 }
            }
        ];

        for (const citizen of citizens) {
            await this.storage.saveCitizen(citizen);
        }
    }

    async createSampleRegistrations() {
        const registrations = [
            {
                id: 'reg_001',
                citizenId: 'citizen_001',
                citizenName: 'João Silva Santos',
                citizenBI: '004123456LA041',
                citizenPhone: '+244 923 456 789',
                courseId: 'course_informatica_basica',
                courseName: 'Informática Básica',
                centerId: 'center_inefop_luanda',
                centerName: 'Centro INEFOP Luanda',
                status: 'pending',
                submittedAt: '2024-01-25T14:30:00Z',
                documentsStatus: {
                    total: 4,
                    submitted: 2,
                    missing: ['photo', 'residence'],
                    complete: false
                },
                motivation: 'Desejo aprender informática para melhorar minhas oportunidades de emprego e poder ajudar minha família.'
            }
        ];

        for (const registration of registrations) {
            await this.storage.saveRegistration(registration);
        }
    }

    async createSampleGraduates() {
        const graduates = [
            {
                id: 'graduate_001',
                citizenId: 'citizen_002',
                name: 'Maria Silva Andrade',
                age: 22,
                location: 'Luanda',
                phone: '+244 923 456 790',
                email: 'maria.andrade@email.com',
                competencies: [
                    {
                        area: 'informatica',
                        course: 'Informática Avançada',
                        level: 'advanced',
                        grade: 18,
                        certificateId: 'cert_001'
                    }
                ],
                experienceLevel: 'intermediario',
                availability: 'immediate',
                workType: 'full-time',
                rating: 4.9,
                graduatedAt: '2024-01-15T00:00:00Z',
                verified: true
            }
        ];

        for (const graduate of graduates) {
            await this.storage.saveGraduate(graduate);
        }
    }
}

// Initialize global API instance
window.MAPTSSApi = new MAPTSSApi();