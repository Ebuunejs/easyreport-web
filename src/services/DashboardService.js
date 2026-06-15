import api from '../api/axios';

const getEmployeeData = async () => {
  console.log('[DashboardService] Attempting to call getEmployeeData. Axios baseURL:', api.defaults.baseURL);
  try {
    const response = await api.get('/dashboard/employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee dashboard data:', error);
    // Hier könntest du eine spezifischere Fehlerbehandlung oder einen Standardwert zurückgeben
    throw error; 
  }
};

const getHoursData = async () => {
  try {
    const response = await api.get('/dashboard/hours');
    console.log('[DashboardService] Response from getHoursData:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching hours dashboard data:', error);
    throw error;
  }
};

const getVacationData = async () => {
  try {
    const response = await api.get('/dashboard/vacation');
    return response.data;
  } catch (error) {
    console.error('Error fetching vacation dashboard data:', error);
    throw error;
  }
};

const getSickLeaveData = async () => {
  try {
    const response = await api.get('/dashboard/sick-leave');
    return response.data;
  } catch (error) {
    console.error('Error fetching sick leave dashboard data:', error);
    throw error;
  }
};

// NEU: Profit-Totals (aktuelle Periode)
const getProfitTotals = async (filters = { period: 'current' }) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const url = qs ? `/profit?${qs}` : '/profit';
    const response = await api.get(url);
    return response.data?.totals || { total_profit: 0, total_revenue: 0, total_costs: 0 };
  } catch (error) {
    console.error('Error fetching profit totals:', error);
    return { total_profit: 0, total_revenue: 0, total_costs: 0 };
  }
};

// NEU: Projekte laden
const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// NEU: Projektkosten laden (optional mit Status-Filter)
const getProjectCosts = async (params = {}) => {
  try {
    const response = await api.get('/project-costs', { params });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching project costs:', error);
    return [];
  }
};

// NEU: Verträge laden
const getContracts = async (params = {}) => {
  try {
    const response = await api.get('/contracts', { params });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
};

// NEU: Ausstehende Genehmigungen (Zeiterfassungen)
const getPendingApprovals = async () => {
  try {
    const response = await api.get('/time-logs/pending-approvals');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return [];
  }
};

// NEU: Zeiterfassungen für Datumsbereich (zur Anomalie-Erkennung)
const getTimeLogsForDateRange = async (params) => {
  try {
    const response = await api.get('/time-logs/date-range', { params });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching time logs for date range:', error);
    return [];
  }
};

// NEU: Regie-Gewinne nach Baustellen (für Gewinn-Chart)
const getRegieProfits = async (filters = { period: 'current' }) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const url = qs ? `/profit/regie-profits?${qs}` : '/profit/regie-profits';
    const response = await api.get(url);
    return response.data || { success: false, data: [], totals: {} };
  } catch (error) {
    console.error('Error fetching regie profits:', error);
    return { success: false, data: [], totals: {} };
  }
};

const DashboardService = {
  getEmployeeData,
  getHoursData,
  getVacationData,
  getSickLeaveData,
  // neu
  getProfitTotals,
  getProjects,
  getProjectCosts,
  getContracts,
  getPendingApprovals,
  getTimeLogsForDateRange,
  getRegieProfits,
};

export default DashboardService; 