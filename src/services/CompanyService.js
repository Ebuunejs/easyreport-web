import api from '../api/axios';

const getCompanies = () => {
  return api.get('/companies');
};

const getCompanyById = (id) => {
  return api.get(`/companies/${id}`);
};

const CompanyService = {
  getCompanies,
  getCompanyById
};

export default CompanyService; 