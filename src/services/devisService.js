import api from './api';

export const devisService = {
  getAllDevis: async () => {
    const response = await api.get('/demandes-devis'); 
    return response.data?.contenu || response.data || [];
  },
  
  getDevisById: async (id) => {
    const response = await api.get(`/demandes-devis/${id}`);
    return response.data;
  },

  updateDevisStatus: async (id, status) => {
    const response = await api.patch(`/demandes-devis/${id}/statut`, { statut: status });
    return response.data;
  }
};
