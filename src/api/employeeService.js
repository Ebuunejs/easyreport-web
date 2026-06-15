import api from './axios';

// Employee Service für Mitarbeiterdaten
export const employeeService = {
  // Alle Mitarbeiter abrufen
  getAllEmployees: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Filter-Parameter hinzufügen
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/employees?${queryString}` : '/employees';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      throw error;
    }
  },

  // Einzelnen Mitarbeiter abrufen
  getEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden des Mitarbeiters:', error);
      throw error;
    }
  },

  // Mitarbeiter nach Abteilung abrufen
  getEmployeesByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/departments/${departmentId}/employees`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Abteilungsmitarbeiter:', error);
      throw error;
    }
  },

  // Aktive Mitarbeiter abrufen
  getActiveEmployees: async () => {
    try {
      console.log('Lade aktive Mitarbeiter...');
      
      // Versuche verschiedene API-Endpunkte
      let response;
      let error = null;
      
      // 1. Versuche mit is_active Filter (das sollte die Mitarbeiterliste zurückgeben)
      try {
        console.log('Versuche mit is_active Filter...');
        response = await api.get('/employees?is_active=1');
        console.log('Mitarbeiter-API Response (mit Filter):', response.data);
        
        // Prüfe ob es ein Array von Mitarbeitern ist
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data && Array.isArray(response.data.employees)) {
          return response.data.employees;
        }
        
        console.log('Unerwartetes Datenformat, versuche nächsten Endpunkt...');
      } catch (filterError) {
        console.log('Filter-Fehler, versuche ohne Filter:', filterError.response?.status);
        error = filterError;
      }
      
      // 2. Fallback: Alle Mitarbeiter laden
      try {
        console.log('Versuche alle Mitarbeiter...');
        response = await api.get('/employees');
        console.log('Mitarbeiter-API Response (ohne Filter):', response.data);
        
        // Prüfe ob es ein Array von Mitarbeitern ist
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data && Array.isArray(response.data.employees)) {
          return response.data.employees;
        }
        
        console.log('Unerwartetes Datenformat, verwende leeres Array...');
        return [];
      } catch (allError) {
        console.log('Alle Mitarbeiter fehlgeschlagen:', allError.response?.status);
        error = allError;
      }
      
      // 3. Dashboard-Endpunkt als letzter Versuch (gibt nur Statistiken zurück)
      try {
        console.log('Versuche Dashboard-Endpunkt...');
        response = await api.get('/dashboard/employees');
        console.log('Dashboard-API Response:', response.data);
        
        // Dashboard gibt nur Statistiken zurück, keine Mitarbeiterliste
        console.log('Dashboard gibt nur Statistiken zurück, verwende leeres Array');
        return [];
      } catch (dashboardError) {
        console.log('Dashboard-Endpunkt fehlgeschlagen:', dashboardError.response?.status);
        error = dashboardError;
      }
      
      // Wenn alle fehlschlagen, werfe den letzten Fehler
      throw error;
      
    } catch (error) {
      console.error('Fehler beim Laden der aktiven Mitarbeiter:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Für Debugging: Zeige auch den aktuellen Benutzer
      try {
        const debugResponse = await api.get('/debug/user-info');
        console.log('Debug User Info:', debugResponse.data);
      } catch (debugError) {
        console.log('Debug-Info nicht verfügbar:', debugError);
      }
      
      throw error;
    }
  }
};

export default employeeService;
