import api from './axios';

// Standard-Benutzereinstellungen als Fallback (entspricht DB-Standardwerten)
const getDefaultUserSettings = () => ({
    id: 1,
    user_id: 1,
    theme: 'light',
    language: 'de',
    timezone: 'Europe/Zurich',
    date_format: 'd.m.Y',
    time_format: 'H:i',
    email_notifications: true,
    push_notifications: true,
    auto_logout: false,
    session_timeout: 30,
    dashboard_widgets: null,
    custom_settings: null,
    employeeModule: false,  // DB-Standardwert
    contractModule: false,  // DB-Standardwert
    reportModule: false,    // DB-Standardwert
    profitModule: false,    // DB-Standardwert
    vacationModule: false,  // DB-Standardwert
    deleted_at: null,
    created_at: null,
    updated_at: null
});

// Hilfsfunktion für localStorage-basierte Einstellungen
const getCachedUserSettings = () => {
    try {
        const cached = localStorage.getItem('user-settings-cache');
        if (cached) {
            const settings = JSON.parse(cached);
            console.log('Verwende gecachte Benutzereinstellungen:', settings);
            return settings;
        }
    } catch (error) {
        console.error('Fehler beim Laden der gecachten Einstellungen:', error);
    }
    return null;
};

// Hilfsfunktion für direkte fetch-Requests ohne axios
const fetchUserSettings = async (userId) => {
    try {
        const baseUrl = api.defaults.baseURL;
        const url = `${baseUrl}/public/user-settings/${userId}`;
        
        // console.log('Direkter fetch-Request zu:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            timeout: 5000 // 5 Sekunden Timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log('Direkter fetch-Request erfolgreich:', data);
        
        // Cache die Einstellungen für zukünftige Verwendung
        try {
            localStorage.setItem('user-settings-cache', JSON.stringify(data));
        } catch (cacheError) {
            console.warn('Konnte Einstellungen nicht cachen:', cacheError);
        }
        
        return data;
    } catch (error) {
        console.error('Direkter fetch-Request fehlgeschlagen:', error);
        
        // FALLBACK: Versuche gecachte Einstellungen
        const cachedSettings = getCachedUserSettings();
        if (cachedSettings) {
            return cachedSettings;
        }
        
        // FINAL FALLBACK: Verwende Standard-Einstellungen bei Netzwerkfehlern
        // console.log('Verwende Standard-Benutzereinstellungen als Fallback');
        return getDefaultUserSettings();
    }
};

// UserSettings API-Service - Echte API-Verbindung
export const getUserSettings = async () => {
    try {
        const response = await api.get('/user-settings');
        console.log('Echte Benutzereinstellungen von API geladen:', response.data);
        
        // Cache die Einstellungen für zukünftige Verwendung
        try {
            localStorage.setItem('user-settings-cache', JSON.stringify(response.data));
        } catch (cacheError) {
            console.warn('Konnte Einstellungen nicht cachen:', cacheError);
        }
        
        return response.data;
    } catch (error) {
        console.error('Fehler beim Laden der Benutzereinstellungen:', error);
        
        // FALLBACK: Versuche gecachte Einstellungen
        const cachedSettings = getCachedUserSettings();
        if (cachedSettings) {
            console.log('Verwende gecachte Benutzereinstellungen als Fallback');
            return cachedSettings;
        }
        
        // FINAL FALLBACK: Verwende Standard-Einstellungen bei Netzwerkfehlern
        console.log('Verwende Standard-Benutzereinstellungen als Fallback');
        return getDefaultUserSettings();
    }
};

// Funktion zum Zurücksetzen des Caches (für Logout)
export const resetUserSettingsCache = () => {
    try {
        localStorage.removeItem('user-settings-cache');
        console.log('User-Settings Cache zurückgesetzt');
    } catch (error) {
        console.warn('Fehler beim Zurücksetzen des User-Settings Caches:', error);
    }
};

export const updateUserSettings = async (settings) => {
    try {
        const response = await api.put('/user-settings', settings);
        
        // Cache nach erfolgreichem Update aktualisieren
        try {
            localStorage.setItem('user-settings-cache', JSON.stringify(response.data.settings || response.data));
            console.log('User-Settings Cache nach Update aktualisiert');
        } catch (cacheError) {
            console.warn('Konnte Cache nach Update nicht aktualisieren:', cacheError);
        }
        
        return response.data;
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Benutzereinstellungen:', error);
        
        // FALLBACK: Bei 401-Fehler können wir keine Updates durchführen
        if (error.response?.status === 401) {
            console.warn('Update nicht möglich - Token-Authentifizierung fehlgeschlagen');
            // Wir können die Einstellungen nicht speichern, aber wir können sie trotzdem zurückgeben
            // um die UI nicht zu blockieren
            return { 
                message: 'Einstellungen können derzeit nicht gespeichert werden', 
                settings: settings,
                warning: true
            };
        }
        
        throw error;
    }
};

export const resetUserSettings = async () => {
    try {
        const response = await api.post('/user-settings/reset');
        return response.data;
    } catch (error) {
        console.error('Fehler beim Zurücksetzen der Benutzereinstellungen:', error);
        throw error;
    }
};

// Hilfsfunktionen für Module-Prüfung
export const hasModule = (settings, moduleName) => {
    if (!settings) return false;
    return settings[moduleName] === true;
};

export const hasProfitModule = (settings) => hasModule(settings, 'profitModule');
export const hasEmployeeModule = (settings) => hasModule(settings, 'employeeModule');
export const hasContractModule = (settings) => hasModule(settings, 'contractModule');
export const hasReportModule = (settings) => hasModule(settings, 'reportModule');
export const hasVacationModule = (settings) => hasModule(settings, 'vacationModule');
