import api from './api';

export const partenairesService = {
  getPartenaires: async () => {
    const response = await api.get('/partenaires');
    return response.data;
  },

  getPartenaireById: async (id) => {
    const response = await api.get(`/partenaires/${id}`);
    return response.data;
  },

  createPartenaire: async (partenaireData) => {
    const response = await api.post('/partenaires', partenaireData);
    return response.data;
  },

  updatePartenaire: async (id, partenaireData) => {
    const response = await api.put(`/partenaires/${id}`, partenaireData);
    return response.data;
  },

  deletePartenaire: async (id) => {
    const response = await api.delete(`/partenaires/${id}`);
    return response.data;
  }
};
