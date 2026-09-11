import api from './api';

export const offresService = {
  getOffres: async (segment) => {
    const params = segment ? { segment } : {};
    const response = await api.get('/offres', { params });
    return response.data.contenu || response.data;
  },
  
  getOffreById: async (id) => {
    const response = await api.get(`/offres/${id}`);
    return response.data;
  },

  createOffre: async (offreData) => {
    const response = await api.post('/offres', offreData);
    return response.data;
  },

  updateOffre: async (id, offreData) => {
    const response = await api.put(`/offres/${id}`, offreData);
    return response.data;
  },

  deleteOffre: async (id) => {
    const response = await api.delete(`/offres/${id}`);
    return response.data;
  },

  changerStatut: async (id, statut) => {
    const response = await api.patch(`/offres/${id}/statut?statut=${statut}`);
    return response.data;
  },

  getDisponibilites: async (offreId, dateDebut, dateFin) => {
    const response = await api.get(`/disponibilites`, {
      params: { offreId, dateDebut, dateFin }
    });
    return response.data;
  },

  addDisponibilite: async (offreId, dispoData) => {
    const payload = {
      offreId: offreId,
      pavillonId: dispoData.pavillonId,
      dateDebut: dispoData.dateDebut,
      dateFin: dispoData.dateFin,
      placesTotales: dispoData.stockInitial || 1
    };
    const response = await api.post(`/disponibilites`, payload);
    return response.data;
  },

  deleteDisponibilite: async (dispoId) => {
    const response = await api.delete(`/disponibilites/${dispoId}`);
    return response.data;
  }
};
