import axios from 'axios';

// Tenant-Erkennung: Subdomain easyreport.ch, Query-Parameter ?tenant=..., Fallback LocalStorage/ENV
const detectTenantSlug = () => {
    const hostname = window.location.hostname;
    const queryTenant = new URLSearchParams(window.location.search).get('tenant');

    if (queryTenant) {
        localStorage.setItem('tenant-slug', queryTenant);
        return queryTenant;
    }

    const storedTenant = localStorage.getItem('tenant-slug');
    const subdomainMatch = hostname.match(/^([^.]+)\.easyreport\.ch$/i);

    if (subdomainMatch) {
        localStorage.setItem('tenant-slug', subdomainMatch[1]);
        return subdomainMatch[1];
    }

    if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
    ) {
        return storedTenant || process.env.REACT_APP_DEFAULT_TENANT || 'khb';
    }

    return storedTenant || null;
};

const tenantSlug = detectTenantSlug();

// Base URL aus Domain/IP ableiten
const getBaseUrl = () => {
    const { hostname, protocol } = window.location;

   if (/\.easyreport\.ch$/i.test(hostname)) {
    // OPTION A: API ist immer api.easyreport.ch
    return `https://api.easyreport.ch/api`;
}

    if (/^192\./.test(hostname)) {
        return `http://${hostname}:8000/api`;
    }

    if (hostname === 'localhost' || hostname.startsWith('127.')) {
        return 'http://localhost:8000/api';
    }

    return `${protocol}//${hostname}/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(tenantSlug ? { 'X-Tenant': tenantSlug } : {}),
    },
    withCredentials: true
});

// Request Interceptor
api.interceptors.request.use(
    async (config) => {
        // Pfad immer relativ zur baseURL halten
        if (typeof config.url === 'string' && config.url.startsWith('/')) {
            config.url = config.url.replace(/^\/+/, '');
        }

        const isRegistration = typeof config.url === 'string' && config.url.includes('register-company');

        const activeTenantSlug = localStorage.getItem('tenant-slug') || tenantSlug;
        if (activeTenantSlug && !isRegistration) {
            config.headers['X-Tenant'] = activeTenantSlug;
        }

        // Token-basierter Auth-Header für API-Authentifizierung
        // Nur bei geschützten Routen hinzufügen, nicht bei öffentlichen Routen oder Login
        const isLogin = config.url.includes('login');
        const isPublic = config.url.includes('public/');
        if (!isPublic && !isLogin) {
            const token = localStorage.getItem('user-token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Token added to request:', token.substring(0, 20) + '...');
                console.log('Request URL:', config.url);
                console.log('Request headers:', config.headers);
                
                // Debug: Überprüfe, ob der Token korrekt formatiert ist
                if (!token.includes('|')) {
                    console.error('Token-Format ist möglicherweise falsch:', token);
                }
            } else {
                console.warn('No token found for request to:', config.url);
                console.warn('Available localStorage keys:', Object.keys(localStorage));
                console.warn('localStorage content:', localStorage);
            }
        } else {
            console.log('Öffentliche Route oder Login - kein Token hinzugefügt:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor für Fehlerbehandlung
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Aufräumen: richtigen Token-Key und User entfernen
            try { localStorage.removeItem('user-token'); } catch (_) {}
            try { localStorage.removeItem('user'); } catch (_) {}
            try { localStorage.removeItem('user-settings-cache'); } catch (_) {}

            // Doppel-Redirect vermeiden
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getTenantSlug = () => tenantSlug;
export default api;
