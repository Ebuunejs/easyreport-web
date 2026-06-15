import api from '../api/axios';

class ContractService {
    // Mitarbeiter laden (für Dropdown)
    async getEmployees() {
        try {
            const response = await api.get('/employees');
            return {
                data: response.data || [],
                message: 'Mitarbeiter erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Mitarbeiter:', error);
            throw error;
        }
    }

    // Dokumenttypen laden (für Dropdown)
    async getDocumentTypes() {
        try {
            const response = await api.get('/public/document-types');
            return {
                data: response.data?.data || response.data || [],
                message: 'Dokumenttypen erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Dokumenttypen:', error);
            throw error;
        }
    }

    // Beide Datenquellen parallel laden
    async getContractFormData() {
        try {
            const [employeesResponse, documentTypesResponse] = await Promise.all([
                this.getEmployees(),
                this.getDocumentTypes()
            ]);

            return {
                employees: employeesResponse.data,
                documentTypes: documentTypesResponse.data,
                message: 'Formulardaten erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Formulardaten:', error);
            throw error;
        }
    }

    // Vertrag hochladen
    async uploadContract(contractData, onProgress = null) {
        try {
            const formData = new FormData();
            
            // Formulardaten zu FormData hinzufügen
            formData.append('employee_id', contractData.employeeId);
            formData.append('document_type_id', contractData.type);
            formData.append('valid_from', contractData.validFrom);
            
            if (contractData.validTo) {
                formData.append('valid_to', contractData.validTo);
            }
            
            if (contractData.file) {
                formData.append('file', contractData.file);
            }

            // Upload mit Progress-Tracking
            const response = await api.post('/contracts', formData, {
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
                message: response.data?.message || 'Vertrag erfolgreich hochgeladen'
            };
        } catch (error) {
            console.error('Fehler beim Hochladen des Vertrags:', error);
            throw error;
        }
    }

    // Alle Verträge laden
    async getContracts(filters = {}) {
        try {
            const response = await api.get('/contracts', {
                params: filters
            });
            return {
                data: response.data?.data || response.data || [],
                message: 'Verträge erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Verträge:', error);
            throw error;
        }
    }

    // Einzelnen Vertrag laden
    async getContract(id) {
        try {
            const response = await api.get(`/contracts/${id}`);
            return {
                data: response.data?.data || response.data,
                message: 'Vertrag erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden des Vertrags:', error);
            throw error;
        }
    }

    // Vertrag löschen
    async deleteContract(id) {
        try {
            const response = await api.delete(`/contracts/${id}`);
            return {
                data: response.data?.data || null,
                message: response.data?.message || 'Vertrag erfolgreich gelöscht'
            };
        } catch (error) {
            console.error('Fehler beim Löschen des Vertrags:', error);
            throw error;
        }
    }

    // Verträge eines Mitarbeiters laden
    async getEmployeeContracts(employeeId) {
        try {
            const response = await api.get(`/employees/${employeeId}/contracts`);
            return {
                data: response.data?.data || response.data || [],
                message: 'Mitarbeiterverträge erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Laden der Mitarbeiterverträge:', error);
            throw error;
        }
    }

    // Vertrag anzeigen (inline, für Vorschau)
    async viewContract(id) {
        try {
            const response = await api.get(`/contracts/${id}/view`, {
                responseType: 'blob'
            });

            return {
                data: response.data,
                headers: response.headers,
                message: 'Vertrag erfolgreich geladen'
            };
        } catch (error) {
            console.error('Fehler beim Anzeigen des Vertrags:', error);
            throw error;
        }
    }

    // Vertrag herunterladen
    async downloadContract(id) {
        try {
            const response = await api.get(`/contracts/${id}/download`, {
                responseType: 'blob'
            });
            
            // Dateiname aus Header extrahieren
            let filename = null;
            const contentDisposition = response.headers['content-disposition'];
            
            if (contentDisposition) {
                // Verschiedene Formate für Content-Disposition prüfen
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Fallback: Versuche Dateiname vom Contract-Objekt zu bekommen
            if (!filename) {
                try {
                    const contractResponse = await api.get(`/contracts/${id}`);
                    filename = contractResponse.data?.data?.name || `contract_${id}.pdf`;
                } catch (error) {
                    console.warn('Could not fetch contract details for filename:', error);
                    filename = `contract_${id}.pdf`;
                }
            }

            console.log('Downloading file with name:', filename);

            // Blob-URL erstellen und Download auslösen
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return {
                message: 'Vertrag erfolgreich heruntergeladen',
                filename: filename
            };
        } catch (error) {
            console.error('Fehler beim Herunterladen des Vertrags:', error);
            throw error;
        }
    }

    // Vertragsstatus aktualisieren
    async updateContractStatus(id, statusData) {
        try {
            const response = await api.put(`/contracts/${id}/status`, statusData);
            return {
                data: response.data?.data || response.data,
                message: response.data?.message || 'Vertragsstatus erfolgreich aktualisiert'
            };
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Vertragsstatus:', error);
            throw error;
        }
    }
}

export default new ContractService(); 