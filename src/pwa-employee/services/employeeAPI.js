import api from '../../api/axios';

class EmployeeAPI {
  // Projekte für einen Benutzer laden - KORREKTE VERSION nach React Native Vorlage
  async getEmployeeProjects(userId) {
    try {
      const projectList = await api.get(`/projectsApps/${userId}`);
      console.log('Project List Response:', projectList.data);
      
      return projectList.data.data;
    } catch (error) {
      console.error('Fehler beim Laden der Projekte:', error);
      return [];
    }
  }

  // Zeiterfassung starten
  async startTimeTracking(userId, projectId, projectName, startLocation) {
    try {
      const response = await api.post('/tracking/start', {
        userId,
        projectId: projectId.toString(),
        projectName,
        startLocation: startLocation ? {
          latitude: startLocation.lat,
          longitude: startLocation.lng,
          accuracy: startLocation.accuracy
        } : null
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Starten der Zeiterfassung:', error);
      throw new Error(error.response?.data?.message || 'Zeiterfassung konnte nicht gestartet werden');
    }
  }

  // Zeiterfassung stoppen - KORRIGIERT: PUT statt POST
  async stopTimeTracking(trackingId, endLocation = null) {
    try {
      const response = await api.put(`/tracking/${trackingId}/stop`, {
        endLocation: endLocation ? {
          latitude: endLocation.lat,
          longitude: endLocation.lng,
          accuracy: endLocation.accuracy
        } : null
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Stoppen der Zeiterfassung:', error);
      throw new Error(error.response?.data?.message || 'Zeiterfassung konnte nicht gestoppt werden');
    }
  }

  // Aktive Zeiterfassung abrufen
  async getActiveTracking(userId) {
    try {
      const response = await api.get(`/tracking/active/${userId}`);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Keine aktive Zeiterfassung
      }
      console.error('Fehler beim Abrufen der aktiven Zeiterfassung:', error);
      throw error;
    }
  }

  // TimeLog-Einträge abrufen
  async getTimeLogs(userId) {
    try {
      const response = await api.get(`/tracking/time-logs/${userId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Fehler beim Laden der TimeLog-Einträge:', error);
      return [];
    }
  }

  // Mitarbeiter-Info abrufen
  async getEmployeeByUserId(userId) {
    try {
      const response = await api.get(`/employees/by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiterdaten:', error);
      throw error;
    }
  }

  // Arbeitstag beenden
  async endDay(userId, endLocation = null) {
    try {
      const response = await api.post('/tracking/end-day', {
        userId,
        endLocation: endLocation ? {
          latitude: endLocation.lat,
          longitude: endLocation.lng,
          accuracy: endLocation.accuracy
        } : null
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Beenden des Arbeitstages:', error);
      throw new Error(error.response?.data?.message || 'Arbeitstag konnte nicht beendet werden');
    }
  }
}

export default new EmployeeAPI(); 
