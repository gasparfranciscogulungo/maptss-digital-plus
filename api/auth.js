/**
 * MAPTSS Digital+ Authentication System
 * Secure authentication with role-based access control
 */

class MAPTSSAuth {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'maptss_session';
        this.usersKey = 'maptss_users';
        this.roles = {
            CITIZEN: 'citizen',
            GESTOR: 'gestor', 
            EMPREGADOR: 'empregador',
            ADMIN: 'admin'
        };
        
        this.initializeDefaultUsers();
        this.loadSession();
    }

    async login(credentials) {
        const { email, password, userType } = credentials;
        
        // Get users from storage
        const users = this.getUsers();
        
        // Find user by email and type
        const user = users.find(u => 
            u.email === email && 
            u.userType === userType && 
            this.verifyPassword(password, u.passwordHash)
        );
        
        if (!user) {
            throw new Error('Credenciais inválidas');
        }
        
        if (!user.active) {
            throw new Error('Conta desativada. Contacte o administrador');
        }
        
        // Create session
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            permissions: user.permissions,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
        };
        
        // Save session
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        this.currentUser = session;
        
        // Log login activity
        this.logActivity({
            type: 'user_login',
            userId: user.id,
            details: `Login realizado com sucesso - ${userType}`
        });
        
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                userType: user.userType,
                permissions: user.permissions
            },
            session: session
        };
    }

    async logout() {
        if (this.currentUser) {
            // Log logout activity
            this.logActivity({
                type: 'user_logout',
                userId: this.currentUser.userId,
                details: 'Logout realizado'
            });
        }
        
        // Clear session
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
        
        return { success: true };
    }

    async register(userData) {
        const { email, password, name, userType, additionalData } = userData;
        
        // Validate user type
        if (!Object.values(this.roles).includes(userType)) {
            throw new Error('Tipo de usuário inválido');
        }
        
        // Check if email already exists
        const users = this.getUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            throw new Error('Email já está em uso');
        }
        
        // Create new user
        const newUser = {
            id: this.generateUserId(),
            email,
            passwordHash: this.hashPassword(password),
            name,
            userType,
            permissions: this.getDefaultPermissions(userType),
            active: userType === this.roles.CITIZEN, // Citizens are auto-activated
            createdAt: new Date().toISOString(),
            ...additionalData
        };
        
        // Save user
        users.push(newUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        // Log registration
        this.logActivity({
            type: 'user_registered',
            userId: newUser.id,
            details: `Nova conta criada - ${userType}`
        });
        
        return {
            success: true,
            userId: newUser.id,
            requiresActivation: userType !== this.roles.CITIZEN
        };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }
        
        const user = users[userIndex];
        
        // Verify current password
        if (!this.verifyPassword(currentPassword, user.passwordHash)) {
            throw new Error('Senha atual incorreta');
        }
        
        // Update password
        user.passwordHash = this.hashPassword(newPassword);
        user.passwordChangedAt = new Date().toISOString();
        
        // Save users
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        // Log activity
        this.logActivity({
            type: 'password_changed',
            userId: userId,
            details: 'Senha alterada com sucesso'
        });
        
        return { success: true };
    }

    async resetPassword(email, userType) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.userType === userType);
        
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        
        // Generate temporary password
        const tempPassword = this.generateTempPassword();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        users[userIndex].passwordHash = this.hashPassword(tempPassword);
        users[userIndex].passwordResetAt = new Date().toISOString();
        users[userIndex].mustChangePassword = true;
        
        // Save users
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        // Log activity
        this.logActivity({
            type: 'password_reset',
            userId: user.id,
            details: 'Password reset solicitado'
        });
        
        // In a real system, this would send email/SMS
        console.log(`Senha temporária para ${email}: ${tempPassword}`);
        
        return {
            success: true,
            message: 'Senha temporária enviada. Verifique seu email/SMS.',
            tempPassword: tempPassword // Only for demo purposes
        };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null && this.isSessionValid();
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        return this.currentUser.permissions.includes(permission);
    }

    hasRole(role) {
        if (!this.currentUser) return false;
        return this.currentUser.userType === role;
    }

    isSessionValid() {
        if (!this.currentUser) return false;
        
        const expiresAt = new Date(this.currentUser.expiresAt);
        const now = new Date();
        
        return now < expiresAt;
    }

    extendSession() {
        if (this.currentUser && this.isSessionValid()) {
            this.currentUser.expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }

    // Private methods
    loadSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (this.isSessionValidForData(session)) {
                this.currentUser = session;
            } else {
                localStorage.removeItem(this.sessionKey);
            }
        }
    }

    isSessionValidForData(session) {
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        return now < expiresAt;
    }

    getUsers() {
        const usersData = localStorage.getItem(this.usersKey);
        return usersData ? JSON.parse(usersData) : [];
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    hashPassword(password) {
        // In a real system, use proper hashing like bcrypt
        // This is just for demo purposes
        return btoa(password + 'maptss_salt_' + password.length);
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    generateTempPassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getDefaultPermissions(userType) {
        const permissions = {
            [this.roles.CITIZEN]: [
                'view_own_profile',
                'edit_own_profile',
                'submit_registration',
                'view_own_registrations',
                'view_centers',
                'view_courses',
                'upload_documents'
            ],
            [this.roles.GESTOR]: [
                'view_dashboard',
                'manage_registrations',
                'approve_registrations',
                'reject_registrations',
                'manage_centers',
                'manage_courses',
                'view_reports',
                'generate_reports',
                'manage_notifications',
                'view_activities',
                'manage_system_settings'
            ],
            [this.roles.EMPREGADOR]: [
                'view_dashboard',
                'search_graduates',
                'view_graduate_profiles',
                'create_internships',
                'manage_internships',
                'verify_certificates',
                'create_job_listings',
                'manage_job_listings',
                'view_talent_reports'
            ],
            [this.roles.ADMIN]: [
                'full_access',
                'manage_users',
                'system_administration',
                'view_all_data',
                'backup_restore'
            ]
        };

        return permissions[userType] || [];
    }

    initializeDefaultUsers() {
        const users = this.getUsers();
        
        // Create default users if none exist
        if (users.length === 0) {
            const defaultUsers = [
                {
                    id: 'user_admin_001',
                    email: 'admin@maptss.ao',
                    passwordHash: this.hashPassword('admin123'),
                    name: 'Administrador MAPTSS',
                    userType: this.roles.ADMIN,
                    permissions: this.getDefaultPermissions(this.roles.ADMIN),
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'user_gestor_001',
                    email: 'gestor@maptss.ao',
                    passwordHash: this.hashPassword('gestor123'),
                    name: 'Gestor MAPTSS',
                    userType: this.roles.GESTOR,
                    permissions: this.getDefaultPermissions(this.roles.GESTOR),
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'user_empregador_001',
                    email: 'rh@empresa.ao',
                    passwordHash: this.hashPassword('empregador123'),
                    name: 'RH Empresa XYZ',
                    userType: this.roles.EMPREGADOR,
                    permissions: this.getDefaultPermissions(this.roles.EMPREGADOR),
                    active: true,
                    company: 'Empresa XYZ, Lda',
                    sector: 'Tecnologia',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'user_citizen_001',
                    email: 'joao.silva@email.com',
                    passwordHash: this.hashPassword('citizen123'),
                    name: 'João Silva Santos',
                    userType: this.roles.CITIZEN,
                    permissions: this.getDefaultPermissions(this.roles.CITIZEN),
                    active: true,
                    citizenId: 'citizen_001',
                    createdAt: new Date().toISOString()
                }
            ];

            localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
        }
    }

    logActivity(activity) {
        // Get existing activities
        const activitiesKey = 'maptss_activities';
        const activities = JSON.parse(localStorage.getItem(activitiesKey) || '[]');
        
        // Add new activity
        const newActivity = {
            id: 'activity_' + Math.random().toString(36).substr(2, 9),
            ...activity,
            timestamp: new Date().toISOString()
        };
        
        activities.push(newActivity);
        
        // Keep only last 1000 activities
        if (activities.length > 1000) {
            activities.splice(0, activities.length - 1000);
        }
        
        localStorage.setItem(activitiesKey, JSON.stringify(activities));
    }

    // Two-Factor Authentication (2FA) methods
    async enableTwoFactor(userId) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }
        
        // Generate secret key (in real system, use proper 2FA library)
        const secret = this.generateTwoFactorSecret();
        
        users[userIndex].twoFactorEnabled = true;
        users[userIndex].twoFactorSecret = secret;
        
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        return {
            success: true,
            secret: secret,
            qrCodeUrl: this.generateQRCodeUrl(users[userIndex].email, secret)
        };
    }

    async verifyTwoFactor(userId, token) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user || !user.twoFactorEnabled) {
            return false;
        }
        
        // In real system, use proper TOTP verification
        return this.verifyTOTP(token, user.twoFactorSecret);
    }

    generateTwoFactorSecret() {
        // Generate random base32 secret
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    }

    generateQRCodeUrl(email, secret) {
        const issuer = 'MAPTSS Digital+';
        return `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
    }

    verifyTOTP(token, secret) {
        // Simplified TOTP verification for demo
        // In real system, use proper TOTP library
        const currentTime = Math.floor(Date.now() / 30000);
        const expectedToken = this.generateTOTP(secret, currentTime);
        
        return token === expectedToken || 
               token === this.generateTOTP(secret, currentTime - 1) || 
               token === this.generateTOTP(secret, currentTime + 1);
    }

    generateTOTP(secret, timeSlot) {
        // Simplified TOTP generation for demo
        const hash = this.simpleHash(secret + timeSlot.toString());
        return (hash % 1000000).toString().padStart(6, '0');
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Session management
    async getAllActiveSessions() {
        // In a real system, this would query a sessions table
        // For demo, we'll return current session info
        if (this.currentUser) {
            return [{
                id: 'session_' + this.currentUser.userId,
                userId: this.currentUser.userId,
                loginTime: this.currentUser.loginTime,
                expiresAt: this.currentUser.expiresAt,
                userAgent: navigator.userAgent,
                ipAddress: 'Demo IP'
            }];
        }
        return [];
    }

    async revokeSession(sessionId) {
        // In a real system, this would invalidate the specific session
        if (sessionId.includes(this.currentUser?.userId)) {
            return this.logout();
        }
        return { success: true };
    }

    async revokeAllSessions(userId) {
        // Revoke all sessions for a user
        if (this.currentUser?.userId === userId) {
            return this.logout();
        }
        return { success: true };
    }
}