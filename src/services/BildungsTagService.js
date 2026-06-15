import api from '../api/axios';

const getAllBildungsTags = () => {
  return api.get('/public/bildungs-tags');
};

const getBildungsTagById = (id) => {
  return api.get(`/bildungs-tags/${id}`);
};

const createBildungsTag = (bildungsTagData) => {
  return api.post('/public/bildungs-tags', bildungsTagData);
};

const updateBildungsTag = (bildungsTagId, bildungsTagData) => {
  return api.put(`/public/bildungs-tags/${bildungsTagId}`, bildungsTagData);
};

const deleteBildungsTag = (bildungsTagId) => {
  return api.delete(`/public/bildungs-tags/${bildungsTagId}`);
};

const BildungsTagService = {
  getAllBildungsTags,
  getBildungsTagById,
  createBildungsTag,
  updateBildungsTag,
  deleteBildungsTag
};

export default BildungsTagService; 