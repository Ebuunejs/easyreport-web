import api from '../api/axios';

export const debugService = {
    async getUserInfo() {
        try {
            const response = await api.get('/debug/user-info');
            console.log('Debug - Benutzerinformationen:', response.data);
            return response.data;
        } catch (error) {
            console.error('Fehler beim Abrufen der Debug-Informationen:', error);
            throw error;
        }
    }
};

export default debugService; 