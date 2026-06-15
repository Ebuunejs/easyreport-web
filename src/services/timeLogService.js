import api from '../api/axios';

export const timeLogService = {
    async getTimeLogs(employeeId) {
        const response = await api.get(`/employees/${employeeId}/time-logs`);
        return response.data;
    },

    async createTimeLog(employeeId, timeLogData) {
        const response = await api.post(`/employees/${employeeId}/time-logs`, timeLogData);
        return response.data;
    },

    async updateTimeLog(employeeId, timeLogId, timeLogData) {
        const response = await api.put(`/employees/${employeeId}/time-logs/${timeLogId}`, timeLogData);
        return response.data;
    },

    async deleteTimeLog(employeeId, timeLogId) {
        await api.delete(`/employees/${employeeId}/time-logs/${timeLogId}`);
    },

    async getAllTimeLogs(filters = {}) {
        // Temporär öffentlichen Endpunkt verwenden für Tests
        const response = await api.get('/public/time-logs', { params: filters });
        return response.data;
    },

    async getTimeLogsForWeek(startDate, endDate, employeeId = null) {
        const params = {
            start_date: startDate,
            end_date: endDate
        };
        if (employeeId) {
            params.employee_id = employeeId;
        }
        // Temporär öffentlichen Endpunkt verwenden für Tests
        const response = await api.get('/public/time-logs/week', { params });
        return response.data;
    },

    async getTimeLogsForDateRange(startDate, endDate, filters = {}) {
        const params = {
            start_date: startDate,
            end_date: endDate,
            ...filters
        };
        try {
            const response = await api.get('/time-logs/date-range', { params });
            return response.data;
        } catch (e) {
            // Fallback: öffentliche Route
            const response = await api.get('/public/time-logs/date-range', { params });
            return response.data;
        }
    },

    async approveTimeLog(timeLogId) {
        const response = await api.put(`/time-logs/${timeLogId}/approve`);
        return response.data;
    },

    async rejectTimeLog(timeLogId, reason = '') {
        const response = await api.put(`/time-logs/${timeLogId}/reject`, { reason });
        return response.data;
    },

    async getPendingApprovals() {
        const response = await api.get('/time-logs/pending-approvals');
        return response.data;
    },

    async getTimeLogsByStatus(status) {
        const response = await api.get('/time-logs', { params: { status } });
        return response.data;
    },

    async bulkApproveTimeLogs(timeLogIds) {
        const response = await api.put('/time-logs/bulk-approve', { time_log_ids: timeLogIds });
        return response.data;
    },

    async getEmployeeWeekSummary(employeeId, startDate, endDate) {
        const response = await api.get(`/employees/${employeeId}/time-logs/week-summary`, {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    async getAllEmployeesWeekSummary(startDate, endDate) {
        const response = await api.get('/time-logs/all-employees-week-summary', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    }
    ,
    async getEmployeeMonthOverview(startDate, endDate, employeeId) {
        const params = { start_date: startDate, end_date: endDate };
        if (employeeId) params.employee_id = employeeId;
        try {
            const response = await api.get('/time-logs/employee-month-overview', { params });
            return response.data;
        } catch (e) {
            const response = await api.get('/public/time-logs/employee-month-overview', { params });
            return response.data;
        }
    }
}; 