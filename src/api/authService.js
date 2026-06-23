import api, { getTenantSlug } from './axios';

// Auth-Tokenverwaltung
export const getToken = () => localStorage.getItem('user-token');
export const setToken = (token) => {
    if (token) {
        localStorage.setItem('user-token', token);
        console.log('Token gespeichert:', token.substring(0, 20) + '...');
        
        // Verifiziere sofort, dass der Token korrekt gespeichert wurde
        const storedToken = localStorage.getItem('user-token');
        if (storedToken !== token) {
            console.error('Token wurde nicht korrekt gespeichert!');
            console.error('Original:', token.substring(0, 20) + '...');
            console.error('Gespeichert:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
        } else {
            console.log('Token-Verifikation erfolgreich');
        }
    } else {
        removeToken();
    }
};
export const removeToken = () => {
    localStorage.removeItem('user-token');
};

// Benutzer-Daten-Verwaltung
export const getUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
        return null;
    }
};

export const setUser = (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        removeUser();
    }
};

export const removeUser = () => {
    localStorage.removeItem('user');
};

// Rolle-Verwaltung
export const getRole = () => {
    try {
        const user = getUser();
        return user?.role || null;
    } catch (error) {
        console.error('Fehler beim Laden der Benutzerrolle:', error);
        return null;
    }
};

// Auth API-Anfragen
export const login = async (email, password, slug) => {
    try { // /login
        const tenant = slug || getTenantSlug();

        if (slug) {
            localStorage.setItem('tenant-slug', slug);
        }

        const config = tenant ? { headers: { 'X-Tenant': tenant } } : {};

        const response = await api.post('auth/login', { email, password }, config);
        
        console.log("response: ", response);
        let responseData = response.data;

        if (typeof responseData === 'string') {
            const jsonStart = responseData.indexOf('{');
            const jsonEnd = responseData.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                responseData = JSON.parse(responseData.slice(jsonStart, jsonEnd + 1));
            }
        }

        const { user, token } = responseData;
        
        if (user && token) {
            // Stellen Sie sicher, dass die Rolle gesetzt ist
            if (!user.role) {
                console.warn('Benutzerrolle fehlt in der Serverantwort');
                // Fallback: Setze eine Standardrolle oder verwende eine aus dem Backend
                user.role = user.role || 'user';
            }
            
            console.log('Setting token:', token.substring(0, 20) + '...');
            setToken(token);
            setUser(user);
            
            // Verifiziere, dass der Token korrekt gesetzt wurde
            const storedToken = getToken();
            console.log('Token verification - stored:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
            
            return user;
        }
        throw new Error('Ungültige Antwort vom Server');
    } catch (error) {
        console.error('Login-Fehler:', error);
        removeToken();
        removeUser();
        throw new Error(error.response?.data?.message || 'Anmeldung fehlgeschlagen');
    }
};

export const logout = async () => {
    try {
        // API-Anfrage zum Abmelden
        await api.post('auth/logout');
    } catch (error) {
        console.error('Logout-Fehler:', error);
    } finally {
        // Lokale Daten immer entfernen, auch wenn API-Aufruf fehlschlägt
    removeToken();
    removeUser();
    }
};

// Hilfsfunktionen für Rollenprüfung
export const hasRole = (user, role) => user?.role === role;
export const isAdmin = (user) => hasRole(user, 'admin');
export const isEmployee = (user) => hasRole(user, 'employee');
export const isChief = (user) => hasRole(user, 'chief');
export const isManager = (user) => hasRole(user, 'manager'); 
export const isSubcontractor = (user) => hasRole(user, 'subcontractor');
