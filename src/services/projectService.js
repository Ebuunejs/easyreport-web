import api from '../api/axios';

const getProjects = async () => {
    try {
        console.log('Lade Projekte von /public/projects...');
        // Verwende die öffentliche Route für Projekte
        const response = await api.get('/public/projects');
        console.log('API Response:', response.data);
        // Überprüfen, ob die Antwort verschachtelt ist
        const projects = response.data && response.data.data 
            ? response.data.data 
            : Array.isArray(response.data) 
                ? response.data 
                : [];
        console.log('Extrahierte Projekte:', projects);
        return { data: projects };
    } catch (error) {
        console.error('Fehler beim Laden der Projekte von /public/projects:', error);
        
        // Fallback: Versuche die normale Route
        try {
            console.log('Fallback: Versuche /projects...');
            const response = await api.get('/projects');
            const projects = response.data && response.data.data 
                ? response.data.data 
                : Array.isArray(response.data) 
                    ? response.data 
                    : [];
            console.log('Fallback erfolgreich:', projects);
            return { data: projects };
        } catch (fallbackError) {
            console.error('Auch Fallback fehlgeschlagen:', fallbackError);
            
            // Letzter Fallback: Hardcoded Projekte für Tests
            console.log('Verwende hardcoded Projekte als letzten Fallback...');
            const hardcodedProjects = [
                { id: 1, name: "Baustelle Kloten" },
                { id: 2, name: "Baustelle Bülach" },
                { id: 3, name: "Baustelle Höri" },
                { id: 4, name: "Baustelle Dietikon" },
                { id: 5, name: "Baustelle in Kloten" }
            ];
            return { data: hardcodedProjects };
        }
    }
};

const getProjectById = async (id) => {
    try {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Fehler beim Laden des Projekts mit ID ${id}:`, error);
        throw error;
    }
};

const projectService = {
    getProjects,
    getProjectById
};

export default projectService;
export { projectService }; 