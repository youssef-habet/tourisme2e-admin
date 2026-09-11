import api from './api';

export const groupesService = {
  getGroupesAdmin: async () => {
    const response = await api.get('/groupes');
    return response.data.contenu || response.data;
  },
  
  getGroupeById: async (id) => {
    const response = await api.get(`/groupes/${id}`);
    return response.data;
  },

  validerGroupe: async (id) => {
    const response = await api.patch(`/groupes/${id}/valider`, { action: 'APPROUVER' });
    return response.data;
  },

  confirmerDevis: async (id) => {
    const response = await api.patch(`/groupes/${id}/devis/confirmer`);
    return response.data;
  },

  genererDevis: async (id, payload) => {
    const response = await api.post(`/groupes/${id}/devis/generer`, payload);
    return response.data;
  },

  telechargerDevisPdf: async (id) => {
    const response = await api.get(`/groupes/${id}/devis.pdf`, {
      responseType: 'blob' // Important to handle binary data
    });
    return response.data;
  }
};
