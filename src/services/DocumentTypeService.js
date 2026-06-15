import api from '../api/axios';

class DocumentTypeService {
    async getDocumentTypes() {
        try {
            const response = await api.get('/document-types');
            return {
                data: response.data?.data || response.data || [],
                message: response.data?.message || 'Dokumenttypen erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Dokumenttypen:', error);
            throw error;
        }
    }

    async createDocumentType(documentTypeData) {
        try {
            const response = await api.post('/document-types', documentTypeData);
            return {
                data: response.data?.data || response.data,
                message: response.data?.message || 'Dokumenttyp erfolgreich erstellt'
            };
        } catch (error) {
            console.error('Fehler beim Erstellen des Dokumenttyps:', error);
            throw error;
        }
    }

    async updateDocumentType(id, documentTypeData) {
        try {
            const response = await api.put(`/document-types/${id}`, documentTypeData);
            return {
                data: response.data?.data || response.data,
                message: response.data?.message || 'Dokumenttyp erfolgreich aktualisiert'
            };
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Dokumenttyps:', error);
            throw error;
        }
    }

    async deleteDocumentType(id) {
        try {
            const response = await api.delete(`/document-types/${id}`);
            return {
                data: response.data?.data || null,
                message: response.data?.message || 'Dokumenttyp erfolgreich gelöscht'
            };
        } catch (error) {
            console.error('Fehler beim Löschen des Dokumenttyps:', error);
            throw error;
        }
    }

    async getDocumentType(id) {
        try {
            const response = await api.get(`/document-types/${id}`);
            return {
                data: response.data?.data || response.data,
                message: response.data?.message || 'Dokumenttyp erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden des Dokumenttyps:', error);
            throw error;
        }
    }
}

export default new DocumentTypeService(); 