import api from '../api/axios';

const getProfessions = () => {
  return api.get('/public/professions');
};

const getProfessionById = (id) => {
  return api.get(`/professions/${id}`);
};

const createProfession = (data) => {
  return api.post('/professions', data);
};

const updateProfession = (id, data) => {
  return api.put(`/professions/${id}`, data);
};

const deleteProfession = (id) => {
  return api.delete(`/professions/${id}`);
};

const ProfessionService = {
  getProfessions,
  getProfessionById,
  createProfession,
  updateProfession,
  deleteProfession
};

export default ProfessionService; 