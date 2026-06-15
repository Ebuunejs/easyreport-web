import api from '../api/axios';

class OrganizationService {
  // Abteilungen
  getAllDepartments() {
    return api.get('/departments');
  }
  
  getDepartmentById(id) {
    return api.get(`/departments/${id}`);
  }
  
  createDepartment(data) {
    return api.post('/departments', data);
  }
  
  updateDepartment(id, data) {
    return api.put(`/departments/${id}`, data);
  }
  
  deleteDepartment(id) {
    return api.delete(`/departments/${id}`);
  }
  
  // Positionen
  getAllPositions() {
    return api.get('/positions');
  }
  
  getPositionById(id) {
    return api.get(`/positions/${id}`);
  }
  
  getPositionsByDepartment(departmentId) {
    return api.get(`/departments/${departmentId}/positions`);
  }
  
  createPosition(data) {
    return api.post('/positions', data);
  }
  
  updatePosition(id, data) {
    return api.put(`/positions/${id}`, data);
  }
  
  deletePosition(id) {
    return api.delete(`/positions/${id}`);
  }
  
  // Projekte
  getAllProjects() {
    return api.get('/projects');
  }
  
  getProjectsByCompany(companyId) {
    return api.get(`/companies/${companyId}/projects`);
  }
  
  getProjectById(id) {
    return api.get(`/projects/${id}`);
  }
  
  createProject(data) {
    return api.post('/projects', data);
  }
  
  updateProject(id, data) {
    return api.put(`/projects/${id}`, data);
  }
  
  updateProjectStatus(id, status) {
    return api.put(`/projects/${id}/status`, { status });
  }
  
  deleteProject(id) {
    return api.delete(`/projects/${id}`);
  }
  
  // Projekt-Unternehmen Beziehungen
  getProjectPartnerCompanies(projectId) {
    return api.get(`/projects/${projectId}/partner-companies`);
  }
  
  attachCompanyToProject(projectId, companyId) {
    return api.post(`/projects/${projectId}/attach-company`, { company_id: companyId });
  }
  
  detachCompanyFromProject(projectId, companyId) {
    return api.post(`/projects/${projectId}/detach-company`, { company_id: companyId });
  }
  
  setMainCompanyForProject(projectId, companyId) {
    return api.post(`/projects/${projectId}/set-main-company`, { company_id: companyId });
  }
  
  // Unternehmen
  getAllCompanies() {
    return api.get('/companies');
  }
  
  // Subunternehmen
  getMainCompanies() {
    return api.get('/companies', { params: { type: 'main' } });
  }
  
  getSubcompanies() {
    return api.get('/companies', { params: { type: 'sub' } });
  }
  
  getCompanySubcompanies(companyId) {
    return api.get(`/companies/${companyId}/subcompanies`);
  }
}

export default new OrganizationService(); 