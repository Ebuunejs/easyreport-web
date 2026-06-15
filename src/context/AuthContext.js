import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as authLogin, logout as authLogout, getUser, setUser, removeUser, getRole, hasRole, isAdmin, isEmployee, isChief, isManager } from '../api/authService';
import { getUserSettings, resetUserSettingsCache, hasProfitModule, hasEmployeeModule, hasContractModule, hasReportModule, hasVacationModule } from '../api/userSettingsService';

// Erstelle den Auth-Kontext
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [role, setRoleState] = useState(null);
    const [userSettings, setUserSettingsState] = useState(null);
    const [loading, setLoading] = useState(true);

    // Überprüfe den Authentifizierungsstatus beim Start und bei Änderungen
    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = getUser();
            if (storedUser) {
                setUserState(storedUser);
                setRoleState(storedUser.role);
                
                // Lade UserSettings
                try {
                    const settings = await getUserSettings();
                    setUserSettingsState(settings);
                } catch (error) {
                    console.error('Fehler beim Laden der Benutzereinstellungen:', error);
                    setUserSettingsState(null);
                }
            } else {
                setUserState(null);
                setRoleState(null);
                setUserSettingsState(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password, slug) => {
        try {
            const userData = await authLogin(email, password, slug);
            console.log('User Data:', userData);
            if (userData) {
                setUser(userData); // Speichere in localStorage
                setUserState(userData); // Aktualisiere den State
                setRoleState(userData.role); // Aktualisiere die Rolle
                
                // Lade UserSettings nach dem Login
                try {
                    const settings = await getUserSettings();
                    setUserSettingsState(settings);
                } catch (error) {
                    console.error('Fehler beim Laden der Benutzereinstellungen:', error);
                    setUserSettingsState(null);
                }
                
                return userData;
            }
            throw new Error('Keine Benutzerdaten erhalten');
        } catch (error) {
            console.error('Login-Fehler:', error);
            setUserState(null);
            setRoleState(null);
            setUserSettingsState(null);
            removeUser();
            throw error;
        }
    };

    const logout = async () => {
        await authLogout();
        setUserState(null);
        setRoleState(null);
        setUserSettingsState(null);
        resetUserSettingsCache(); // Cache zurücksetzen
    };

    const value = {
        user,
        role,
        userSettings,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        // Rollenbezogene Hilfsfunktionen
        hasRole: (requiredRole) => hasRole(user, requiredRole),
        isAdmin: () => isAdmin(user),
        isEmployee: () => isEmployee(user),
        isChief: () => isChief(user),
        isManager: () => isManager(user),
        //isSubcontractor: () => isSubcontractor(user)
        // Module-bezogene Hilfsfunktionen
        hasProfitModule: () => hasProfitModule(userSettings),
        hasEmployeeModule: () => hasEmployeeModule(userSettings),
        hasContractModule: () => hasContractModule(userSettings),
        hasReportModule: () => hasReportModule(userSettings),
        hasVacationModule: () => hasVacationModule(userSettings),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
    }
    return context;
}; 