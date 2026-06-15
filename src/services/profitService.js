import api from '../api/axios';

const profitService = {
  // Profit-Daten für alle Mitarbeiter abrufen
  async getProfitData(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Filter-Parameter hinzufügen
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/profit?${queryString}` : '/profit';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Profit-Daten:', error);
      throw error;
    }
  },

  // Profit-Daten für einen bestimmten Zeitraum abrufen
  async getProfitDataByPeriod(startDate, endDate) {
    try {
      const response = await api.get('/profit', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Profit-Daten für Zeitraum:', error);
      throw error;
    }
  },

  // Profit-Daten für einen bestimmten Mitarbeiter abrufen
  async getEmployeeProfitData(employeeId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/profit/employee/${employeeId}?${queryString}` : `/profit/employee/${employeeId}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter-Profit-Daten:', error);
      throw error;
    }
  },

  // Baustellenkosten-Daten abrufen
  async getConstructionCosts(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/profit/construction-costs?${queryString}` : '/profit/construction-costs';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Baustellenkosten-Daten:', error);
      throw error;
    }
  },

  // Regie-Gewinn-Daten abrufen
  async getRegieProfits(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/profit/regie-profits?${queryString}` : '/profit/regie-profits';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Regie-Gewinn-Daten:', error);
      throw error;
    }
  }
};

export default profitService;
