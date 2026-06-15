import api from './axios';

// Vacation Service für Ferienanträge
export const vacationService = {
  // Alle Ferienanträge eines Mitarbeiters abrufen
  getVacationRequests: async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}/vacation-requests`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Ferienanträge:', error);
      throw error;
    }
  },

  // Neuen Ferienantrag erstellen
  createVacationRequest: async (employeeId, vacationData) => {
    try {
      console.log('vacationService - Sende Daten:', vacationData);
      const response = await api.post(`/employees/${employeeId}/vacation-requests`, vacationData);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Ferienantrags:', error);
      throw error;
    }
  },

  // Ferienantrag aktualisieren
  updateVacationRequest: async (employeeId, requestId, vacationData) => {
    try {
      const response = await api.put(`/employees/${employeeId}/vacation-requests/${requestId}`, {
        start_date: vacationData.startDate,
        end_date: vacationData.endDate,
        reason: vacationData.notes || vacationData.reason
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Ferienantrags:', error);
      throw error;
    }
  },

  // Urlaubssaldo eines Mitarbeiters abrufen
  getVacationBalance: async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}/vacation-balance`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden des Urlaubssaldos:', error);
      throw error;
    }
  },

  // Abteilungsübersicht für Ferienanträge
  getDepartmentVacationOverview: async (departmentId) => {
    try {
      const response = await api.get(`/departments/${departmentId}/vacation-overview`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Abteilungsübersicht:', error);
      throw error;
    }
  },

  // Ferienantrag genehmigen
  approveVacationRequest: async (vacationRequestId) => {
    try {
      console.log('Genehmige Ferienantrag:', vacationRequestId);
      const response = await api.post(`/vacation-requests/${vacationRequestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Genehmigen des Ferienantrags:', error);
      throw error;
    }
  },

  // Ferienantrag ablehnen
  rejectVacationRequest: async (vacationRequestId, rejectionReason = null) => {
    try {
      console.log('Lehne Ferienantrag ab:', vacationRequestId, 'Grund:', rejectionReason);
      const response = await api.post(`/vacation-requests/${vacationRequestId}/reject`, {
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Ablehnen des Ferienantrags:', error);
      throw error;
    }
  }
};

export default vacationService;
