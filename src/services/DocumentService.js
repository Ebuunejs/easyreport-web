import api from '../api/axios';

class DocumentService {
    // Dokumente eines Mitarbeiters laden
    async getEmployeeDocuments(employeeId) {
        try {
            // Verwende die öffentliche Route, die keine Authentifizierung erfordert
            const response = await api.get(`/public/employees/${employeeId}/contracts`);
            return {
                data: response.data?.data || response.data || [],
                message: 'Mitarbeiterdokumente erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Mitarbeiterdokumente:', error);
            throw error;
        }
    }

    // Einzelnes Dokument laden
    async getDocument(documentId) {
        try {
            const response = await api.get(`/public/contracts/${documentId}`);
            return {
                data: response.data?.data || response.data,
                message: 'Dokument erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden des Dokuments:', error);
            throw error;
        }
    }

    // Dokument anzeigen (inline, für Vorschau)
    async viewDocument(documentId) {
        try {
            const response = await api.get(`/public/contracts/${documentId}/view`, {
                responseType: 'blob'
            });

            return {
                data: response.data,
                headers: response.headers,
                message: 'Dokument erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Anzeigen des Dokuments:', error);
            throw error;
        }
    }

    // Dokument herunterladen
    async downloadDocument(documentId, filename = null) {
        try {
            const response = await api.get(`/public/contracts/${documentId}/download`, {
                responseType: 'blob'
            });
            
            // Dateiname aus Header extrahieren
            let downloadFilename = filename;
            const contentDisposition = response.headers['content-disposition'];
            
            if (contentDisposition) {
                // Verschiedene Formate für Content-Disposition prüfen
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    downloadFilename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Fallback: Versuche Dateiname vom Document-Objekt zu bekommen
            if (!downloadFilename) {
                try {
                    const documentResponse = await api.get(`/public/contracts/${documentId}`);
                    downloadFilename = documentResponse.data?.data?.name || `document_${documentId}.pdf`;
                } catch (error) {
                    console.warn('Could not fetch document details for filename:', error);
                    downloadFilename = `document_${documentId}.pdf`;
                }
            }

            console.log('Downloading file with name:', downloadFilename);

            // Blob-URL erstellen und Download auslösen
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', downloadFilename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return {
                message: 'Dokument erfolgreich heruntergeladen',
                filename: downloadFilename
            };
        } catch (error) {
            console.error('Fehler beim Herunterladen des Dokuments:', error);
            throw error;
        }
    }

    // Dokument löschen
    async deleteDocument(documentId) {
        try {
            const response = await api.delete(`/documents/${documentId}`);
            return {
                data: response.data?.data || null,
                message: response.data?.message || 'Dokument erfolgreich gelöscht'
            };
        } catch (error) {
            console.error('Fehler beim Löschen des Dokuments:', error);
            throw error;
        }
    }

    // Dokument hochladen
    async uploadDocument(employeeId, documentData, onProgress = null) {
        try {
            const formData = new FormData();
            
            // Formulardaten zu FormData hinzufügen
            formData.append('employee_id', employeeId);
            formData.append('name', documentData.name);
            
            if (documentData.description) {
                formData.append('description', documentData.description);
            }
            
            if (documentData.file) {
                formData.append('file', documentData.file);
            }

            // Upload mit Progress-Tracking
            const response = await api.post('/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                }
            });

            return {
                data: response.data?.data || response.data,
                message: response.data?.message || 'Dokument erfolgreich hochgeladen'
            };
        } catch (error) {
            console.error('Fehler beim Hochladen des Dokuments:', error);
            throw error;
        }
    }

    // Hilfsfunktion für dynamische View-URL
    getViewUrl(documentId) {
        return `${api.defaults.baseURL}/public/contracts/${documentId}/view`;
    }

    // Hilfsfunktion für dynamische Download-URL
    getDownloadUrl(documentId) {
        return `${api.defaults.baseURL}/public/contracts/${documentId}/download`;
    }
}

export default new DocumentService(); 